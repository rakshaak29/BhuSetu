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
  Fingerprint,
  Sparkles,
  ExternalLink
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
    <div className="space-y-20 pb-20">
      {/* ─── Sovereign Organic Hero Area ─── */}
      <section className="relative overflow-hidden pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Ambient atmospheric color washes */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-br from-[#5D7052]/12 via-[#C18C5D]/8 to-transparent rounded-full blur-3xl pointer-events-none -z-10 animate-breathe" />
        <div className="absolute top-1/3 left-[15%] w-[400px] h-[300px] bg-[#C18C5D]/8 rounded-full blur-3xl pointer-events-none -z-10 animate-float" />
        <div className="absolute bottom-0 right-[10%] w-[350px] h-[250px] bg-[#5D7052]/6 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto text-center space-y-8">
          {/* Pilot Badge */}
          <div className="animate-fade-in-up inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-[#5D7052]/10 border border-[#5D7052]/25 text-[#5D7052] text-[11px] font-bold tracking-widest uppercase">
            <ShieldCheck className="w-4 h-4 text-[#5D7052]" />
            DIGITAL LAND RECORD VERIFICATION · DISTRICT PILOT
          </div>

          {/* Fraunces Headline */}
          <h1 className="animate-fade-in-up stagger-2 font-serif text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-[#2C2C24] leading-[1.12] max-w-3xl mx-auto">
            Verify land-record evidence{" "}
            <span className="relative inline-block">
              <span className="relative z-10">with confidence.</span>
              <span className="absolute bottom-1 left-0 right-0 h-3 bg-[#5D7052]/10 rounded-full -z-0" />
            </span>
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-in-up stagger-3 text-base sm:text-lg text-[#78786C] max-w-2xl mx-auto leading-relaxed font-normal">
            Check whether an issued reference or document matches an authorized state record — without exposing private personal information.
          </p>

          {/* Tactile Pill Search Bar */}
          <form onSubmit={handleSearch} className="animate-fade-in-up stagger-4 max-w-xl mx-auto pt-2">
            <div className="relative flex items-center shadow-[0_12px_40px_-10px_rgba(93,112,82,0.18)] rounded-full overflow-hidden border border-[#DED8CF] bg-[#FEFEFA]/95 backdrop-blur-sm focus-within:border-[#5D7052] focus-within:ring-2 focus-within:ring-[#5D7052]/20 focus-within:shadow-[0_12px_40px_-10px_rgba(93,112,82,0.25)] transition-all duration-300">
              <Search className="w-5 h-5 text-[#78786C] ml-4 shrink-0" />
              <input
                type="text"
                placeholder="Enter Verification Reference (e.g. BHS-2M7D-9KQX)..."
                value={quickRef}
                onChange={(e) => setQuickRef(e.target.value)}
                className="w-full py-4 px-3.5 bg-transparent text-[#2C2C24] placeholder-[#78786C]/70 focus:outline-none text-sm font-mono"
              />
              <button
                type="submit"
                className="btn-shine mr-2 px-6 py-2.5 bg-[#C18C5D] hover:bg-[#AF7B4E] active:scale-95 text-white font-semibold text-xs rounded-full transition-all duration-200 shrink-0 flex items-center gap-1.5 shadow-[0_4px_20px_-2px_rgba(193,140,93,0.4)]"
              >
                <span>Verify Evidence</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Test Fixture Quick Links */}
            <div className="text-xs text-[#78786C] mt-4 flex flex-wrap items-center justify-center gap-2.5">
              <span className="font-medium text-[#4A4A40]">Try test fixtures:</span>
              <button
                type="button"
                onClick={() => router.push("/verify?ref=BHS-2M7D-9KQX")}
                className="px-3.5 py-1.5 rounded-full bg-[#5D7052]/10 text-[#5D7052] font-mono text-[11px] font-semibold hover:bg-[#5D7052]/20 transition-all duration-200 border border-[#5D7052]/20 hover:border-[#5D7052]/40"
              >
                ✓ BHS-2M7D-9KQX
              </button>
              <button
                type="button"
                onClick={() => router.push("/verify?ref=BHS-88X9-4K2M")}
                className="px-3.5 py-1.5 rounded-full bg-[#A85448]/10 text-[#A85448] font-mono text-[11px] font-semibold hover:bg-[#A85448]/20 transition-all duration-200 border border-[#A85448]/20 hover:border-[#A85448]/40"
              >
                ⚠ BHS-88X9-4K2M
              </button>
            </div>
          </form>

          {/* Privacy Guarantee */}
          <div className="animate-fade-in-up stagger-5 pt-1 text-xs text-[#78786C] flex items-center justify-center gap-2">
            <Lock className="w-3.5 h-3.5 text-[#5D7052]" />
            <span>Privacy-first verification · Zero owner PII is exposed in public verification</span>
          </div>
        </div>
      </section>

      {/* ─── Entry Pathways Section ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C18C5D]/10 border border-[#C18C5D]/25 text-[#C18C5D] text-[10px] font-bold tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            VERIFICATION PATHWAYS
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C2C24]">
            Three Entry Pathways
          </h2>
          <p className="text-sm text-[#78786C] max-w-lg mx-auto">
            Choose your preferred path to verify land record evidence authenticity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Scan QR */}
          <div className="organic-card rounded-3xl p-8 flex flex-col justify-between space-y-6 group hover:-translate-y-1.5 hover:shadow-lift transition-all duration-300">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#5D7052]/10 text-[#5D7052] flex items-center justify-center group-hover:bg-[#5D7052] group-hover:text-[#F3F4F1] transition-all duration-300 group-hover:shadow-[0_4px_16px_-2px_rgba(93,112,82,0.3)]">
                <QrCode className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#2C2C24]">Scan QR</h3>
              <p className="text-sm text-[#78786C] leading-relaxed">
                Scan an issued BhuSetu QR code on a physical deed extract, patta, or official RTC document.
              </p>
            </div>
            <Link
              href="/verify?tab=qr"
              className="w-full py-3 px-4 bg-[#F0EBE5] hover:bg-[#E6DCCD] text-[#2C2C24] text-xs font-semibold rounded-full flex items-center justify-center gap-2 transition-all duration-200 border border-[#DED8CF] active:scale-95 group-hover:bg-[#5D7052]/10 group-hover:border-[#5D7052]/25 group-hover:text-[#5D7052]"
            >
              <span>Scan QR Code</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>

          {/* Enter Reference — Featured / Primary CTA */}
          <div className="organic-card rounded-3xl p-8 flex flex-col justify-between space-y-6 border-2 border-[#C18C5D]/40 shadow-float group hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden">
            {/* Subtle gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C18C5D] via-[#E0A97D] to-[#C18C5D]" />
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#C18C5D]/15 text-[#C18C5D] flex items-center justify-center group-hover:bg-[#C18C5D] group-hover:text-white transition-all duration-300 group-hover:shadow-[0_4px_16px_-2px_rgba(193,140,93,0.4)]">
                <Search className="w-7 h-7" />
              </div>
              <div>
                <span className="inline-block text-[9px] font-bold uppercase tracking-widest text-[#C18C5D] bg-[#C18C5D]/10 px-2 py-0.5 rounded-full mb-2">Most Used</span>
                <h3 className="font-serif text-lg font-bold text-[#2C2C24]">Enter Reference</h3>
              </div>
              <p className="text-sm text-[#78786C] leading-relaxed">
                Enter an authorized 12-character verification reference printed on registered revenue certificates.
              </p>
            </div>
            <Link
              href="/verify?tab=ref"
              className="btn-shine w-full py-3 px-4 bg-[#C18C5D] hover:bg-[#AF7B4E] text-white text-xs font-semibold rounded-full flex items-center justify-center gap-2 transition-all duration-200 shadow-[0_4px_20px_-2px_rgba(193,140,93,0.4)] active:scale-95"
            >
              <span>Enter Reference Code</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Upload Document */}
          <div className="organic-card rounded-3xl p-8 flex flex-col justify-between space-y-6 group hover:-translate-y-1.5 hover:shadow-lift transition-all duration-300">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#5D7052]/10 text-[#5D7052] flex items-center justify-center group-hover:bg-[#5D7052] group-hover:text-[#F3F4F1] transition-all duration-300 group-hover:shadow-[0_4px_16px_-2px_rgba(93,112,82,0.3)]">
                <Upload className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#2C2C24]">Upload Document</h3>
              <p className="text-sm text-[#78786C] leading-relaxed">
                Compare an approved document binary fingerprint using client-side SHA-256 cryptographic hashing.
              </p>
            </div>
            <Link
              href="/verify?tab=upload"
              className="w-full py-3 px-4 bg-[#F0EBE5] hover:bg-[#E6DCCD] text-[#2C2C24] text-xs font-semibold rounded-full flex items-center justify-center gap-2 transition-all duration-200 border border-[#DED8CF] active:scale-95 group-hover:bg-[#5D7052]/10 group-hover:border-[#5D7052]/25 group-hover:text-[#5D7052]"
            >
              <span>Compare Document Hash</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Verified Evidence Card Sample Visual ─── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="organic-card rounded-3xl p-6 sm:p-8 space-y-6 border-l-4 border-l-[#5D7052] glow-verified">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#DED8CF]/70 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-[#5D7052]/10 flex items-center justify-center text-[#5D7052] shrink-0">
                <CheckCircle2 className="w-6 h-6 text-[#5D7052]" />
              </div>
              <div>
                <span className="inline-block px-3 py-0.5 text-[11px] font-extrabold uppercase tracking-wider rounded-full bg-[#E8F5EE] text-[#1E7B4D] border border-[#A7F3D0]">
                  ✓ EVIDENCE VERIFIED
                </span>
                <h3 className="font-serif text-lg font-bold text-[#2C2C24] mt-1">Authorized Evidence Match</h3>
              </div>
            </div>
            <div className="text-xs font-mono bg-[#F0EBE5] text-[#2C2C24] px-4 py-2 rounded-full border border-[#DED8CF] font-bold self-start sm:self-auto flex items-center gap-2">
              <Fingerprint className="w-3.5 h-3.5 text-[#C18C5D]" />
              BHS-2M7D-9KQX
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#FDFCF8] p-5 rounded-2xl border border-[#DED8CF]/80 font-mono">
            <div>
              <span className="text-[#78786C] block text-[11px] mb-1">Authorized Source</span>
              <span className="font-bold text-[#2C2C24]">Pilot Revenue Department · Bengaluru</span>
            </div>
            <div>
              <span className="text-[#78786C] block text-[11px] mb-1">Issue Timestamp</span>
              <span className="font-bold text-[#2C2C24]">19 Sep 2026 · 10:42:18 IST</span>
            </div>
            <div>
              <span className="text-[#78786C] block text-[11px] mb-1">Masked Parcel Reference</span>
              <span className="font-bold text-[#2C2C24]">AP-XX-•••-041</span>
            </div>
            <div>
              <span className="text-[#78786C] block text-[11px] mb-1">Verification Reference</span>
              <span className="font-bold text-[#C18C5D]">BHS-2M7D-9KQX</span>
            </div>
          </div>

          {/* Statutory Notice */}
          <div className="bg-[#242823] text-[#DED8CF] p-5 rounded-2xl text-xs space-y-1.5 border border-[#363E34]">
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#F0EBE5]/70 to-[#FDFCF8] rounded-3xl p-8 sm:p-12 space-y-10 border border-[#DED8CF]/60">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#5D7052]/10 border border-[#5D7052]/25 text-[#5D7052] text-[10px] font-bold tracking-widest uppercase">
              <Cpu className="w-3.5 h-3.5" />
              PLATFORM ARCHITECTURE
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C2C24]">
              Core Technical Architecture
            </h3>
            <p className="text-sm text-[#78786C] max-w-lg mx-auto">
              Designed for Indian digital public infrastructure, cryptographic security, and statutory auditability.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
            {[
              {
                icon: <CheckCircle2 className="w-5 h-5" />,
                iconBg: "bg-[#5D7052]/10 text-[#5D7052]",
                title: "Authoritative Source First",
                desc: "Blockchain records integrity and provenance; official State Revenue & Court records remain sole legal authority.",
              },
              {
                icon: <Lock className="w-5 h-5" />,
                iconBg: "bg-[#5D7052]/10 text-[#5D7052]",
                title: "PII Protected Off-Chain",
                desc: "No owner PII, document PDFs, or raw coordinates are ever placed on the blockchain or in public responses.",
              },
              {
                icon: <Cpu className="w-5 h-5" />,
                iconBg: "bg-[#C18C5D]/15 text-[#C18C5D]",
                title: "Server-Side Maker-Checker",
                desc: "Strict separation of duties. Submitting creator cannot approve their own evidence proposal.",
              },
              {
                icon: <AlertTriangle className="w-5 h-5" />,
                iconBg: "bg-[#A85448]/10 text-[#A85448]",
                title: "Dispute Hold Protection",
                desc: "Active court/revenue dispute holds immediately override positive verification to protect citizens.",
              },
            ].map((item, idx) => (
              <div
                key={item.title}
                className="bg-[#FEFEFA] p-6 rounded-2xl border border-[#DED8CF]/80 space-y-3 shadow-soft hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className={`w-10 h-10 rounded-xl ${item.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  {item.icon}
                </div>
                <h4 className="font-serif font-bold text-sm text-[#2C2C24]">{item.title}</h4>
                <p className="text-[#78786C] leading-relaxed text-xs">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-[#1F241E] rounded-3xl p-8 sm:p-10 text-center space-y-5 border border-[#363E34] overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-[#5D7052]/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-5">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#F3F4F1]">
              Start verifying land records today
            </h2>
            <p className="text-sm text-[#A8A399] max-w-lg mx-auto">
              Submit a document hash or paste a verification reference to get an instant cryptographic result.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/verify"
                className="btn-shine inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#C18C5D] hover:bg-[#AF7B4E] text-white font-semibold text-sm rounded-full transition-all duration-200 shadow-[0_4px_20px_-2px_rgba(193,140,93,0.4)] active:scale-95"
              >
                <span>Verify a Record</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#2A3129] hover:bg-[#363E34] text-[#F3F4F1] font-semibold text-sm rounded-full transition-all duration-200 border border-[#363E34] active:scale-95"
              >
                <span>How It Works</span>
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
