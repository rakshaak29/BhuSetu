"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Search, 
  FileCheck2, 
  UserCheck, 
  PlayCircle, 
  Lock, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  FileSpreadsheet,
  QrCode,
  Upload,
  ArrowRight,
  ShieldAlert
} from "lucide-react";

export default function Home() {
  const [quickRef, setQuickRef] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickRef.trim()) {
      router.push(`/verify?ref=${encodeURIComponent(quickRef.trim())}`);
    }
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Banner Area */}
      <section className="bg-gradient-to-b from-carbon-primary via-slate-900 to-carbon-primary text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-terracotta/10 border border-terracotta/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-terracotta" />
            DIGITAL LAND RECORD VERIFICATION · DISTRICT PILOT
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight max-w-3xl mx-auto">
            Verify land-record evidence with confidence.
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Check whether an issued reference or document matches an authorized record — without exposing private personal information.
          </p>

          {/* Quick Verification Bar */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto pt-4">
            <div className="relative flex items-center shadow-2xl rounded-xl overflow-hidden border border-slate-700 bg-slate-800/90 backdrop-blur focus-within:border-terracotta transition-colors">
              <Search className="w-5 h-5 text-slate-400 ml-4 shrink-0" />
              <input
                type="text"
                placeholder="Enter Verification Reference (e.g. BHS-2M7D-9KQX)..."
                value={quickRef}
                onChange={(e) => setQuickRef(e.target.value)}
                className="w-full py-4 px-4 bg-transparent text-white placeholder-slate-400 focus:outline-none text-sm font-mono"
              />
              <button
                type="submit"
                className="mr-2 px-5 py-2.5 bg-terracotta hover:bg-terracotta-hover text-white font-semibold text-xs rounded-lg transition-colors shrink-0 flex items-center gap-1.5"
              >
                <span>Verify Evidence</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-400 mt-3 flex flex-wrap justify-center gap-3">
              <span>Try test fixtures:</span>
              <button type="button" onClick={() => router.push("/verify?ref=BHS-2M7D-9KQX")} className="text-emerald-400 font-mono underline hover:text-emerald-300">BHS-2M7D-9KQX (Verified)</button>
              <button type="button" onClick={() => router.push("/verify?ref=BHS-88X9-4K2M")} className="text-red-400 font-mono underline hover:text-red-300">BHS-88X9-4K2M (Disputed)</button>
            </div>
          </form>

          {/* Privacy Banner */}
          <div className="pt-2 text-xs text-slate-400 flex items-center justify-center gap-2">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Privacy-first verification · Zero owner PII is exposed in public verification</span>
          </div>
        </div>
      </section>

      {/* Entry Pathways Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <h2 className="text-2xl font-bold text-carbon-primary">Three Verification Entry Pathways</h2>
          <p className="text-xs text-carbon-muted">Choose your preferred path to verify land record evidence authenticity.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Scan QR */}
          <div className="parchment-card rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-carbon-muted transition-colors">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-parchment-muted flex items-center justify-center text-carbon-primary font-bold">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-carbon-primary">Scan QR</h3>
              <p className="text-xs text-carbon-muted leading-relaxed">
                Scan an issued BhuSetu QR code on a physical deed extract or RTC document.
              </p>
            </div>
            <Link
              href="/verify?tab=qr"
              className="w-full py-2.5 px-4 bg-parchment-muted hover:bg-parchment-border text-carbon-primary text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors border border-parchment-border"
            >
              <span>Scan QR Code</span>
            </Link>
          </div>

          {/* Enter Reference */}
          <div className="parchment-card rounded-2xl p-6 flex flex-col justify-between space-y-4 border-2 border-terracotta/40 shadow-sm">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-terracotta-light text-terracotta flex items-center justify-center font-bold">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-carbon-primary">Enter Reference</h3>
              <p className="text-xs text-carbon-muted leading-relaxed">
                Enter an authorized 12-character verification reference printed on official extracts.
              </p>
            </div>
            <Link
              href="/verify?tab=ref"
              className="w-full py-2.5 px-4 bg-terracotta hover:bg-terracotta-hover text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <span>Enter Reference Code</span>
            </Link>
          </div>

          {/* Upload Document */}
          <div className="parchment-card rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-carbon-muted transition-colors">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-parchment-muted flex items-center justify-center text-carbon-primary font-bold">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-carbon-primary">Upload Document</h3>
              <p className="text-xs text-carbon-muted leading-relaxed">
                Compare an approved document binary fingerprint (SHA-256 client-side hash).
              </p>
            </div>
            <Link
              href="/verify?tab=upload"
              className="w-full py-2.5 px-4 bg-parchment-muted hover:bg-parchment-border text-carbon-primary text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors border border-parchment-border"
            >
              <span>Compare Document Hash</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Verified Evidence Card Sample Visual */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="parchment-card rounded-2xl p-6 sm:p-8 space-y-6 border-l-4 border-l-status-verified-text">
          <div className="flex justify-between items-start border-b border-parchment-border pb-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-status-verified-text" />
              <div>
                <span className="inline-block px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wider rounded-md bg-status-verified-bg text-status-verified-text border border-status-verified-border">
                  ✓ EVIDENCE VERIFIED
                </span>
                <h3 className="text-lg font-bold text-carbon-primary mt-1">Authorized Evidence Match</h3>
              </div>
            </div>
            <div className="text-xs font-mono bg-parchment-muted px-3 py-1 rounded border border-parchment-border font-bold">
              BHS-2M7D-9KQX
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-parchment-muted p-4 rounded-xl border border-parchment-border font-mono">
            <div>
              <span className="text-carbon-muted block">Authorized Source</span>
              <span className="font-bold text-carbon-primary">Pilot Revenue Department · Bengaluru</span>
            </div>
            <div>
              <span className="text-carbon-muted block">Issue Timestamp</span>
              <span className="font-bold text-carbon-primary">19 Sep 2026 · 10:42:18 IST</span>
            </div>
            <div>
              <span className="text-carbon-muted block">Masked Parcel Reference</span>
              <span className="font-bold text-carbon-primary">AP-XX-•••-041</span>
            </div>
            <div>
              <span className="text-carbon-muted block">Verification Reference</span>
              <span className="font-bold text-terracotta">BHS-2M7D-9KQX</span>
            </div>
          </div>

          <div className="bg-carbon-primary text-slate-300 p-4 rounded-xl text-xs space-y-1 border border-slate-800">
            <div className="flex items-center gap-1.5 font-bold text-amber-400 uppercase tracking-wider text-[10px]">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Mandatory Product Legal Disclaimer</span>
            </div>
            <p className="leading-relaxed">
              This result confirms an evidence match to an authorized record at the time shown. It is not, by itself, a determination of legal title, ownership, encumbrance, or boundary.
            </p>
          </div>
        </div>
      </section>

      {/* Architectural Principles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="parchment-well rounded-2xl p-8 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-2xl font-bold text-carbon-primary">Core Technical Architecture</h3>
            <p className="text-xs text-carbon-muted">Designed for Indian digital public infrastructure, security, and statutory auditability.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 text-xs">
            <div className="bg-white p-5 rounded-xl border border-parchment-border space-y-2">
              <CheckCircle2 className="w-5 h-5 text-status-verified-text" />
              <h4 className="font-bold text-carbon-primary">Authoritative Source First</h4>
              <p className="text-carbon-muted">Blockchain records integrity and provenance; official State Revenue & Court records remain legal authority.</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-parchment-border space-y-2">
              <Lock className="w-5 h-5 text-blue-600" />
              <h4 className="font-bold text-carbon-primary">PII Protected Off-Chain</h4>
              <p className="text-carbon-muted">No owner PII, document PDFs, or raw coordinates are ever placed on the blockchain or public response.</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-parchment-border space-y-2">
              <Cpu className="w-5 h-5 text-purple-600" />
              <h4 className="font-bold text-carbon-primary">Server-Side Maker-Checker</h4>
              <p className="text-carbon-muted">Strict separation of duties. Submitting creator cannot approve their own evidence proposal.</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-parchment-border space-y-2">
              <AlertTriangle className="w-5 h-5 text-status-disputed-badge" />
              <h4 className="font-bold text-carbon-primary">Dispute Hold Protection</h4>
              <p className="text-carbon-muted">Active court/revenue dispute holds immediately override positive verification to protect citizens and verifiers.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
