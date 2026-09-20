"use client";

import { useState, useRef } from "react";
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
  ExternalLink,
  Play,
  Pause
} from "lucide-react";

export default function Home() {
  const [quickRef, setQuickRef] = useState("");
  const [videoPlaying, setVideoPlaying] = useState(true);
  const bgVideoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

  const toggleVideo = () => {
    if (bgVideoRef.current) {
      if (videoPlaying) {
        bgVideoRef.current.pause();
        setVideoPlaying(false);
      } else {
        bgVideoRef.current.play();
        setVideoPlaying(true);
      }
    }
  };

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
        {/* ─── Cinematic "Lands of India" Ambient Video Background ─── */}
        <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none select-none">
          <video
            ref={bgVideoRef}
            autoPlay
            loop
            muted
            playsInline
            poster="/assets/lands-of-india-poster.jpg"
            className="w-full h-full object-cover scale-105 opacity-[0.28] filter contrast-110 brightness-95 saturate-125 transition-opacity duration-700"
          >
            <source src="/assets/lands-of-india-480p.webm" type="video/webm" />
            <source src="/assets/lands-of-india.webm" type="video/webm" />
            <source src="/assets/lands-of-india.mp4" type="video/mp4" />
          </video>
          {/* Subtle sovereign organic tint & vignette to seamlessly blend with Fraunces typography */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#FDFCF8]/85 via-[#FDFCF8]/45 to-[#FDFCF8]" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#FDFCF8]/30 to-[#FDFCF8]/80" />
        </div>

        {/* Ambient atmospheric color washes */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-br from-[#5D7052]/12 via-[#C18C5D]/8 to-transparent rounded-full blur-3xl pointer-events-none -z-10 animate-breathe" />
        <div className="absolute top-1/3 left-[15%] w-[400px] h-[300px] bg-[#C18C5D]/8 rounded-full blur-3xl pointer-events-none -z-10 animate-float" />
        <div className="absolute bottom-0 right-[10%] w-[350px] h-[250px] bg-[#5D7052]/6 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto text-center space-y-8">
          {/* Pilot Badge & Live Ambient Tag */}
          <div className="animate-fade-in-up flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-[#5D7052]/10 border border-[#5D7052]/25 text-[#5D7052] text-[11px] font-bold tracking-widest uppercase">
              <ShieldCheck className="w-4 h-4 text-[#5D7052]" />
              LAND RECORD VERIFICATION
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FEFEFA]/80 backdrop-blur-md border border-[#DED8CF]/80 text-[#5D7052] text-[11px] font-medium shadow-soft">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5D7052] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5D7052]"></span>
              </span>
              <span>Lands of India • Terrace Farmland</span>
              <button
                type="button"
                onClick={toggleVideo}
                className="ml-1 text-[#78786C] hover:text-[#2C2C24] transition-colors pointer-events-auto cursor-pointer p-0.5"
                title={videoPlaying ? "Pause background video" : "Play background video"}
                aria-label={videoPlaying ? "Pause background video" : "Play background video"}
              >
                {videoPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Fraunces Headline */}
          <h1 className="animate-fade-in-up stagger-2 font-serif text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-[#2C2C24] leading-[1.12] max-w-3xl mx-auto">
            Check if your land document{" "}
            <span className="relative inline-block">
              <span className="relative z-10">is genuine.</span>
              <span className="absolute bottom-1 left-0 right-0 h-3 bg-[#5D7052]/10 rounded-full -z-0" />
            </span>
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-in-up stagger-3 text-base sm:text-lg text-[#78786C] max-w-2xl mx-auto leading-relaxed font-normal">
            Enter your verification code or upload a document to confirm it matches official government records. Your personal details stay private.
          </p>

          {/* Tactile Pill Search Bar */}
          <form onSubmit={handleSearch} className="animate-fade-in-up stagger-4 max-w-xl mx-auto pt-2">
            <div className="relative flex items-center shadow-[0_12px_40px_-10px_rgba(93,112,82,0.18)] rounded-full overflow-hidden border border-[#DED8CF] bg-[#FEFEFA]/95 backdrop-blur-sm focus-within:border-[#5D7052] focus-within:ring-2 focus-within:ring-[#5D7052]/20 focus-within:shadow-[0_12px_40px_-10px_rgba(93,112,82,0.25)] transition-all duration-300">
              <Search className="w-5 h-5 text-[#78786C] ml-4 shrink-0" />
              <input
                type="text"
                placeholder="Enter your verification code (e.g. BHS-2M7D-9KQX)..."
                value={quickRef}
                onChange={(e) => setQuickRef(e.target.value)}
                className="w-full py-4 px-3.5 bg-transparent text-[#2C2C24] placeholder-[#78786C]/70 focus:outline-none text-sm font-mono"
              />
              <button
                type="submit"
                className="btn-shine mr-2 px-6 py-2.5 bg-[#C18C5D] hover:bg-[#AF7B4E] active:scale-95 text-white font-semibold text-xs rounded-full transition-all duration-200 shrink-0 flex items-center gap-1.5 shadow-[0_4px_20px_-2px_rgba(193,140,93,0.4)]"
              >
                <span>Check Now</span>
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
            <span>Your personal details are never shown publicly during verification</span>
          </div>
        </div>
      </section>

      {/* ─── Entry Pathways Section ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C18C5D]/10 border border-[#C18C5D]/25 text-[#C18C5D] text-[10px] font-bold tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            WAYS TO VERIFY
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C2C24]">
            Three Ways to Verify
          </h2>
          <p className="text-sm text-[#78786C] max-w-lg mx-auto">
            Pick the method that works best for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Scan QR */}
          <div className="organic-card rounded-3xl p-8 flex flex-col justify-between space-y-6 group hover:-translate-y-1.5 hover:shadow-lift transition-all duration-300">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#5D7052]/10 text-[#5D7052] flex items-center justify-center group-hover:bg-[#5D7052] group-hover:text-[#F3F4F1] transition-all duration-300 group-hover:shadow-[0_4px_16px_-2px_rgba(93,112,82,0.3)]">
                <QrCode className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#2C2C24]">Scan QR Code</h3>
              <p className="text-sm text-[#78786C] leading-relaxed">
                Use your phone camera to scan the QR code printed on your land document (patta, RTC, or deed).
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

          {/* Enter Reference - Featured / Primary CTA */}
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
                Type the 12-character code (like BHS-2M7D-9KQX) printed on your official land certificate.
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
                Upload your land document file (PDF) and we will check if it matches the original on record.
              </p>
            </div>
            <Link
              href="/verify?tab=upload"
              className="w-full py-3 px-4 bg-[#F0EBE5] hover:bg-[#E6DCCD] text-[#2C2C24] text-xs font-semibold rounded-full flex items-center justify-center gap-2 transition-all duration-200 border border-[#DED8CF] active:scale-95 group-hover:bg-[#5D7052]/10 group-hover:border-[#5D7052]/25 group-hover:text-[#5D7052]"
            >
              <span>Upload and Check</span>
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
                <h3 className="font-serif text-lg font-bold text-[#2C2C24] mt-1">Document Verified Successfully</h3>
              </div>
            </div>
            <div className="text-xs font-mono bg-[#F0EBE5] text-[#2C2C24] px-4 py-2 rounded-full border border-[#DED8CF] font-bold self-start sm:self-auto flex items-center gap-2">
              <Fingerprint className="w-3.5 h-3.5 text-[#C18C5D]" />
              BHS-2M7D-9KQX
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#FDFCF8] p-5 rounded-2xl border border-[#DED8CF]/80 font-mono">
            <div>
              <span className="text-[#78786C] block text-[11px] mb-1">Issued By</span>
              <span className="font-bold text-[#2C2C24]">Revenue Department, Bengaluru (Pilot)</span>
            </div>
            <div>
              <span className="text-[#78786C] block text-[11px] mb-1">Date Issued</span>
              <span className="font-bold text-[#2C2C24]">19 Sep 2026, 10:42:18 IST</span>
            </div>
            <div>
              <span className="text-[#78786C] block text-[11px] mb-1">Land Parcel ID (Hidden)</span>
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
              <span>Important Legal Notice</span>
            </div>
            <p className="leading-relaxed text-[#C2BDB2] text-[11px]">
              This result confirms that the document matches an official record at the time shown. It does not by itself prove ownership, legal title, or freedom from any disputes.
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
              HOW WE KEEP RECORDS SAFE
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C2C24]">
              Built for Trust and Transparency
            </h3>
            <p className="text-sm text-[#78786C] max-w-lg mx-auto">
              Designed for Indian government needs with strong security and full transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
            {[
              {
                icon: <CheckCircle2 className="w-5 h-5" />,
                iconBg: "bg-[#5D7052]/10 text-[#5D7052]",
                title: "Government Records Come First",
                desc: "Your Revenue Office and Courts are always the final authority. BhuSetu only helps you check if a document is genuine.",
              },
              {
                icon: <Lock className="w-5 h-5" />,
                iconBg: "bg-[#5D7052]/10 text-[#5D7052]",
                title: "Your Privacy is Protected",
                desc: "Your name, Aadhaar, and personal details are never shown publicly. Only the verification result is visible.",
              },
              {
                icon: <Cpu className="w-5 h-5" />,
                iconBg: "bg-[#C18C5D]/15 text-[#C18C5D]",
                title: "Two Officers Must Approve",
                desc: "One officer uploads a document and a different officer approves it. No single person can change records alone.",
              },
              {
                icon: <AlertTriangle className="w-5 h-5" />,
                iconBg: "bg-[#A85448]/10 text-[#A85448]",
                title: "Court Cases Block Verification",
                desc: "If there is an active court case on a land parcel, the system will warn you right away to protect you from buying disputed property.",
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
              Ready to check your land document?
            </h2>
            <p className="text-sm text-[#A8A399] max-w-lg mx-auto">
              Enter your verification code or upload a document to get an instant result.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/verify"
                className="btn-shine inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#C18C5D] hover:bg-[#AF7B4E] text-white font-semibold text-sm rounded-full transition-all duration-200 shadow-[0_4px_20px_-2px_rgba(193,140,93,0.4)] active:scale-95"
              >
                <span>Check a Record</span>
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
