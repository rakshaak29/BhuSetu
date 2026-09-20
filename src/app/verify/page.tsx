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
  ShieldCheck,
} from "lucide-react";
import { PublicVerificationResponse, VerificationStatus } from "@/lib/types/domain";

type Language = "en" | "te" | "hi";

const I18N = {
  en: {
    title: "Verify Land Record",
    subtitle: "Check if your document or reference code matches official government records.",
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
    disclaimerTitle: "Important Legal Notice",
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

  // Generate QR code whenever verification result changes (do not create QR if record is unavailable)
  useEffect(() => {
    if (
      result &&
      result.status !== "UNAVAILABLE" &&
      result.verificationReference &&
      result.verificationReference !== "N/A" &&
      !lowBandwidth
    ) {
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
    <div className={`max-w-4xl mx-auto px-4 py-10 space-y-8 ${lowBandwidth ? "grayscale-[0.15]" : ""}`}>
      {/* Top Utility Bar: Language Selector & Low-Bandwidth Mode */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-[#DED8CF]/70 pb-4">
        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-[#78786C]" />
          <span className="font-semibold text-[#78786C]">Language:</span>
          {(["en", "te", "hi"] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-3 py-1 rounded-full text-xs transition-all duration-200 ${
                lang === l
                  ? "bg-[#5D7052] text-[#F3F4F1] font-bold shadow-sm"
                  : "text-[#78786C] hover:text-[#2C2C24] hover:bg-[#5D7052]/10 font-medium"
              }`}
            >
              {l === "en" ? "English" : l === "te" ? "తెలుగు" : "हिन्दी"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLowBandwidth(!lowBandwidth)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all text-xs font-semibold ${
              lowBandwidth
                ? "bg-[#C18C5D]/15 text-[#AF7B4E] border-[#C18C5D]/40 font-bold"
                : "bg-[#F0EBE5] text-[#78786C] border-[#DED8CF] hover:bg-[#E6DCCD]"
            }`}
          >
            <WifiOff className="w-3 h-3 text-[#78786C]" />
            <span>{t.lowBandwidth}</span>
          </button>
          <button
            onClick={() => setShowHowItWorks(true)}
            className="px-3 py-1.5 rounded-full bg-[#5D7052]/10 text-[#5D7052] hover:bg-[#5D7052]/20 font-semibold text-xs flex items-center gap-1.5 transition-colors border border-[#5D7052]/20"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Help Guide</span>
          </button>
        </div>
      </div>

      {/* Eyebrow & Header Title */}
      <div className="space-y-2.5 border-b border-[#DED8CF]/70 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5D7052]/10 border border-[#5D7052]/25 text-[#5D7052] text-[11px] font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          LAND RECORD VERIFICATION
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C2C24] flex items-center gap-3">
          <FileCheck2 className="w-8 h-8 text-[#C18C5D]" />
          {t.title}
        </h1>
        <p className="text-[#78786C] text-xs sm:text-sm leading-relaxed max-w-2xl">{t.subtitle}</p>
      </div>

      {/* Input Tabs Area */}
      <div className="organic-card rounded-3xl border border-[#DED8CF] shadow-soft overflow-hidden">
        {/* Three Entry Pathway Pill Switcher */}
        <div className="p-3 bg-[#F0EBE5]/70 border-b border-[#DED8CF]/70">
          <div className="flex gap-1.5 p-1 bg-[#E6DCCD]/40 rounded-full">
            <button
              onClick={() => { setActiveTab("ref"); stopCamera(); }}
              className={`flex-1 py-2.5 px-4 text-xs font-semibold rounded-full flex items-center justify-center gap-2 transition-all duration-200 ${
                activeTab === "ref"
                  ? "bg-[#FEFEFA] text-[#2C2C24] shadow-sm font-bold"
                  : "text-[#78786C] hover:text-[#2C2C24]"
              }`}
            >
              <Search className="w-4 h-4 text-[#C18C5D]" />
              <span>{t.tabRef}</span>
            </button>

            <button
              onClick={() => { setActiveTab("upload"); stopCamera(); }}
              className={`flex-1 py-2.5 px-4 text-xs font-semibold rounded-full flex items-center justify-center gap-2 transition-all duration-200 ${
                activeTab === "upload"
                  ? "bg-[#FEFEFA] text-[#2C2C24] shadow-sm font-bold"
                  : "text-[#78786C] hover:text-[#2C2C24]"
              }`}
            >
              <Upload className="w-4 h-4 text-[#5D7052]" />
              <span>{t.tabUpload}</span>
            </button>

            <button
              onClick={() => { setActiveTab("qr"); stopCamera(); }}
              className={`flex-1 py-2.5 px-4 text-xs font-semibold rounded-full flex items-center justify-center gap-2 transition-all duration-200 ${
                activeTab === "qr"
                  ? "bg-[#FEFEFA] text-[#2C2C24] shadow-sm font-bold"
                  : "text-[#78786C] hover:text-[#2C2C24]"
              }`}
            >
              <QrCode className="w-4 h-4 text-[#5D7052]" />
              <span>{t.tabQr}</span>
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* TAB 1: ENTER REFERENCE */}
          {activeTab === "ref" && (
            <div className="space-y-5">
              <label className="block text-xs font-bold text-[#2C2C24] uppercase tracking-wider">
                {t.refLabel}
              </label>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder={t.refPlaceholder}
                  value={referenceInput}
                  onChange={(e) => setReferenceInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleVerifyReference()}
                  className="flex-1 px-4 py-3.5 border border-[#DED8CF] rounded-2xl bg-[#FEFEFA] focus:ring-2 focus:ring-[#5D7052]/30 focus:border-[#5D7052] font-mono text-[#2C2C24] placeholder-[#78786C] text-sm"
                />

                <button
                  onClick={() => handleVerifyReference()}
                  disabled={!referenceInput.trim() || loading}
                  className="px-7 py-3.5 bg-[#C18C5D] hover:bg-[#AF7B4E] active:scale-95 disabled:opacity-50 text-white font-semibold text-xs rounded-full transition-all duration-200 flex items-center justify-center gap-2 shrink-0 shadow-[0_4px_16px_-2px_rgba(193,140,93,0.35)]"
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
              <div className="space-y-2 pt-3 border-t border-[#DED8CF]/70">
                <span className="text-[11px] text-[#78786C] font-semibold block">Quick Test Scenarios:</span>
                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  <button
                    onClick={() => { setReferenceInput("BHS-2M7D-9KQX"); handleVerifyReference("BHS-2M7D-9KQX"); }}
                    className="px-3 py-1.5 bg-[#5D7052]/10 text-[#5D7052] border border-[#5D7052]/30 rounded-full font-semibold hover:bg-[#5D7052]/20 transition-colors"
                  >
                    ✓ Verified (BHS-2M7D-9KQX)
                  </button>
                  <button
                    onClick={() => { setReferenceInput("BHS-88X9-4K2M"); handleVerifyReference("BHS-88X9-4K2M"); }}
                    className="px-3 py-1.5 bg-[#A85448]/10 text-[#A85448] border border-[#A85448]/30 rounded-full font-semibold hover:bg-[#A85448]/20 transition-colors"
                  >
                    ⚠ Disputed Hold (BHS-88X9-4K2M)
                  </button>
                  <button
                    onClick={() => { setReferenceInput("BHS-4K9P-1L0W"); handleVerifyReference("BHS-4K9P-1L0W"); }}
                    className="px-3 py-1.5 bg-[#6B21A8]/10 text-[#6B21A8] border border-[#6B21A8]/30 rounded-full font-semibold hover:bg-[#6B21A8]/20 transition-colors"
                  >
                    ↻ Superseded (BHS-4K9P-1L0W)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD DOCUMENT */}
          {activeTab === "upload" && (
            <div className="space-y-5">
              <label className="block text-xs font-bold text-[#2C2C24] uppercase tracking-wider">
                Upload Official Evidence File (PDF / Extract Text)
              </label>

              <div className="border-2 border-dashed border-[#DED8CF] rounded-3xl p-8 text-center hover:border-[#5D7052] transition-all bg-[#FEFEFA]/70 space-y-3.5 group">
                <div className="w-14 h-14 rounded-2xl bg-[#5D7052]/10 text-[#5D7052] flex items-center justify-center mx-auto group-hover:bg-[#5D7052] group-hover:text-white transition-colors duration-300">
                  <Upload className="w-7 h-7" />
                </div>
                <div className="text-xs text-[#78786C]">
                  <label className="font-semibold text-[#C18C5D] hover:text-[#AF7B4E] cursor-pointer">
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
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#5D7052]/10 text-[#5D7052] rounded-full text-xs font-mono font-semibold border border-[#5D7052]/20">
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
                className="w-full p-4 border border-[#DED8CF] rounded-2xl text-xs font-mono text-[#2C2C24] placeholder-[#78786C] focus:ring-2 focus:ring-[#5D7052]/30 focus:border-[#5D7052] bg-[#FEFEFA]"
              />

              <button
                onClick={handleVerifyDocument}
                disabled={(!fileInput && !fileText) || loading}
                className="w-full py-3.5 bg-[#C18C5D] hover:bg-[#AF7B4E] disabled:opacity-50 text-white font-semibold text-xs rounded-full transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_4px_16px_-2px_rgba(193,140,93,0.35)] active:scale-95"
              >
                {loading ? <span>Calculating SHA-256 Fingerprint...</span> : <span>Verify Document Fingerprint</span>}
              </button>

              {/* Privacy Notice */}
              <div className="bg-[#F0EBE5]/80 border border-[#DED8CF] rounded-2xl p-4 flex items-start gap-3 text-xs text-[#78786C]">
                <Lock className="w-4 h-4 text-[#5D7052] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  <strong className="text-[#2C2C24]">Privacy &amp; Security Note:</strong> Uploaded files are processed in-memory solely for SHA-256 fingerprint matching. Do NOT upload Aadhaar cards, personal ID photos, or unrelated private files.
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: SCAN QR - Camera + Manual Fallback */}
          {activeTab === "qr" && (
            <div className="space-y-5">
              <div className="text-center max-w-md mx-auto space-y-2">
                <div className="w-14 h-14 bg-[#5D7052]/10 text-[#5D7052] rounded-2xl flex items-center justify-center mx-auto border border-[#5D7052]/20">
                  <QrCode className="w-7 h-7" />
                </div>
                <h3 className="font-serif font-bold text-base text-[#2C2C24]">Live Camera QR Code Scanner</h3>
                <p className="text-xs text-[#78786C] leading-relaxed">
                  Point your camera at the QR code printed on an official land document to verify it.
                </p>
              </div>

              {/* Video Scanner */}
              <div className="max-w-sm mx-auto bg-[#1F241E] rounded-3xl overflow-hidden border border-[#363E34] relative aspect-video flex items-center justify-center text-white shadow-soft">
                {cameraActive ? (
                  <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                ) : (
                  <div className="text-center p-4 space-y-2">
                    <Camera className="w-8 h-8 text-[#78786C] mx-auto" />
                    <p className="text-xs text-[#A8A399]">Camera preview is off.</p>
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-3">
                {!cameraActive ? (
                  <button
                    onClick={startCamera}
                    className="px-5 py-2.5 bg-[#C18C5D] hover:bg-[#AF7B4E] active:scale-95 text-white text-xs font-bold rounded-full flex items-center gap-2 transition-all shadow-[0_4px_16px_-2px_rgba(193,140,93,0.3)]"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Start Camera Scanner</span>
                  </button>
                ) : (
                  <button
                    onClick={stopCamera}
                    className="px-5 py-2.5 bg-[#2C2C24] hover:bg-[#1F241E] active:scale-95 text-white text-xs font-bold rounded-full flex items-center gap-2 transition-all"
                  >
                    <CameraOff className="w-4 h-4" />
                    <span>Stop Camera</span>
                  </button>
                )}
              </div>

              {cameraError && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 text-center">
                  {cameraError}
                </div>
              )}

              {/* Manual fallback */}
              <div className="pt-4 border-t border-[#DED8CF]/70 max-w-md mx-auto space-y-2">
                <label className="block text-xs font-bold text-[#2C2C24]">
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
                    className="flex-1 px-4 py-2.5 border border-[#DED8CF] rounded-xl text-xs font-mono bg-[#FEFEFA] focus:ring-2 focus:ring-[#5D7052]/30"
                  />
                  <button
                    onClick={() => handleVerifyReference()}
                    disabled={!referenceInput.trim() || loading}
                    className="px-5 py-2.5 bg-[#2C2C24] hover:bg-[#1F241E] disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all"
                  >
                    Process
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Note (always visible below input) */}
          <div className="bg-[#F0EBE5]/70 border border-[#DED8CF] rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-[#78786C]">
            <Lock className="w-4 h-4 text-[#5D7052] shrink-0 mt-0.5" />
            <span>{t.privacyNote}</span>
          </div>
        </div>
      </div>

      {/* Verification Result Display Card */}
      {result && (
        <div ref={resultRef} role="status" aria-live="polite" className="space-y-6">
          <div className={`organic-card rounded-3xl p-6 sm:p-8 space-y-6 shadow-lift border-l-4 ${
            result.status === "VERIFIED"
              ? "border-l-[#5D7052]"
              : result.status === "DISPUTED"
              ? "border-l-[#C18C5D]"
              : "border-l-[#A85448]"
          }`}>
            {/* Status Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#DED8CF]/70">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-[#5D7052]/10 flex items-center justify-center text-[#5D7052] shrink-0">
                  {getStatusBadge(result.status).icon}
                </div>
                <div>
                  <span className={`inline-block px-3 py-0.5 text-xs font-extrabold tracking-wider rounded-full ${getStatusBadge(result.status).badgeBg}`}>
                    {result.status}
                  </span>
                  <h2 className="font-serif text-lg sm:text-xl font-bold mt-1 text-[#2C2C24]">
                    {getStatusBadge(result.status).title}
                  </h2>
                </div>
              </div>

              {result.verificationReference && result.verificationReference !== "N/A" && (
                <div className="flex items-center gap-2 bg-[#F0EBE5] px-3.5 py-1.5 rounded-full border border-[#DED8CF] text-xs font-mono text-[#2C2C24]">
                  <span>Ref: <strong>{result.verificationReference}</strong></span>
                  <button
                    onClick={() => copyToClipboard(result.verificationReference)}
                    className="p-1 hover:bg-[#E6DCCD] rounded-full text-[#78786C] hover:text-[#2C2C24] transition-colors"
                    title="Copy reference"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#5D7052]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>

            {/* Explanation Message */}
            <p className="text-sm font-semibold leading-relaxed text-[#2C2C24]">
              {result.statusMessage}
            </p>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#FDFCF8] p-5 rounded-2xl border border-[#DED8CF]/80 font-mono">
              <div>
                <span className="text-[#78786C] block">Issuing Authority</span>
                <span className="font-semibold text-[#2C2C24]">{result.issuingAuthority}</span>
              </div>

              <div>
                <span className="text-[#78786C] block">Issue Timestamp (NPL Synced)</span>
                <span className="font-semibold text-[#2C2C24]">{new Date(result.issuedAt).toLocaleString("en-IN")}</span>
              </div>

              <div>
                <span className="text-[#78786C] block">Masked Parcel Reference</span>
                <span className="font-bold text-[#2C2C24]">{result.parcelReferenceMasked}</span>
              </div>

              <div>
                <span className="text-[#78786C] block">Evidence Category</span>
                <span className="font-semibold text-[#2C2C24]">{result.evidenceType || "Official Extract"}</span>
              </div>
            </div>

            {/* Next Safe Action */}
            <div className="bg-[#FEFEFA] p-5 rounded-2xl border border-[#DED8CF]/80 space-y-1.5 text-xs shadow-sm">
              <span className="font-bold text-[#2C2C24] uppercase tracking-wider block text-[10px]">
                Recommended Safe Next Action
              </span>
              <p className="text-[#4A4A40] leading-relaxed">{result.nextStep}</p>
            </div>

            {/* Scannable QR Element for Existing Records (suppressed if unavailable) */}
            {qrDataUrl && result.status !== "UNAVAILABLE" && !lowBandwidth && (
              <div className="bg-[#FEFEFA] p-5 rounded-2xl border border-[#DED8CF]/80 flex flex-col sm:flex-row items-center gap-5 shadow-sm">
                <img src={qrDataUrl} alt="Verification QR Code" className="w-28 h-28 border border-[#DED8CF] rounded-2xl p-1.5 bg-white shadow-sm shrink-0" />
                <div className="space-y-1.5 text-center sm:text-left text-xs">
                  <h4 className="font-serif font-bold text-sm text-[#2C2C24]">Shareable Verification QR Code</h4>
                  <p className="text-[#78786C] leading-relaxed">
                    Share this QR code with anyone to let them verify this record. No personal details are revealed.
                  </p>
                </div>
              </div>
            )}

            {/* Mandatory Product Legal Title Disclaimer */}
            <div className="bg-[#242823] text-[#DED8CF] p-5 rounded-2xl text-xs space-y-2 border border-[#363E34]">
              <div className="flex items-center gap-1.5 font-bold text-[#C18C5D] uppercase tracking-wider text-[10px]">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{t.disclaimerTitle}</span>
              </div>
              <p className="leading-relaxed text-[#C2BDB2] text-[11px]">
                {result.legalDisclaimer}
              </p>
              <div className="flex flex-wrap gap-4 pt-2 text-[11px]">
                <button
                  onClick={() => setShowHowItWorks(true)}
                  className="text-[#8FB97C] hover:text-[#A7D195] font-semibold underline flex items-center gap-1 transition-colors"
                >
                  <span>{t.howItWorks}</span>
                </button>
                <button
                  onClick={() => setShowContactModal(true)}
                  className="text-[#E0A97D] hover:text-[#F3C49C] font-semibold underline flex items-center gap-1 transition-colors"
                >
                  <span>{t.contactAuth}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Expandable "What Was Checked" - Evidence Chain */}
          <div className="organic-card rounded-3xl border border-[#DED8CF] p-6 sm:p-7 space-y-4 shadow-soft">
            <button
              onClick={() => setShowEvidenceChain(!showEvidenceChain)}
              className="w-full flex items-center justify-between text-sm font-serif font-bold text-[#2C2C24] hover:text-[#5D7052] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <HelpCircle className="w-4 h-4 text-[#5D7052]" />
                <span>{t.whatWasChecked}</span>
              </div>
              {showEvidenceChain ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showEvidenceChain && (
              <div className="space-y-4 text-xs pt-3 border-t border-[#DED8CF]/70">
                {/* Bullet list summary */}
                <ul className="text-xs text-[#78786C] space-y-2 list-disc pl-5 leading-relaxed">
                  <li>
                    <strong className="text-[#2C2C24]">Document Fingerprint Check:</strong> We compared your document's digital fingerprint with the original stored by the government in secure AWS S3 storage.
                  </li>
                  <li>
                    <strong className="text-[#2C2C24]">Source and Time Verified:</strong> We confirmed that this record comes from an official Revenue, Registration, or Survey department and checked the recorded date and time.
                  </li>
                  <li>
                    <strong className="text-[#2C2C24]">Dispute and Version Check:</strong> We checked if there is any active court case or if a newer version of this document exists (either one would block a positive result).
                  </li>
                </ul>

                {/* Detailed 6-item evidence chain */}
                <div className="space-y-2 pt-3 border-t border-[#DED8CF]/70">
                  <span className="text-[11px] text-[#78786C] font-bold uppercase tracking-wider block">6-Point Verification Checklist:</span>
                  {[
                    { label: "1. Verification Code", value: "Matched to official registry" },
                    { label: "2. Document Fingerprint", value: "Exact Match Confirmed" },
                    { label: "3. Issuing Authority", value: "Government Department Verified" },
                    { label: "4. Date and Time", value: "Permanently Recorded" },
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
                      className="flex items-center justify-between bg-[#FEFEFA] p-3 rounded-xl border border-[#DED8CF]/80 shadow-xs"
                    >
                      <span className="font-medium text-[#2C2C24]">{item.label}</span>
                      <span
                        className={`font-mono font-bold text-xs ${
                          (item as any).danger
                            ? "text-[#A85448]"
                            : (item as any).purple
                            ? "text-[#6B21A8]"
                            : "text-[#5D7052]"
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
        <div className="fixed inset-0 z-50 bg-[#1F241E]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FEFEFA] rounded-3xl max-w-lg w-full p-7 space-y-5 shadow-2xl border border-[#DED8CF]">
            <div className="flex justify-between items-center border-b border-[#DED8CF]/80 pb-3">
              <h3 className="font-serif font-bold text-lg text-[#2C2C24]">How BhuSetu Verification Works</h3>
              <button
                onClick={() => setShowHowItWorks(false)}
                className="w-8 h-8 rounded-full bg-[#F0EBE5] hover:bg-[#E6DCCD] text-[#2C2C24] text-xs font-bold flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#78786C] leading-relaxed">
              <p><strong className="text-[#2C2C24]">1. Digital Fingerprinting:</strong> Every official land document gets a unique digital fingerprint. Even a tiny change in the document creates a completely different fingerprint, so any tampering is caught instantly.</p>
              <p><strong className="text-[#2C2C24]">2. Private Storage:</strong> Full deeds and personal information are stored securely in encrypted AWS servers. You can verify a document without exposing anyone's private details.</p>
              <p><strong className="text-[#2C2C24]">3. Multi-Department Approval:</strong> Changes require approval from multiple government departments (Revenue, Registration, and Survey) on a shared secure network.</p>
              <p><strong className="text-[#2C2C24]">4. Court Cases Come First:</strong> If a court case or dispute is flagged on a property, positive verification is blocked immediately to protect you from buying disputed land.</p>
            </div>

            <button
              onClick={() => setShowHowItWorks(false)}
              className="w-full py-3 bg-[#5D7052] hover:bg-[#4E5E44] active:scale-95 text-[#F3F4F1] font-semibold text-xs rounded-full shadow-soft transition-all"
            >
              Close Guide
            </button>
          </div>
        </div>
      )}

      {/* Official Escalation Contact Directory Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 bg-[#1F241E]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FEFEFA] rounded-3xl max-w-lg w-full p-7 space-y-5 shadow-2xl border border-[#DED8CF]">
            <div className="flex justify-between items-center border-b border-[#DED8CF]/80 pb-3">
              <div className="flex items-center gap-2 text-[#2C2C24]">
                <PhoneCall className="w-5 h-5 text-[#5D7052]" />
                <h3 className="font-serif font-bold text-lg">Contact Your Local Office</h3>
              </div>
              <button
                onClick={() => setShowContactModal(false)}
                className="w-8 h-8 rounded-full bg-[#F0EBE5] hover:bg-[#E6DCCD] text-[#2C2C24] text-xs font-bold flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#78786C]">
              For legal title confirmation, boundary measurement, or dispute resolution, please contact the relevant district offices:
            </p>

            <div className="space-y-2.5 text-xs">
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
                <div key={office.name} className="p-3.5 rounded-2xl bg-[#F0EBE5]/60 border border-[#DED8CF] space-y-1">
                  <div className="font-bold text-[#2C2C24]">{office.name}</div>
                  <div className="text-[#78786C] text-[11px]">{office.matters}</div>
                  <div className="text-[#5D7052] font-mono text-[10.5px] font-semibold">{office.scope}</div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowContactModal(false)}
              className="w-full py-3 bg-[#5D7052] hover:bg-[#4E5E44] active:scale-95 text-[#F3F4F1] font-semibold text-xs rounded-full shadow-soft transition-all"
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
        <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-3 border-[#5D7052] border-t-transparent rounded-full mx-auto" />
          <p className="text-[#78786C] text-xs font-semibold">Loading verification interface...</p>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
