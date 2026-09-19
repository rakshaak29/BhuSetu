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
  Info
} from "lucide-react";
import { PublicVerificationResponse, VerificationStatus } from "@/lib/types/domain";

function VerifyContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get("ref") || "";

  const [activeTab, setActiveTab] = useState<"ref" | "upload" | "qr">("ref");
  const [referenceInput, setReferenceInput] = useState(initialRef);
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [fileText, setFileText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PublicVerificationResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

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
        issuingAuthority: 'State Revenue Department',
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
        issuingAuthority: 'State Revenue Department',
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
          icon: <CheckCircle2 className="w-8 h-8 text-emerald-600" />,
          bgColor: "bg-emerald-50 border-emerald-300 text-emerald-900",
          badgeBg: "bg-emerald-600 text-white",
          title: "Evidence Verified",
        };
      case "MISMATCH":
        return {
          icon: <XCircle className="w-8 h-8 text-rose-600" />,
          bgColor: "bg-rose-50 border-rose-300 text-rose-900",
          badgeBg: "bg-rose-600 text-white",
          title: "Evidence Mismatch",
        };
      case "DISPUTED":
        return {
          icon: <AlertTriangle className="w-8 h-8 text-red-600" />,
          bgColor: "bg-red-50 border-red-300 text-red-950",
          badgeBg: "bg-red-600 text-white",
          title: "Record Disputed / Legal Hold",
        };
      case "PENDING_REVIEW":
        return {
          icon: <Clock className="w-8 h-8 text-amber-600" />,
          bgColor: "bg-amber-50 border-amber-300 text-amber-950",
          badgeBg: "bg-amber-500 text-slate-950 font-bold",
          title: "Official Review Pending",
        };
      case "SUPERSEDED":
        return {
          icon: <History className="w-8 h-8 text-purple-600" />,
          bgColor: "bg-purple-50 border-purple-300 text-purple-950",
          badgeBg: "bg-purple-600 text-white",
          title: "Evidence Version Superseded",
        };
      case "UNAVAILABLE":
      default:
        return {
          icon: <Info className="w-8 h-8 text-slate-600" />,
          bgColor: "bg-slate-100 border-slate-300 text-slate-900",
          badgeBg: "bg-slate-600 text-white",
          title: "Record Unavailable",
        };
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header Title */}
      <div className="space-y-2 border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2.5">
          <FileCheck2 className="w-8 h-8 text-emerald-600" />
          Verify Land Record Evidence
        </h1>
        <p className="text-slate-600 text-sm">
          Check an issued verification reference, scan a QR code, or upload an official land extract to verify tamper-evident hash authenticity.
        </p>
      </div>

      {/* Input Tabs Area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Tab Buttons */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            onClick={() => setActiveTab("ref")}
            className={`flex-1 py-4 px-4 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === "ref"
                ? "border-emerald-600 text-emerald-700 bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Enter Reference</span>
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className={`flex-1 py-4 px-4 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === "upload"
                ? "border-emerald-600 text-emerald-700 bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
          <button
            onClick={() => setActiveTab("qr")}
            className={`flex-1 py-4 px-4 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === "qr"
                ? "border-emerald-600 text-emerald-700 bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Scan QR Code</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {activeTab === "ref" && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Verification Reference Number
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="e.g. BHS-2M7D-9KQX"
                  value={referenceInput}
                  onChange={(e) => setReferenceInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleVerifyReference()}
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-slate-900 placeholder-slate-400"
                />
                <button
                  onClick={() => handleVerifyReference()}
                  disabled={!referenceInput.trim() || loading}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shrink-0"
                >
                  {loading ? (
                    <span>Verifying...</span>
                  ) : (
                    <>
                      <span>Verify Reference</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
              <div className="text-xs text-slate-500">
                Format: 12-character alphanumeric code printed on authorized BhuSetu extracts.
              </div>
            </div>
          )}

          {activeTab === "upload" && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Upload Official Evidence File (PDF / Extract Text)
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-emerald-500 transition-colors bg-slate-50 space-y-3">
                <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="text-sm text-slate-600">
                  <label className="font-semibold text-emerald-600 hover:text-emerald-500 cursor-pointer">
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
                className="w-full p-3 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />

              <button
                onClick={handleVerifyDocument}
                disabled={(!fileInput && !fileText) || loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <span>Calculating SHA-256 & Matching...</span> : <span>Verify Document Fingerprint</span>}
              </button>

              {/* Privacy Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-800">
                <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Privacy & Security Note:</strong> Uploaded files are processed in-memory solely for SHA-256 fingerprint matching. Do NOT upload Aadhaar cards, personal ID photos, or unrelated private files.
                </span>
              </div>
            </div>
          )}

          {activeTab === "qr" && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-600">
                <QrCode className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="font-bold text-slate-900">QR Code Verification</h3>
                <p className="text-xs text-slate-600">
                  Scan the QR code printed on an official Revenue / Sub-Registrar extract to verify reference authenticity.
                </p>
              </div>

              <div className="pt-2 max-w-sm mx-auto space-y-3">
                <input
                  type="text"
                  placeholder="Or enter scanned QR payload / URL..."
                  value={referenceInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setReferenceInput(val);
                    if (val.includes("ref=")) {
                      const extracted = val.split("ref=")[1]?.split("&")[0];
                      if (extracted) handleVerifyReference(extracted);
                    }
                  }}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-mono"
                />
                <button
                  onClick={() => handleVerifyReference()}
                  disabled={!referenceInput || loading}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-sm font-semibold rounded-xl"
                >
                  Process Scanned Code
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Verification Result Display */}
      {result && (
        <div ref={resultRef} className="space-y-6 animate-fadeIn">
          <div className={`rounded-2xl border p-6 sm:p-8 space-y-6 ${getStatusBadge(result.status).bgColor}`}>
            {/* Status Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60">
              <div className="flex items-center gap-3">
                {getStatusBadge(result.status).icon}
                <div>
                  <span className={`inline-block px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wider rounded-md ${getStatusBadge(result.status).badgeBg}`}>
                    {result.status}
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                    {getStatusBadge(result.status).title}
                  </h2>
                </div>
              </div>

              {result.verificationReference && result.verificationReference !== 'N/A' && (
                <div className="flex items-center gap-2 bg-white/80 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-800">
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
            <p className="text-base font-semibold leading-relaxed">
              {result.statusMessage}
            </p>

            {/* Result Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-white/80 p-4 rounded-xl border border-slate-200/60">
              <div>
                <span className="text-slate-500 block">Issuing Authority</span>
                <span className="font-semibold text-slate-900">{result.issuingAuthority}</span>
              </div>

              <div>
                <span className="text-slate-500 block">Record Issue Timestamp</span>
                <span className="font-semibold text-slate-900">{new Date(result.issuedAt).toLocaleString('en-IN')}</span>
              </div>

              <div>
                <span className="text-slate-500 block">Masked Parcel Reference</span>
                <span className="font-mono font-bold text-slate-900">{result.parcelReferenceMasked}</span>
              </div>

              <div>
                <span className="text-slate-500 block">Evidence Type</span>
                <span className="font-semibold text-slate-900">{result.evidenceType || "Official Extract"}</span>
              </div>
            </div>

            {/* Recommended Next Step */}
            <div className="bg-white/90 p-4 rounded-xl border border-slate-200/60 space-y-1">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Recommended Safe Next Action</span>
              <p className="text-xs text-slate-800 leading-relaxed">{result.nextStep}</p>
            </div>

            {/* Scannable QR Code element for verified results */}
            {qrDataUrl && (
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                <img src={qrDataUrl} alt="Verification QR Code" className="w-28 h-28 border rounded-lg" />
                <div className="space-y-1 text-center sm:text-left text-xs">
                  <h4 className="font-bold text-slate-900">Official Scannable Verification QR Code</h4>
                  <p className="text-slate-600">
                    This QR code links directly to this privacy-minimized evidence verification result. It contains no owner PII or private documents.
                  </p>
                </div>
              </div>
            )}

            {/* Mandatory Legal Title Disclaimer */}
            <div className="bg-slate-900 text-slate-300 p-4 rounded-xl text-xs space-y-1 border border-slate-800">
              <div className="flex items-center gap-1.5 font-bold text-amber-400 uppercase tracking-wider text-[10px]">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Mandatory Product Legal Disclaimer</span>
              </div>
              <p className="leading-relaxed">
                {result.legalDisclaimer}
              </p>
            </div>
          </div>

          {/* What Was Checked Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              What was checked in this verification?
            </h3>
            <ul className="text-xs text-slate-600 space-y-2 list-disc pl-5">
              <li>Deterministic SHA-256 fingerprint match against approved off-chain evidence store.</li>
              <li>Hyperledger Fabric permissioned ledger event trail and issuing authority timestamp.</li>
              <li>Active civil court or revenue department dispute hold registry check.</li>
              <li>Event version supersession history (confirming whether a newer mutation exists).</li>
            </ul>
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
        <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto" />
        <p className="text-slate-600 text-sm font-semibold">Loading verification interface...</p>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
