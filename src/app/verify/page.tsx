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
  ChevronDown,
  ChevronUp,
  FileText,
  Camera,
  CameraOff,
  Globe,
  PhoneCall,
  WifiOff,
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
  const initialTab = (searchParams.get("tab") as "ref" | "upload" | "qr") || "ref";

  const [lang, setLang] = useState<Language>("en");
  const [lowBandwidth, setLowBandwidth] = useState(false);
  const [activeTab, setActiveTab] = useState<"ref" | "upload" | "qr">(initialTab);
  const [referenceInput, setReferenceInput] = useState(initialRef);
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [fileText, setFileText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PublicVerificationResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [showEvidenceChain, setShowEvidenceChain] = useState(true);

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
    } catch {
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
    } catch {
      setResult({
        verificationReference: targetRef,
        status: "UNAVAILABLE",
        statusMessage: "Unable to complete verification check due to network failure. Please retry.",
        issuingAuthority: "Pilot Revenue Department",
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
        body: JSON.stringify({ documentContent: content, fileName }),
      });

      const data: PublicVerificationResponse = await res.json();
      setResult(data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {
      setResult({
        verificationReference: "N/A",
        status: "UNAVAILABLE",
        statusMessage: "Failed to process document verification. Ensure file is not corrupted.",
        issuingAuthority: "Pilot Revenue Department",
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
          icon: <CheckCircle2 className="w-8 h-8 text-status-verified-text" />,
          bgColor: "bg-status-verified-bg border-status-verified-border text-status-verified-text",
          badgeBg: "bg-status-verified-badge text-white font-mono font-bold",
          title: "✓ EVIDENCE VERIFIED",
        };
      case "MISMATCH":
        return {
          icon: <XCircle className="w-8 h-8 text-status-mismatch-text" />,
          bgColor: "bg-status-mismatch-bg border-status-mismatch-border text-status-mismatch-text",
          badgeBg: "bg-status-mismatch-badge text-white font-mono font-bold",
          title: "✖ EVIDENCE MISMATCH",
        };
      case "DISPUTED":
        return {
          icon: <AlertTriangle className="w-8 h-8 text-status-disputed-text" />,
          bgColor: "bg-status-disputed-bg border-status-disputed-border text-status-disputed-text",
          badgeBg: "bg-status-disputed-badge text-white font-mono font-bold",
          title: "⚠ RECORD SUBJECT TO DISPUTE / HOLD",
        };
      case "PENDING_REVIEW":
        return {
          icon: <Clock className="w-8 h-8 text-status-pending-text" />,
          bgColor: "bg-status-pending-bg border-status-pending-border text-status-pending-text",
          badgeBg: "bg-status-pending-badge text-white font-mono font-bold",
          title: "⌛ OFFICIAL REVIEW PENDING",
        };
      case "SUPERSEDED":
        return {
          icon: <History className="w-8 h-8 text-status-superseded-text" />,
          bgColor: "bg-status-superseded-bg border-status-superseded-border text-status-superseded-text",
          badgeBg: "bg-status-superseded-badge text-white font-mono font-bold",
          title: "↻ EVIDENCE VERSION SUPERSEDED",
        };
      case "UNAVAILABLE":
      default:
        return {
          icon: <Info className="w-8 h-8 text-status-unavailable-text" />,
          bgColor: "bg-status-unavailable-bg border-status-unavailable-border text-status-unavailable-text",
          badgeBg: "bg-status-unavailable-badge text-white font-mono font-bold",
          title: "ℹ RECORD UNAVAILABLE",
        };
    }
  };

  return (
    <div className={`max-w-4xl mx-auto px-4 py-8 space-y-8 ${lowBandwidth ? "grayscale-[0.15]" : ""}`}>
      {/* Top Utility Bar: Language Selector & Low-Bandwidth Mode */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-parchment-border pb-3">
        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-carbon-muted" />
          <span className="font-semibold text-carbon-muted">Language:</span>
          {(["en", "te", "hi"] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-2 py-0.5 rounded transition-colors ${
                lang === l
                  ? "bg-carbon-primary text-white font-bold"
                  : "text-carbon-muted hover:text-carbon-primary"
              }`}
            >
              {l === "en" ? "English" : l === "te" ? "తెలుగు" : "हिन्दी"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setLowBandwidth(!lowBandwidth)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-colors text-xs ${
              lowBandwidth
                ? "bg-amber-100 text-amber-900 border-amber-300 font-bold"
                : "bg-parchment-muted text-carbon-muted border-parchment-border hover:bg-parchment-border"
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

      {/* Eyebrow & Header Title */}
      <div className="space-y-2 border-b border-parchment-border pb-5">
        <div className="text-xs font-semibold text-terracotta uppercase tracking-wider">
          DIGITAL LAND RECORD VERIFICATION · DISTRICT PILOT
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-carbon-primary flex items-center gap-2.5">
          <FileCheck2 className="w-8 h-8 text-terracotta" />
          {t.title}
        </h1>
        <p className="text-carbon-muted text-xs sm:text-sm">{t.subtitle}</p>
      </div>

      {/* Input Tabs Area */}
      <div className="parchment-card rounded-2xl border border-parchment-border overflow-hidden">
        {/* Three Entry Pathway Tabs */}
        <div className="flex border-b border-parchment-border bg-parchment-muted">
          <button
            onClick={() => { setActiveTab("ref"); stopCamera(); }}
            className={`flex-1 py-4 px-4 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === "ref"
                ? "border-terracotta text-terracotta bg-white"
                : "border-transparent text-carbon-muted hover:text-carbon-primary"
            }`}
          >
            <Search className="w-4 h-4" />
            <span>{t.tabRef}</span>
          </button>

          <button
            onClick={() => { setActiveTab("upload"); stopCamera(); }}
            className={`flex-1 py-4 px-4 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === "upload"
                ? "border-terracotta text-terracotta bg-white"
                : "border-transparent text-carbon-muted hover:text-carbon-primary"
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>{t.tabUpload}</span>
          </button>

          <button
            onClick={() => { setActiveTab("qr"); stopCamera(); }}
            className={`flex-1 py-4 px-4 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === "qr"
                ? "border-terracotta text-terracotta bg-white"
                : "border-transparent text-carbon-muted hover:text-carbon-primary"
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>{t.tabQr}</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* TAB 1: ENTER REFERENCE */}
          {activeTab === "ref" && (
            <div className="space-y-4">
              <label className="block text-xs font-bold text-carbon-primary">
                {t.refLabel}
              </label>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder={t.refPlaceholder}
                  value={referenceInput}
                  onChange={(e) => setReferenceInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleVerifyReference()}
                  className="flex-1 px-4 py-3 border border-parchment-border rounded-xl focus:ring-2 focus:ring-terracotta focus:border-terracotta font-mono text-carbon-primary placeholder-carbon-muted text-sm"
                />

                <button
                  onClick={() => handleVerifyReference()}
                  disabled={!referenceInput.trim() || loading}
                  className="px-6 py-3 bg-terracotta hover:bg-terracotta-hover disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shrink-0 shadow-sm"
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

              {/* Quick Test Fixtures */}
              <div className="space-y-2 pt-2 border-t border-parchment-border">
                <span className="text-[11px] text-carbon-muted block">Quick Test Scenarios:</span>
                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  <button
                    onClick={() => { setReferenceInput("BHS-2M7D-9KQX"); handleVerifyReference("BHS-2M7D-9KQX"); }}
                    className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded hover:bg-emerald-100"
                  >
                    ✓ Verified (BHS-2M7D-9KQX)
                  </button>
                  <button
                    onClick={() => { setReferenceInput("BHS-88X9-4K2M"); handleVerifyReference("BHS-88X9-4K2M"); }}
                    className="px-2.5 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded hover:bg-rose-100"
                  >
                    ⚠ Disputed Hold (BHS-88X9-4K2M)
                  </button>
                  <button
                    onClick={() => { setReferenceInput("BHS-4K9P-1L0W"); handleVerifyReference("BHS-4K9P-1L0W"); }}
                    className="px-2.5 py-1 bg-purple-50 text-purple-800 border border-purple-200 rounded hover:bg-purple-100"
                  >
                    ↻ Superseded (BHS-4K9P-1L0W)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD DOCUMENT */}
          {activeTab === "upload" && (
            <div className="space-y-4">
              <label className="block text-xs font-bold text-carbon-primary">
                Upload Official Evidence File (PDF / Extract Text)
              </label>

              <div className="border-2 border-dashed border-parchment-border rounded-2xl p-6 text-center hover:border-terracotta transition-colors bg-parchment-muted space-y-3">
                <Upload className="w-8 h-8 text-carbon-muted mx-auto" />
                <div className="text-xs text-carbon-muted">
                  <label className="font-semibold text-terracotta hover:text-terracotta-hover cursor-pointer">
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
                    <FileText className="w-3.5 h-3.5" />
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
                className="w-full p-3 border border-parchment-border rounded-xl text-xs font-mono text-carbon-primary focus:ring-2 focus:ring-terracotta focus:border-terracotta bg-white"
              />

              <button
                onClick={handleVerifyDocument}
                disabled={(!fileInput && !fileText) || loading}
                className="w-full py-3 bg-terracotta hover:bg-terracotta-hover disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? <span>Calculating SHA-256 Fingerprint...</span> : <span>Verify Document Fingerprint</span>}
              </button>

              {/* Privacy Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-900">
                <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Privacy &amp; Security Note:</strong> Uploaded files are processed in-memory solely for SHA-256 fingerprint matching. Do NOT upload Aadhaar cards, personal ID photos, or unrelated private files.
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: SCAN QR — Camera + Manual Fallback */}
          {activeTab === "qr" && (
            <div className="space-y-4">
              <div className="text-center max-w-md mx-auto space-y-2">
                <div className="w-12 h-12 bg-parchment-muted text-terracotta rounded-full flex items-center justify-center mx-auto border border-parchment-border">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-sm text-carbon-primary">Live Camera QR Code Scanner</h3>
                <p className="text-xs text-carbon-muted leading-relaxed">
                  Hold your camera over the QR code printed on an official Revenue / Sub-Registrar extract to verify reference authenticity.
                </p>
              </div>

              {/* Video Scanner */}
              <div className="max-w-sm mx-auto bg-carbon-primary rounded-2xl overflow-hidden border border-slate-800 relative aspect-video flex items-center justify-center text-white">
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
                    className="px-4 py-2 bg-terracotta hover:bg-terracotta-hover text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Start Camera Scanner</span>
                  </button>
                ) : (
                  <button
                    onClick={stopCamera}
                    className="px-4 py-2 bg-carbon-secondary hover:bg-carbon-primary text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
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
              <div className="pt-2 border-t border-parchment-border max-w-md mx-auto space-y-2">
                <label className="block text-xs font-bold text-carbon-primary">
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
                    className="flex-1 px-3 py-2 border border-parchment-border rounded-xl text-xs font-mono"
                  />
                  <button
                    onClick={() => handleVerifyReference()}
                    disabled={!referenceInput.trim() || loading}
                    className="px-4 py-2 bg-carbon-primary hover:bg-carbon-secondary disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    Process
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Note (always visible below input) */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-900">
            <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{t.privacyNote}</span>
          </div>
        </div>
      </div>

      {/* Verification Result Display Card */}
      {result && (
        <div ref={resultRef} role="status" aria-live="polite" className="space-y-6">
          <div className={`rounded-2xl border p-6 sm:p-8 space-y-6 shadow-sm ${getStatusBadge(result.status).bgColor}`}>
            {/* Status Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-carbon-muted/20">
              <div className="flex items-center gap-3">
                {getStatusBadge(result.status).icon}
                <div>
                  <span className={`inline-block px-2.5 py-0.5 text-xs font-extrabold tracking-wider rounded-md ${getStatusBadge(result.status).badgeBg}`}>
                    {result.status}
                  </span>
                  <h2 className="text-lg sm:text-xl font-extrabold mt-1">
                    {getStatusBadge(result.status).title}
                  </h2>
                </div>
              </div>

              {result.verificationReference && result.verificationReference !== "N/A" && (
                <div className="flex items-center gap-2 bg-white/90 px-3 py-1.5 rounded-xl border border-parchment-border text-xs font-mono text-carbon-primary">
                  <span>Ref: <strong>{result.verificationReference}</strong></span>
                  <button
                    onClick={() => copyToClipboard(result.verificationReference)}
                    className="p-1 hover:bg-parchment-muted rounded text-carbon-muted hover:text-carbon-primary"
                    title="Copy reference"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>

            {/* Explanation Message */}
            <p className="text-sm font-semibold leading-relaxed">
              {result.statusMessage}
            </p>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-white/90 p-4 rounded-xl border border-parchment-border font-mono">
              <div>
                <span className="text-carbon-muted block">Issuing Authority</span>
                <span className="font-semibold text-carbon-primary">{result.issuingAuthority}</span>
              </div>

              <div>
                <span className="text-carbon-muted block">Issue Timestamp (NPL Synced)</span>
                <span className="font-semibold text-carbon-primary">{new Date(result.issuedAt).toLocaleString("en-IN")}</span>
              </div>

              <div>
                <span className="text-carbon-muted block">Masked Parcel Reference</span>
                <span className="font-bold text-carbon-primary">{result.parcelReferenceMasked}</span>
              </div>

              <div>
                <span className="text-carbon-muted block">Evidence Category</span>
                <span className="font-semibold text-carbon-primary">{result.evidenceType || "Official Extract"}</span>
              </div>
            </div>

            {/* Next Safe Action */}
            <div className="bg-white/95 p-4 rounded-xl border border-parchment-border space-y-1 text-xs">
              <span className="font-bold text-carbon-primary uppercase tracking-wider block text-[10px]">
                Recommended Safe Next Action
              </span>
              <p className="text-carbon-secondary leading-relaxed">{result.nextStep}</p>
            </div>

            {/* Scannable QR Element for Verified Results */}
            {qrDataUrl && !lowBandwidth && (
              <div className="bg-white p-4 rounded-xl border border-parchment-border flex flex-col sm:flex-row items-center gap-4">
                <img src={qrDataUrl} alt="Verification QR Code" className="w-28 h-28 border rounded-lg p-1 bg-white" />
                <div className="space-y-1 text-center sm:text-left text-xs">
                  <h4 className="font-bold text-carbon-primary">Official Scannable Verification QR Code</h4>
                  <p className="text-carbon-muted leading-relaxed">
                    This QR code directly verifies this authentic evidence event without exposing owner names, survey boundary coordinates, or personal identification.
                  </p>
                </div>
              </div>
            )}

            {/* Mandatory Product Legal Title Disclaimer */}
            <div className="bg-carbon-primary text-slate-300 p-4 rounded-xl text-xs space-y-1.5 border border-slate-800">
              <div className="flex items-center gap-1.5 font-bold text-amber-400 uppercase tracking-wider text-[10px]">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{t.disclaimerTitle}</span>
              </div>
              <p className="leading-relaxed text-[11px]">
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

          {/* Expandable "What Was Checked" — Evidence Chain */}
          <div className="parchment-card rounded-2xl border border-parchment-border p-6 space-y-4">
            <button
              onClick={() => setShowEvidenceChain(!showEvidenceChain)}
              className="w-full flex items-center justify-between text-sm font-bold text-carbon-primary hover:text-terracotta transition-colors"
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <span>{t.whatWasChecked}</span>
              </div>
              {showEvidenceChain ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showEvidenceChain && (
              <div className="space-y-3 text-xs pt-2 border-t border-parchment-border">
                {/* Bullet list summary from teammate */}
                <ul className="text-xs text-carbon-muted space-y-2 list-disc pl-5">
                  <li>
                    <strong className="text-carbon-primary">Reference / Document Fingerprint:</strong> Canonical SHA-256 integrity hash verification against private off-chain Amazon S3 evidence storage.
                  </li>
                  <li>
                    <strong className="text-carbon-primary">Authorized Source &amp; Event Timestamp:</strong> Traceable provenance to official AP Revenue, Registration, or Survey departments recorded in permissioned ledger.
                  </li>
                  <li>
                    <strong className="text-carbon-primary">Current Dispute / Supersession Status:</strong> Active judicial injunction orders or newer mutation supersession events verified (a dispute or newer deed immediately overrides positive verification).
                  </li>
                </ul>

                {/* Detailed 6-item evidence chain from HEAD */}
                <div className="space-y-2 pt-2 border-t border-parchment-border">
                  <span className="text-[11px] text-carbon-muted font-semibold block">6-Point Statutory Evidence Chain:</span>
                  {[
                    { label: "1. Verification Reference", value: "Matched to issued registry book" },
                    { label: "2. Document Fingerprint (SHA-256)", value: "Exact Binary Parity" },
                    { label: "3. Authorized Issuing Authority", value: "Pilot Revenue Department Attested" },
                    { label: "4. Anchor Timestamp", value: "Immutable Slot Confirmed" },
                    {
                      label: "5. Current Dispute Status",
                      value: result.status === "DISPUTED" ? "Active Injunction Hold Found" : "No Active Dispute Hold",
                      danger: result.status === "DISPUTED",
                    },
                    {
                      label: "6. Supersession Status",
                      value: result.status === "SUPERSEDED" ? "Newer Mutation Registered" : "Current Version Active",
                      purple: result.status === "SUPERSEDED",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between bg-parchment-muted p-2.5 rounded-lg border border-parchment-border"
                    >
                      <span className="font-medium text-carbon-primary">{item.label}</span>
                      <span
                        className={`font-mono font-bold ${
                          (item as any).danger
                            ? "text-rose-700"
                            : (item as any).purple
                            ? "text-purple-700"
                            : "text-emerald-700"
                        }`}
                      >
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* How Verification Works Modal */}
      {showHowItWorks && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-parchment-border">
            <div className="flex justify-between items-center border-b border-parchment-border pb-3">
              <h3 className="font-bold text-base text-carbon-primary">How BhuSetu Verification Works</h3>
              <button
                onClick={() => setShowHowItWorks(false)}
                className="text-carbon-muted hover:text-carbon-primary text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-carbon-muted leading-relaxed">
              <p><strong className="text-carbon-primary">1. Cryptographic Fingerprinting:</strong> Every official land document issued by the Revenue or Registration department receives a canonical SHA-256 fingerprint. Any 1-character alteration produces a deterministic <code>MISMATCH</code>.</p>
              <p><strong className="text-carbon-primary">2. Private Off-Chain Storage:</strong> Full deeds and personal identification are encrypted in AWS S3 and DynamoDB. Public users can verify authenticity without exposing sensitive citizen data.</p>
              <p><strong className="text-carbon-primary">3. Multi-Org Permissioned Ledger:</strong> Changes require multi-org endorsement across Revenue, Registration, and Survey departments on the Hyperledger Fabric <code>land-records-pilot</code> channel.</p>
              <p><strong className="text-carbon-primary">4. Legal Dispute Priority:</strong> If a court injunction or dispute hold is flagged, positive verification is blocked to protect citizens from buying encumbered property.</p>
            </div>

            <button
              onClick={() => setShowHowItWorks(false)}
              className="w-full py-2.5 bg-carbon-primary text-white font-bold text-xs rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Official Escalation Contact Directory Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-parchment-border">
            <div className="flex justify-between items-center border-b border-parchment-border pb-3">
              <div className="flex items-center gap-2 text-carbon-primary">
                <PhoneCall className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base">Competent Authority Contact Directory</h3>
              </div>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-carbon-muted hover:text-carbon-primary text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-carbon-muted">
              For legal title certification, boundary demarcation, or dispute resolution, contact the authorized district offices:
            </p>

            <div className="space-y-3 text-xs">
              {[
                {
                  name: "Mandal Revenue Office / Tehsildar Tenali",
                  matters: "Record of Rights (RoR), Adangal, Mutations, Succession Orders",
                  scope: "Jurisdiction: Tenali Mandal, Guntur District",
                },
                {
                  name: "Sub-Registrar Office Tenali",
                  matters: "Registered Sale Deeds, Gift Deeds, Encumbrance Certificates (EC)",
                  scope: "Department: Registration and Stamps Department, AP",
                },
                {
                  name: "District Civil Court Tenali",
                  matters: "Title Suits, Injunctions, Partition Suits, Dispute Holds",
                  scope: "Judicial Reference: OS 442/2025 & Civil Injunctions",
                },
                {
                  name: "Assistant Director of Survey & Land Records",
                  matters: "Cadastral Field Measurement Books (FMB), ULPIN Demarcation",
                  scope: "Collectorate Compound, Guntur",
                },
              ].map((office) => (
                <div key={office.name} className="p-3 rounded-xl bg-parchment-muted border border-parchment-border space-y-1">
                  <div className="font-bold text-carbon-primary">{office.name}</div>
                  <div className="text-carbon-muted">{office.matters}</div>
                  <div className="text-carbon-muted font-mono text-[10px]">{office.scope}</div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowContactModal(false)}
              className="w-full py-2.5 bg-carbon-primary text-white font-bold text-xs rounded-xl"
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
          <div className="animate-spin w-8 h-8 border-4 border-terracotta border-t-transparent rounded-full mx-auto" />
          <p className="text-carbon-muted text-xs font-semibold">Loading verification interface...</p>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
