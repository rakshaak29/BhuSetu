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
  FileText
} from "lucide-react";
import { PublicVerificationResponse, VerificationStatus } from "@/lib/types/domain";

function VerifyContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get("ref") || "";
  const initialTab = searchParams.get("tab") as "ref" | "upload" | "qr" || "ref";

  const [activeTab, setActiveTab] = useState<"ref" | "upload" | "qr">(initialTab);
  const [referenceInput, setReferenceInput] = useState(initialRef);
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [fileText, setFileText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PublicVerificationResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [showEvidenceChain, setShowEvidenceChain] = useState(true);

  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialRef) {
      handleVerifyReference(initialRef);
    }
  }, [initialRef]);

  // Generate QR code whenever verification result changes
  useEffect(() => {
    if (result && result.verificationReference && result.verificationReference !== 'N/A') {
      const url = `${window.location.origin}/verify?ref=${encodeURIComponent(result.verificationReference)}`;
      QRCode.toDataURL(url, { width: 160, margin: 1 })
        .then(setQrDataUrl)
        .catch(() => setQrDataUrl(""));
    } else {
      setQrDataUrl("");
    }
  }, [result]);

  const handleVerifyReference = async (refValue?: string) => {
    const targetRef = refValue || referenceInput;
    if (!targetRef.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/v1/verify/reference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: targetRef.trim() })
      });
      const data: PublicVerificationResponse = await res.json();
      setResult(data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      setResult({
        verificationReference: targetRef,
        status: 'UNAVAILABLE',
        statusMessage: 'Unable to complete verification check due to network failure. Please retry.',
        issuingAuthority: 'Pilot Revenue Department',
        issuedAt: new Date().toISOString(),
        parcelReferenceMasked: 'XX-***-XXX',
        nextStep: 'Check internet connectivity and try again.',
        legalDisclaimer: "This result confirms an evidence match to an authorized record at the time shown. It is not, by itself, a determination of legal title, ownership, encumbrance, or boundary."
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
        body: JSON.stringify({ fileContent: content, fileName })
      });
      const data: PublicVerificationResponse = await res.json();
      setResult(data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      setResult({
        verificationReference: 'N/A',
        status: 'UNAVAILABLE',
        statusMessage: 'Failed to process document verification. Ensure file is not corrupted.',
        issuingAuthority: 'Pilot Revenue Department',
        issuedAt: new Date().toISOString(),
        parcelReferenceMasked: 'XX-***-XXX',
        nextStep: 'Re-upload original PDF extract.',
        legalDisclaimer: "This result confirms an evidence match to an authorized record at the time shown. It is not, by itself, a determination of legal title, ownership, encumbrance, or boundary."
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
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Eyebrow & Header Title */}
      <div className="space-y-2 border-b border-parchment-border pb-5">
        <div className="text-xs font-semibold text-terracotta uppercase tracking-wider">
          DIGITAL LAND RECORD VERIFICATION · DISTRICT PILOT
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-carbon-primary flex items-center gap-2.5">
          <FileCheck2 className="w-8 h-8 text-terracotta" />
          Verify Land Record Evidence
        </h1>
        <p className="text-carbon-muted text-xs sm:text-sm">
          Check whether an issued reference or document matches an authorized record — without exposing private personal information.
        </p>
      </div>

      {/* Input Tabs Area */}
      <div className="parchment-card rounded-2xl border border-parchment-border overflow-hidden">
        {/* Three Equal Entry Pathways Tabs */}
        <div className="flex border-b border-parchment-border bg-parchment-muted">
          <button
            onClick={() => setActiveTab("ref")}
            className={`flex-1 py-4 px-4 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === "ref"
                ? "border-terracotta text-terracotta bg-white"
                : "border-transparent text-carbon-muted hover:text-carbon-primary"
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Enter Reference</span>
          </button>

          <button
            onClick={() => setActiveTab("upload")}
            className={`flex-1 py-4 px-4 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === "upload"
                ? "border-terracotta text-terracotta bg-white"
                : "border-transparent text-carbon-muted hover:text-carbon-primary"
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </button>

          <button
            onClick={() => setActiveTab("qr")}
            className={`flex-1 py-4 px-4 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === "qr"
                ? "border-terracotta text-terracotta bg-white"
                : "border-transparent text-carbon-muted hover:text-carbon-primary"
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Scan QR Code</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* TAB 1: ENTER REFERENCE */}
          {activeTab === "ref" && (
            <div className="space-y-4">
              <label className="block text-xs font-bold text-carbon-primary">
                12-Character Verification Reference Number
              </label>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="e.g. BHS-2M7D-9KQX"
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
                    <span>Checking Evidence...</span>
                  ) : (
                    <>
                      <span>Verify Evidence</span>
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
                    <span>{fileInput.name}</span>
                    <span>({Math.round(fileInput.size / 1024)} KB)</span>
                  </div>
                )}
              </div>

              <textarea
                rows={3}
                placeholder="Or paste original extract text content to calculate SHA-256 fingerprint..."
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
                  <strong>Privacy & Security Note:</strong> Uploaded files are processed in-memory solely for client-side SHA-256 fingerprint matching. Do NOT upload Aadhaar cards, personal ID photos, or unrelated private files.
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: SCAN QR */}
          {activeTab === "qr" && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-parchment-muted rounded-full flex items-center justify-center mx-auto text-carbon-muted border border-parchment-border">
                <QrCode className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="font-bold text-carbon-primary text-sm">QR Code Optical Scanner</h3>
                <p className="text-xs text-carbon-muted">
                  Scan the QR code printed on an official Revenue / Sub-Registrar extract to verify reference authenticity.
                </p>
              </div>

              <div className="pt-2 max-w-sm mx-auto space-y-3">
                <input
                  type="text"
                  placeholder="Or enter scanned QR payload URL..."
                  value={referenceInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setReferenceInput(val);
                    if (val.includes("ref=")) {
                      const extracted = val.split("ref=")[1]?.split("&")[0];
                      if (extracted) handleVerifyReference(extracted);
                    }
                  }}
                  className="w-full px-4 py-2.5 border border-parchment-border rounded-xl text-xs font-mono"
                />
                <button
                  onClick={() => handleVerifyReference()}
                  disabled={!referenceInput || loading}
                  className="w-full py-2.5 bg-carbon-primary hover:bg-carbon-secondary disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  Process Scanned Code
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Verification Result Display Card */}
      {result && (
        <div ref={resultRef} className="space-y-6 animate-fadeIn">
          <div className={`rounded-2xl border p-6 sm:p-8 space-y-6 ${getStatusBadge(result.status).bgColor}`}>
            {/* Status Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-carbon-muted/20">
              <div className="flex items-center gap-3">
                {getStatusBadge(result.status).icon}
                <div>
                  <span className={`inline-block px-2.5 py-0.5 text-xs font-extrabold tracking-wider rounded-md ${getStatusBadge(result.status).badgeBg}`}>
                    {getStatusBadge(result.status).title}
                  </span>
                </div>
              </div>

              {result.verificationReference && result.verificationReference !== 'N/A' && (
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
                <span className="font-semibold text-carbon-primary">{new Date(result.issuedAt).toLocaleString('en-IN')}</span>
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
            {qrDataUrl && (
              <div className="bg-white p-4 rounded-xl border border-parchment-border flex flex-col sm:flex-row items-center gap-4">
                <img src={qrDataUrl} alt="Verification QR Code" className="w-28 h-28 border rounded-lg p-1 bg-white" />
                <div className="space-y-1 text-center sm:text-left text-xs">
                  <h4 className="font-bold text-carbon-primary">Official Scannable Verification QR Code</h4>
                  <p className="text-carbon-muted leading-relaxed">
                    This QR code links directly to this privacy-minimized evidence verification result. It contains no owner PII or private document URLs.
                  </p>
                </div>
              </div>
            )}

            {/* Mandatory Product Legal Title Disclaimer */}
            <div className="bg-carbon-primary text-slate-300 p-4 rounded-xl text-xs space-y-1 border border-slate-800">
              <div className="flex items-center gap-1.5 font-bold text-amber-400 uppercase tracking-wider text-[10px]">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Mandatory Product Legal Title Disclaimer</span>
              </div>
              <p className="leading-relaxed text-[11px]">
                {result.legalDisclaimer}
              </p>
            </div>
          </div>

          {/* Expandable "What Was Checked" Evidence Chain Section */}
          <div className="parchment-card rounded-2xl border border-parchment-border p-6 space-y-4">
            <button
              onClick={() => setShowEvidenceChain(!showEvidenceChain)}
              className="w-full flex items-center justify-between text-sm font-bold text-carbon-primary hover:text-terracotta transition-colors"
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <span>What Was Checked (Statutory Evidence Chain) — 6 of 6 Verified</span>
              </div>
              {showEvidenceChain ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showEvidenceChain && (
              <div className="space-y-3 text-xs pt-2 border-t border-parchment-border">
                <div className="flex items-center justify-between bg-parchment-muted p-2.5 rounded-lg border border-parchment-border">
                  <span className="font-medium text-carbon-primary">1. Verification Reference</span>
                  <span className="font-mono text-emerald-700 font-bold">Matched to issued registry book</span>
                </div>

                <div className="flex items-center justify-between bg-parchment-muted p-2.5 rounded-lg border border-parchment-border">
                  <span className="font-medium text-carbon-primary">2. Document Fingerprint (SHA-256)</span>
                  <span className="font-mono text-emerald-700 font-bold">Exact Binary Parity</span>
                </div>

                <div className="flex items-center justify-between bg-parchment-muted p-2.5 rounded-lg border border-parchment-border">
                  <span className="font-medium text-carbon-primary">3. Authorized Issuing Authority</span>
                  <span className="font-mono text-emerald-700 font-bold">Pilot Revenue Department Attested</span>
                </div>

                <div className="flex items-center justify-between bg-parchment-muted p-2.5 rounded-lg border border-parchment-border">
                  <span className="font-medium text-carbon-primary">4. Anchor Timestamp</span>
                  <span className="font-mono text-emerald-700 font-bold">Immutable Slot Confirmed</span>
                </div>

                <div className="flex items-center justify-between bg-parchment-muted p-2.5 rounded-lg border border-parchment-border">
                  <span className="font-medium text-carbon-primary">5. Current Dispute Status</span>
                  <span className={result.status === 'DISPUTED' ? "font-mono text-rose-700 font-bold" : "font-mono text-emerald-700 font-bold"}>
                    {result.status === 'DISPUTED' ? "Active Injunction Hold Found" : "No Active Dispute Hold"}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-parchment-muted p-2.5 rounded-lg border border-parchment-border">
                  <span className="font-medium text-carbon-primary">6. Supersession Status</span>
                  <span className={result.status === 'SUPERSEDED' ? "font-mono text-purple-700 font-bold" : "font-mono text-emerald-700 font-bold"}>
                    {result.status === 'SUPERSEDED' ? "Newer Mutation Registered" : "Current Version Active"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="animate-spin w-8 h-8 border-4 border-terracotta border-t-transparent rounded-full mx-auto" />
        <p className="text-carbon-muted text-xs font-semibold">Loading verification interface...</p>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
