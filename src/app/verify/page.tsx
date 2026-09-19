"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import { 
  FileCheck2, 
  QrCode, 
  Upload, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  History, 
  HelpCircle, 
  Copy, 
  Check, 
  Lock, 
  ShieldAlert,
  ArrowRight,
  Info,
  Camera,
  CameraOff,
  Globe,
  PhoneCall,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  WifiOff
} from "lucide-react";
import { PublicVerificationResponse, VerificationStatus } from "@/lib/types/domain";

type Language = "en" | "te" | "hi";

const I18N = {
  en: {
    title: "Verify Land Record Evidence",
    subtitle: "Check an issued reference or compare an approved file against the permissioned ledger.",
    tabRef: "Enter Reference",
    tabUpload: "Upload Document",
    tabQr: "Scan QR Code",
    refLabel: "Verification Reference Number",
    refPlaceholder: "e.g. BHS-2M7D-9KQX",
    btnVerify: "Verify Record",
    btnVerifying: "Checking Fingerprint...",
    privacyNote: "Privacy note: Do not upload Aadhaar, identity documents, or unrelated personal files.",
    howItWorks: "How verification works",
    contactAuth: "Contact issuing authority",
    lowBandwidth: "Low-bandwidth mode",
    whatWasChecked: "What was checked in this verification?",
    disclaimerTitle: "Mandatory Product Legal Disclaimer",
  },
  te: {
    title: "భూమి రికార్డు సాక్ష్యాల ధృవీకరణ",
    subtitle: "అనుమతించబడిన లేడ్జర్ ద్వారా జారీ చేసిన రిఫరెన్స్ లేదా ఆమోదిత పత్రాన్ని తనిఖీ చేయండి.",
    tabRef: "రిఫరెన్స్ నమోదు",
    tabUpload: "పత్రం అప్‌లోడ్",
    tabQr: "QR కోడ్ స్కాన్",
    refLabel: "ధృవీకరణ రిఫరెన్స్ సంఖ్య",
    refPlaceholder: "ఉదా. BHS-2M7D-9KQX",
    btnVerify: "రికార్డును ధృవీకరించండి",
    btnVerifying: "తనిఖీ జరుగుతోంది...",
    privacyNote: "గోప్యతా సూచన: ఆధార్ లేదా వ్యక్తిగత గుర్తింపు కార్డులను అప్‌లోడ్ చేయవద్దు.",
    howItWorks: "ధృవీకరణ ఎలా పనిచేస్తుంది",
    contactAuth: "సంబంధిత అధికారులను సంప్రదించండి",
    lowBandwidth: "తక్కువ బ్యాండ్‌విడ్త్ మోడ్",
    whatWasChecked: "ఈ ధృవీకరణలో ఏమి తనిఖీ చేయబడింది?",
    disclaimerTitle: "చట్టపరమైన హక్కు నిరాకరణ పత్రం",
  },
  hi: {
    title: "भू-अभिलेख साक्ष्य सत्यापन",
    subtitle: "अनुमति-प्राप्त लेज़र के माध्यम से जारी संदर्भ या स्वीकृत दस्तावेज़ की प्रामाणिकता जांचें।",
    tabRef: "संदर्भ दर्ज करें",
    tabUpload: "दस्तावेज़ अपलोड करें",
    tabQr: "QR कोड स्कैन करें",
    refLabel: "सत्यापन संदर्भ संख्या",
    refPlaceholder: "उदा. BHS-2M7D-9KQX",
    btnVerify: "सत्यापित करें",
    btnVerifying: "जांच जारी है...",
    privacyNote: "गोपनीयता सूचना: आधार या व्यक्तिगत पहचान पत्र अपलोड न करें।",
    howItWorks: "सत्यापन कैसे काम करता है",
    contactAuth: "जारीकर्ता प्राधिकरण से संपर्क करें",
    lowBandwidth: "कम बैंडविड्थ मोड",
    whatWasChecked: "इस सत्यापन में क्या जांचा गया?",
    disclaimerTitle: "अनिवार्य कानूनी स्वामित्व अस्वीकरण",
  },
};

function VerifyContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get("ref") || "";

  const [lang, setLang] = useState<Language>("en");
  const [lowBandwidth, setLowBandwidth] = useState(false);
  const [activeTab, setActiveTab] = useState<"ref" | "upload" | "qr">("ref");
  const [referenceInput, setReferenceInput] = useState(initialRef);
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [fileText, setFileText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PublicVerificationResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  // Modals & Panels
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  // Camera QR Scanning
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const t = I18N[lang];

  useEffect(() => {
    if (initialRef) {
      handleVerifyReference(initialRef);
    }
  }, [initialRef]);

  // Generate QR code whenever verification result changes
  useEffect(() => {
    if (result && result.verificationReference && result.verificationReference !== "N/A" && !lowBandwidth) {
      const url = `${window.location.origin}/verify?ref=${encodeURIComponent(result.verificationReference)}`;
      QRCode.toDataURL(url, { width: 140, margin: 1 })
        .then(setQrDataUrl)
        .catch(() => setQrDataUrl(""));
    } else {
      setQrDataUrl("");
    }
  }, [result, lowBandwidth]);

  // Handle Camera start/stop
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      setCameraError("Camera permission denied or camera unavailable. Please use manual reference entry.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleVerifyReference = async (refValue?: string) => {
    const targetRef = refValue || referenceInput;
    if (!targetRef.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/v1/verify/reference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: targetRef.trim() }),
      });
      const data: PublicVerificationResponse = await res.json();
      setResult(data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      setResult({
        verificationReference: targetRef,
        status: "UNAVAILABLE",
        statusMessage: "Unable to complete verification check due to network failure. Please retry.",
        issuingAuthority: "State Revenue Department",
        issuedAt: new Date().toISOString(),
        parcelReferenceMasked: "XX-***-XXX",
        nextStep: "Check internet connectivity and try again.",
        legalDisclaimer:
          "This result confirms an evidence match to an authorized record at the time shown. It is not, by itself, a determination of legal title, ownership, encumbrance, or boundary.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDocument = async () => {
    if (!fileInput && !fileText) return;

    setLoading(true);
    setResult(null);

    try {
      let content = fileText;
      let fileName = "uploaded_extract.pdf";

      if (fileInput) {
        fileName = fileInput.name;
        content = await fileInput.text();
      }

      const res = await fetch("/api/v1/verify/document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentContent: content,
          fileName,
        }),
      });

      const data: PublicVerificationResponse = await res.json();
      setResult(data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      setResult({
        verificationReference: "N/A",
        status: "UNAVAILABLE",
        statusMessage: "Document processing failed. Please retry with a valid official extract.",
        issuingAuthority: "State Revenue Department",
        issuedAt: new Date().toISOString(),
        parcelReferenceMasked: "XX-***-XXX",
        nextStep: "Retry with an approved PDF format or contact the issuing authority.",
        legalDisclaimer:
          "This result confirms an evidence match to an authorized record at the time shown. It is not, by itself, a determination of legal title, ownership, encumbrance, or boundary.",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case "VERIFIED":
        return {
          icon: <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />,
          bgColor: "bg-emerald-50 border-emerald-300 text-emerald-900",
          badgeBg: "bg-emerald-600 text-white",
          title: "Evidence Verified",
        };
      case "MISMATCH":
        return {
          icon: <XCircle className="w-8 h-8 text-rose-600 shrink-0" />,
          bgColor: "bg-rose-50 border-rose-300 text-rose-900",
          badgeBg: "bg-rose-600 text-white",
          title: "Evidence Mismatch",
        };
      case "DISPUTED":
        return {
          icon: <AlertTriangle className="w-8 h-8 text-red-600 shrink-0" />,
          bgColor: "bg-red-50 border-red-300 text-red-950",
          badgeBg: "bg-red-600 text-white",
          title: "Subject to Authorized Dispute / Hold",
        };
      case "PENDING_REVIEW":
        return {
          icon: <Clock className="w-8 h-8 text-amber-600 shrink-0" />,
          bgColor: "bg-amber-50 border-amber-300 text-amber-950",
          badgeBg: "bg-amber-500 text-slate-950 font-bold",
          title: "Official Review Pending",
        };
      case "SUPERSEDED":
        return {
          icon: <History className="w-8 h-8 text-purple-600 shrink-0" />,
          bgColor: "bg-purple-50 border-purple-300 text-purple-950",
          badgeBg: "bg-purple-600 text-white",
          title: "Newer Authorized Record Exists (Superseded)",
        };
      case "UNAVAILABLE":
      default:
        return {
          icon: <Info className="w-8 h-8 text-slate-600 shrink-0" />,
          bgColor: "bg-slate-100 border-slate-300 text-slate-900",
          badgeBg: "bg-slate-600 text-white",
          title: "Record Unavailable",
        };
    }
  };

  return (
    <div className={`max-w-4xl mx-auto px-4 py-8 space-y-6 ${lowBandwidth ? "font-sans grayscale-[0.2]" : ""}`}>
      {/* Top Utility Bar: Language Selector & Low-Bandwidth Mode */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-slate-500" />
          <span className="font-semibold text-slate-600">Language:</span>
          <button
            onClick={() => setLang("en")}
            className={`px-2 py-0.5 rounded ${lang === "en" ? "bg-slate-900 text-white font-bold" : "text-slate-600 hover:text-slate-900"}`}
          >
            English
          </button>
          <button
            onClick={() => setLang("te")}
            className={`px-2 py-0.5 rounded ${lang === "te" ? "bg-slate-900 text-white font-bold" : "text-slate-600 hover:text-slate-900"}`}
          >
            తెలుగు
          </button>
          <button
            onClick={() => setLang("hi")}
            className={`px-2 py-0.5 rounded ${lang === "hi" ? "bg-slate-900 text-white font-bold" : "text-slate-600 hover:text-slate-900"}`}
          >
            हिन्दी
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setLowBandwidth(!lowBandwidth)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-colors ${
              lowBandwidth ? "bg-amber-100 text-amber-900 border-amber-300 font-bold" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <WifiOff className="w-3 h-3" />
            <span>{t.lowBandwidth}</span>
          </button>
          <button
            onClick={() => setShowHowItWorks(true)}
            className="text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Help</span>
          </button>
        </div>
      </div>

      {/* Header Title */}
      <div className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2.5">
          <FileCheck2 className="w-7 h-7 text-emerald-600 shrink-0" />
          <span>{t.title}</span>
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{t.subtitle}</p>
      </div>

      {/* Input Tabs Area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Tab Buttons (Scan QR, Enter reference, Upload document) */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs sm:text-sm">
          <button
            onClick={() => {
              setActiveTab("qr");
              stopCamera();
            }}
            className={`flex-1 py-3.5 px-3 font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === "qr" ? "border-emerald-600 text-emerald-700 bg-white" : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>{t.tabQr}</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("ref");
              stopCamera();
            }}
            className={`flex-1 py-3.5 px-3 font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === "ref" ? "border-emerald-600 text-emerald-700 bg-white" : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Search className="w-4 h-4" />
            <span>{t.tabRef}</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("upload");
              stopCamera();
            }}
            className={`flex-1 py-3.5 px-3 font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === "upload" ? "border-emerald-600 text-emerald-700 bg-white" : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>{t.tabUpload}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 sm:p-8 space-y-5">
          {/* Reference Tab */}
          {activeTab === "ref" && (
            <div className="space-y-4">
              <label className="block text-xs sm:text-sm font-bold text-slate-800">
                {t.refLabel}
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder={t.refPlaceholder}
                  value={referenceInput}
                  onChange={(e) => setReferenceInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleVerifyReference()}
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm sm:text-base text-slate-900 placeholder-slate-400"
                />
                <button
                  onClick={() => handleVerifyReference()}
                  disabled={!referenceInput.trim() || loading}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shrink-0 shadow-sm"
                >
                  {loading ? (
                    <span>{t.btnVerifying}</span>
                  ) : (
                    <>
                      <span>{t.btnVerify}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
              <div className="text-[11px] text-slate-500">
                Format: 12-character alphanumeric code printed beside the QR code on issued extracts.
              </div>
            </div>
          )}

          {/* Document Upload Tab */}
          {activeTab === "upload" && (
            <div className="space-y-4">
              <label className="block text-xs sm:text-sm font-bold text-slate-800">
                Upload Official Evidence Document (PDF / RoR Extract)
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-emerald-500 transition-colors bg-slate-50 space-y-3">
                <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="text-xs sm:text-sm text-slate-600">
                  <label className="font-bold text-emerald-600 hover:text-emerald-500 cursor-pointer">
                    Click to select file
                    <input
                      type="file"
                      accept=".pdf,.txt"
                      onChange={(e) => setFileInput(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                  <span> or paste extract content below</span>
                </div>
                {fileInput && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-md text-xs font-mono">
                    <span>{fileInput.name}</span>
                    <span>({Math.round(fileInput.size / 1024)} KB)</span>
                  </div>
                )}
              </div>

              <textarea
                rows={3}
                placeholder="Or paste official extract text content here..."
                value={fileText}
                onChange={(e) => setFileText(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />

              <button
                onClick={handleVerifyDocument}
                disabled={(!fileInput && !fileText) || loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <span>Calculating SHA-256 Fingerprint...</span> : <span>Verify Document Fingerprint</span>}
              </button>
            </div>
          )}

          {/* QR Code Tab (with Camera Scanner & Manual Fallback) */}
          {activeTab === "qr" && (
            <div className="space-y-4">
              <div className="text-center max-w-md mx-auto space-y-2">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Live Camera QR Code Scanner</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Hold your camera over the QR code printed on the official land extract.
                </p>
              </div>

              {/* Video Scanner Element */}
              <div className="max-w-sm mx-auto bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 relative aspect-video flex items-center justify-center text-white">
                {cameraActive ? (
                  <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                ) : (
                  <div className="text-center p-4 space-y-2">
                    <Camera className="w-8 h-8 text-slate-500 mx-auto" />
                    <p className="text-xs text-slate-400">Camera preview is off.</p>
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-3">
                {!cameraActive ? (
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Start Camera Scanner</span>
                  </button>
                ) : (
                  <button
                    onClick={stopCamera}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <CameraOff className="w-4 h-4" />
                    <span>Stop Camera</span>
                  </button>
                )}
              </div>

              {cameraError && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 text-center">
                  {cameraError}
                </div>
              )}

              {/* Manual fallback */}
              <div className="pt-2 border-t border-slate-200 max-w-md mx-auto space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Or enter scanned QR text / reference manually:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter scanned code (e.g. BHS-2M7D-9KQX)..."
                    value={referenceInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setReferenceInput(val);
                      if (val.includes("ref=")) {
                        const extracted = val.split("ref=")[1]?.split("&")[0];
                        if (extracted) handleVerifyReference(extracted);
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                  <button
                    onClick={() => handleVerifyReference()}
                    disabled={!referenceInput.trim() || loading}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl"
                  >
                    Process
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Note (always visible below input per wireframe) */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-900">
            <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{t.privacyNote}</span>
          </div>
        </div>
      </div>

      {/* Verification Result Display */}
      {result && (
        <div ref={resultRef} role="status" aria-live="polite" className="space-y-6">
          <div className={`rounded-2xl border p-6 sm:p-8 space-y-6 shadow-sm ${getStatusBadge(result.status).bgColor}`}>
            {/* Status Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60">
              <div className="flex items-start sm:items-center gap-3">
                {getStatusBadge(result.status).icon}
                <div>
                  <span className={`inline-block px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wider rounded-md ${getStatusBadge(result.status).badgeBg}`}>
                    {result.status}
                  </span>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
                    {getStatusBadge(result.status).title}
                  </h2>
                </div>
              </div>

              {result.verificationReference && result.verificationReference !== "N/A" && (
                <div className="flex items-center gap-2 bg-white/90 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-800">
                  <span>Ref: <strong>{result.verificationReference}</strong></span>
                  <button
                    onClick={() => copyToClipboard(result.verificationReference)}
                    className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800"
                    title="Copy reference"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>

            {/* Explanation Message */}
            <p className="text-sm sm:text-base font-semibold leading-relaxed">
              {result.statusMessage}
            </p>

            {/* Result Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-white/80 p-4 rounded-xl border border-slate-200/60">
              <div>
                <span className="text-slate-500 block">Issuing Authority</span>
                <span className="font-bold text-slate-900">{result.issuingAuthority}</span>
              </div>

              <div>
                <span className="text-slate-500 block">Record Issue Timestamp</span>
                <span className="font-bold text-slate-900">{new Date(result.issuedAt).toLocaleString("en-IN")}</span>
              </div>

              <div>
                <span className="text-slate-500 block">Masked Parcel Reference</span>
                <span className="font-mono font-bold text-slate-900">{result.parcelReferenceMasked}</span>
              </div>

              <div>
                <span className="text-slate-500 block">Evidence Type</span>
                <span className="font-bold text-slate-900">{result.evidenceType || "Official Land Extract"}</span>
              </div>
            </div>

            {/* Scannable Verification QR Code */}
            {qrDataUrl && !lowBandwidth && (
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                <img src={qrDataUrl} alt="Verification QR Code" className="w-24 h-24 border rounded-lg shrink-0" />
                <div className="space-y-1 text-center sm:text-left text-xs">
                  <h4 className="font-bold text-slate-900">Privacy-Preserving Verification QR Code</h4>
                  <p className="text-slate-600">
                    This QR code directly verifies this authentic evidence event without exposing owner names, survey boundary coordinates, or personal identification.
                  </p>
                </div>
              </div>
            )}

            {/* Mandatory Legal Title Disclaimer */}
            <div className="bg-slate-900 text-slate-300 p-4 rounded-xl text-xs space-y-1.5 border border-slate-800">
              <div className="flex items-center gap-1.5 font-bold text-amber-400 uppercase tracking-wider text-[10px]">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{t.disclaimerTitle}</span>
              </div>
              <p className="leading-relaxed">
                {result.legalDisclaimer}
              </p>
              <div className="flex flex-wrap gap-4 pt-2 text-[11px]">
                <button
                  onClick={() => setShowHowItWorks(true)}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold underline flex items-center gap-1"
                >
                  <span>{t.howItWorks}</span>
                </button>
                <button
                  onClick={() => setShowContactModal(true)}
                  className="text-blue-400 hover:text-blue-300 font-semibold underline flex items-center gap-1"
                >
                  <span>{t.contactAuth}</span>
                </button>
              </div>
            </div>
          </div>

          {/* What Was Checked Section (per Section 2 wireframe) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <span>{t.whatWasChecked}</span>
            </h3>
            <ul className="text-xs text-slate-600 space-y-2 list-disc pl-5">
              <li>
                <strong>Reference / Document Fingerprint:</strong> Canonical SHA-256 integrity hash verification against private off-chain Amazon S3 evidence storage.
              </li>
              <li>
                <strong>Authorized Source & Event Timestamp:</strong> Traceable provenance to official AP Revenue, Registration, or Survey departments recorded in permissioned ledger.
              </li>
              <li>
                <strong>Current Dispute / Supersession Status:</strong> Active judicial injunction orders or newer mutation supersession events verified (a dispute or newer deed immediately overrides positive verification).
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* How Verification Works Modal */}
      {showHowItWorks && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-bold text-base text-slate-900">How BhuSetu Verification Works</h3>
              <button
                onClick={() => setShowHowItWorks(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                <strong>1. Cryptographic Fingerprinting:</strong> Every official land document issued by the Revenue or Registration department receives a canonical SHA-256 fingerprint. Any 1-character alteration produces a deterministic <code>MISMATCH</code>.
              </p>
              <p>
                <strong>2. Private Off-Chain Storage:</strong> Full deeds and personal identification are encrypted in AWS S3 and DynamoDB. Public users can verify authenticity without exposing sensitive citizen data.
              </p>
              <p>
                <strong>3. Multi-Org Permissioned Ledger:</strong> Changes require multi-org endorsement across Revenue, Registration, and Survey departments.
              </p>
              <p>
                <strong>4. Legal Dispute Priority:</strong> If a court injunction or dispute hold is flagged, positive verification is blocked to protect citizens from buying encumbered property.
              </p>
            </div>

            <button
              onClick={() => setShowHowItWorks(false)}
              className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Official Escalation Contact Directory Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-slate-900">
                <PhoneCall className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base">Competent Authority Contact Directory</h3>
              </div>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              For legal title certification, boundary demarcation, or dispute resolution, contact the authorized district offices:
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">Mandal Revenue Office / Tehsildar Tenali</div>
                <div className="text-slate-600">Matters: Record of Rights (RoR), Adangal, Mutations, Succession Orders</div>
                <div className="text-slate-500 font-mono">Jurisdiction: Tenali Mandal, Guntur District</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">Sub-Registrar Office Tenali</div>
                <div className="text-slate-600">Matters: Registered Sale Deeds, Gift Deeds, Encumbrance Certificates (EC)</div>
                <div className="text-slate-500 font-mono">Department: Registration and Stamps Department, AP</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">District Civil Court Tenali</div>
                <div className="text-slate-600">Matters: Title Suits, Injunctions, Partition Suits, Dispute Holds</div>
                <div className="text-slate-500 font-mono">Judicial Reference: OS 442/2025 & Civil Injunctions</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">Assistant Director of Survey & Land Records</div>
                <div className="text-slate-600">Matters: Cadastral Field Measurement Books (FMB), ULPIN Demarcation</div>
                <div className="text-slate-500 font-mono">Collectorate Compound, Guntur</div>
              </div>
            </div>

            <button
              onClick={() => setShowContactModal(false)}
              className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl"
            >
              Close Directory
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-3">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto" />
          <p className="text-slate-600 text-sm font-semibold">Loading verification interface...</p>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
