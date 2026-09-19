"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Search, 
  Lock, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  QrCode, 
  Upload, 
  ArrowRight, 
  ShieldAlert,
  Fingerprint
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
    <div className="space-y-16 pb-16">
      {/* ─── Sovereign Organic Hero Area ─── */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-[#DED8CF]/60">
        {/* Ambient atmospheric color washes */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#5D7052]/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-1/4 w-[380px] h-[280px] bg-[#C18C5D]/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto text-center space-y-6">
          {/* Pilot Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#5D7052]/10 border border-[#5D7052]/25 text-[#5D7052] text-xs font-semibold tracking-wider uppercase">
            <ShieldCheck className="w-4 h-4 text-[#5D7052]" />
            DIGITAL LAND RECORD VERIFICATION · DISTRICT PILOT
          </div>

          {/* Fraunces Headline */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#2C2C24] leading-[1.15] max-w-3xl mx-auto">
            Verify land-record evidence with confidence.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#78786C] max-w-2xl mx-auto leading-relaxed font-normal">
            Check whether an issued reference or document matches an authorized state record — without exposing private personal information.
          </p>

          {/* Tactile Pill Search Bar */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto pt-3">
            <div className="relative flex items-center shadow-[0_10px_35px_-10px_rgba(93,112,82,0.15)] rounded-full overflow-hidden border border-[#DED8CF] bg-[#FEFEFA]/90 backdrop-blur focus-within:border-[#5D7052] focus-within:ring-2 focus-within:ring-[#5D7052]/20 transition-all duration-300">
              <Search className="w-5 h-5 text-[#78786C] ml-4 shrink-0" />
              <input
                type="text"
                placeholder="Enter Verification Reference (e.g. BHS-2M7D-9KQX)..."
                value={quickRef}
                onChange={(e) => setQuickRef(e.target.value)}
                className="w-full py-4 px-3.5 bg-transparent text-[#2C2C24] placeholder-[#78786C] focus:outline-none text-sm font-mono"
              />
              <button
                type="submit"
                className="mr-2 px-6 py-2.5 bg-[#C18C5D] hover:bg-[#AF7B4E] active:scale-95 text-white font-semibold text-xs rounded-full transition-all duration-200 shrink-0 flex items-center gap-1.5 shadow-[0_4px_16px_-2px_rgba(193,140,93,0.35)]"
              >
                <span>Verify Evidence</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Test Fixture Quick Links */}
            <div className="text-xs text-[#78786C] mt-3.5 flex flex-wrap items-center justify-center gap-2.5">
              <span className="font-medium">Try test fixtures:</span>
              <button
                type="button"
                onClick={() => router.push("/verify?ref=BHS-2M7D-9KQX")}
                className="px-3 py-1 rounded-full bg-[#5D7052]/10 text-[#5D7052] font-mono text-[11px] font-semibold hover:bg-[#5D7052]/20 transition-colors"
              >
                BHS-2M7D-9KQX (Verified)
              </button>
              <button
                type="button"
                onClick={() => router.push("/verify?ref=BHS-88X9-4K2M")}
                className="px-3 py-1 rounded-full bg-[#A85448]/10 text-[#A85448] font-mono text-[11px] font-semibold hover:bg-[#A85448]/20 transition-colors"
              >
                BHS-88X9-4K2M (Disputed)
              </button>
            </div>
          </form>

          {/* Privacy Guarantee */}
          <div className="pt-2 text-xs text-[#78786C] flex items-center justify-center gap-2">
            <Lock className="w-3.5 h-3.5 text-[#5D7052]" />
            <span>Privacy-first verification · Zero owner PII is exposed in public verification</span>
          </div>
        </div>
      </section>

      {/* ─── Entry Pathways Section ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C2C24]">
            Three Verification Entry Pathways
          </h2>
          <p className="text-xs sm:text-sm text-[#78786C]">
            Choose your preferred path to verify land record evidence authenticity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Scan QR */}
          <div className="organic-card rounded-3xl p-7 flex flex-col justify-between space-y-6 group hover:-translate-y-1 hover:shadow-lift transition-all duration-300">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#5D7052]/10 text-[#5D7052] flex items-center justify-center group-hover:bg-[#5D7052] group-hover:text-[#F3F4F1] transition-colors duration-300">
                <QrCode className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#2C2C24]">Scan QR</h3>
              <p className="text-xs text-[#78786C] leading-relaxed">
                Scan an issued BhuSetu QR code on a physical deed extract, patta, or official RTC document.
              </p>
            </div>
            <Link
              href="/verify?tab=qr"
              className="w-full py-3 px-4 bg-[#F0EBE5] hover:bg-[#E6DCCD] text-[#2C2C24] text-xs font-semibold rounded-full flex items-center justify-center gap-2 transition-all duration-200 border border-[#DED8CF] active:scale-95"
            >
              <span>Scan QR Code</span>
            </Link>
          </div>

          {/* Enter Reference */}
          <div className="organic-card rounded-3xl p-7 flex flex-col justify-between space-y-6 border-2 border-[#C18C5D]/40 shadow-float group hover:-translate-y-1 transition-all duration-300">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#C18C5D]/15 text-[#C18C5D] flex items-center justify-center group-hover:bg-[#C18C5D] group-hover:text-white transition-colors duration-300">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#2C2C24]">Enter Reference</h3>
              <p className="text-xs text-[#78786C] leading-relaxed">
                Enter an authorized 12-character verification reference printed on registered revenue certificates.
              </p>
            </div>
            <Link
              href="/verify?tab=ref"
              className="w-full py-3 px-4 bg-[#C18C5D] hover:bg-[#AF7B4E] text-white text-xs font-semibold rounded-full flex items-center justify-center gap-2 transition-all duration-200 shadow-[0_4px_16px_-2px_rgba(193,140,93,0.35)] active:scale-95"
            >
              <span>Enter Reference Code</span>
            </Link>
          </div>

          {/* Upload Document */}
          <div className="organic-card rounded-3xl p-7 flex flex-col justify-between space-y-6 group hover:-translate-y-1 hover:shadow-lift transition-all duration-300">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#5D7052]/10 text-[#5D7052] flex items-center justify-center group-hover:bg-[#5D7052] group-hover:text-[#F3F4F1] transition-colors duration-300">
                <Upload className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#2C2C24]">Upload Document</h3>
              <p className="text-xs text-[#78786C] leading-relaxed">
                Compare an approved document binary fingerprint using client-side SHA-256 cryptographic hashing.
              </p>
            </div>
            <Link
              href="/verify?tab=upload"
              className="w-full py-3 px-4 bg-[#F0EBE5] hover:bg-[#E6DCCD] text-[#2C2C24] text-xs font-semibold rounded-full flex items-center justify-center gap-2 transition-all duration-200 border border-[#DED8CF] active:scale-95"
            >
              <span>Compare Document Hash</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Verified Evidence Card Sample Visual ─── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="organic-card rounded-3xl p-6 sm:p-8 space-y-6 border-l-4 border-l-[#5D7052]">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#DED8CF]/70 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#5D7052]/10 flex items-center justify-center text-[#5D7052] shrink-0">
                <CheckCircle2 className="w-6 h-6 text-[#5D7052]" />
              </div>
              <div>
                <span className="inline-block px-3 py-0.5 text-[11px] font-extrabold uppercase tracking-wider rounded-full bg-[#E8F5EE] text-[#1E7B4D] border border-[#A7F3D0]">
                  ✓ EVIDENCE VERIFIED
                </span>
                <h3 className="font-serif text-lg font-bold text-[#2C2C24] mt-1">Authorized Evidence Match</h3>
              </div>
            </div>
            <div className="text-xs font-mono bg-[#F0EBE5] text-[#2C2C24] px-3.5 py-1.5 rounded-full border border-[#DED8CF] font-bold self-start sm:self-auto">
              BHS-2M7D-9KQX
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#FDFCF8] p-5 rounded-2xl border border-[#DED8CF]/80 font-mono">
            <div>
              <span className="text-[#78786C] block text-[11px] mb-0.5">Authorized Source</span>
              <span className="font-bold text-[#2C2C24]">Pilot Revenue Department · Bengaluru</span>
            </div>
            <div>
              <span className="text-[#78786C] block text-[11px] mb-0.5">Issue Timestamp</span>
              <span className="font-bold text-[#2C2C24]">19 Sep 2026 · 10:42:18 IST</span>
            </div>
            <div>
              <span className="text-[#78786C] block text-[11px] mb-0.5">Masked Parcel Reference</span>
              <span className="font-bold text-[#2C2C24]">AP-XX-•••-041</span>
            </div>
            <div>
              <span className="text-[#78786C] block text-[11px] mb-0.5">Verification Reference</span>
              <span className="font-bold text-[#C18C5D]">BHS-2M7D-9KQX</span>
            </div>
          </div>

          {/* Statutory Notice */}
          <div className="bg-[#242823] text-[#DED8CF] p-4 sm:p-5 rounded-2xl text-xs space-y-1.5 border border-[#363E34]">
            <div className="flex items-center gap-1.5 font-bold text-[#C18C5D] uppercase tracking-wider text-[10px]">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Mandatory Product Legal Disclaimer</span>
            </div>
            <p className="leading-relaxed text-[#C2BDB2] text-[11px]">
              This result confirms an evidence match to an authorized record at the time shown. It is not, by itself, a determination of legal title, ownership, encumbrance, or boundary.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Architectural Principles ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-[#F0EBE5]/60 rounded-3xl p-8 sm:p-10 space-y-8 border border-[#DED8CF]/70">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C2C24]">
              Core Technical Architecture
            </h3>
            <p className="text-xs sm:text-sm text-[#78786C]">
              Designed for Indian digital public infrastructure, cryptographic security, and statutory auditability.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2 text-xs">
            <div className="bg-[#FEFEFA] p-6 rounded-2xl border border-[#DED8CF]/80 space-y-2.5 shadow-soft hover:-translate-y-0.5 transition-all duration-300">
              <div className="w-9 h-9 rounded-xl bg-[#5D7052]/10 flex items-center justify-center text-[#5D7052]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="font-serif font-bold text-sm text-[#2C2C24]">Authoritative Source First</h4>
              <p className="text-[#78786C] leading-relaxed">
                Blockchain records integrity and provenance; official State Revenue &amp; Court records remain sole legal authority.
              </p>
            </div>

            <div className="bg-[#FEFEFA] p-6 rounded-2xl border border-[#DED8CF]/80 space-y-2.5 shadow-soft hover:-translate-y-0.5 transition-all duration-300">
              <div className="w-9 h-9 rounded-xl bg-[#5D7052]/10 flex items-center justify-center text-[#5D7052]">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="font-serif font-bold text-sm text-[#2C2C24]">PII Protected Off-Chain</h4>
              <p className="text-[#78786C] leading-relaxed">
                No owner PII, document PDFs, or raw coordinates are ever placed on the blockchain or in public responses.
              </p>
            </div>

            <div className="bg-[#FEFEFA] p-6 rounded-2xl border border-[#DED8CF]/80 space-y-2.5 shadow-soft hover:-translate-y-0.5 transition-all duration-300">
              <div className="w-9 h-9 rounded-xl bg-[#C18C5D]/15 flex items-center justify-center text-[#C18C5D]">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="font-serif font-bold text-sm text-[#2C2C24]">Server-Side Maker-Checker</h4>
              <p className="text-[#78786C] leading-relaxed">
                Strict separation of duties. Submitting creator cannot approve their own evidence proposal.
              </p>
            </div>

            <div className="bg-[#FEFEFA] p-6 rounded-2xl border border-[#DED8CF]/80 space-y-2.5 shadow-soft hover:-translate-y-0.5 transition-all duration-300">
              <div className="w-9 h-9 rounded-xl bg-[#A85448]/10 flex items-center justify-center text-[#A85448]">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="font-serif font-bold text-sm text-[#2C2C24]">Dispute Hold Protection</h4>
              <p className="text-[#78786C] leading-relaxed">
                Active court/revenue dispute holds immediately override positive verification to protect citizens and verifiers.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
