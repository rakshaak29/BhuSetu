import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Phone,
  Cpu,
  FileCheck2,
  UserCheck,
  BookOpen,
  History,
  Landmark,
} from "lucide-react";

export const metadata: Metadata = {
  title: "BhuSetu (भू-सेतु) | Land Record Evidence Verification Platform",
  description:
    "Official district pilot for cryptographically verifiable land record evidence in India.",
};

const NAV_LINKS = [
  {
    href: "/verify",
    label: "Verify Record",
    icon: <FileCheck2 className="w-4 h-4 text-emerald-400" />,
    className: "text-slate-200 hover:bg-slate-800",
  },
  {
    href: "/how-it-works",
    label: "How It Works",
    icon: <BookOpen className="w-4 h-4 text-sky-400" />,
    className: "text-slate-200 hover:bg-slate-800",
  },
  {
    href: "/officer",
    label: "Officer Portal",
    icon: <UserCheck className="w-4 h-4 text-blue-400" />,
    className: "text-slate-200 hover:bg-slate-800",
  },
  {
    href: "/officer/audit",
    label: "Audit Log",
    icon: <History className="w-4 h-4 text-purple-400" />,
    className: "text-slate-200 hover:bg-slate-800",
  },
  {
    href: "/demo",
    label: "Demo Script",
    icon: <Landmark className="w-4 h-4 text-amber-400" />,
    className:
      "bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20",
  },
];

const FOOTER_LINKS = [
  { href: "/verify", label: "Verify Record" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/officer", label: "Officer Portal" },
  { href: "/officer/audit", label: "Audit Log" },
  { href: "/demo", label: "Demo Script" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-parchment-base text-carbon-primary font-sans antialiased min-h-screen flex flex-col">
        {/* ─── Header ─── */}
        <header className="bg-carbon-primary text-white border-b border-slate-800 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 gap-4">
              {/* Brand */}
              <Link href="/" className="flex items-center space-x-3 group shrink-0">
                <div className="w-9 h-9 rounded-lg bg-terracotta flex items-center justify-center shadow-sm group-hover:bg-terracotta-hover transition-colors">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-extrabold text-base tracking-tight flex items-center gap-2 leading-tight">
                    <span>BhuSetu</span>
                    <span className="text-slate-400 text-xs font-normal hidden sm:inline">
                      | भू-सेतु
                    </span>
                    <span className="bg-emerald-950 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-mono border border-emerald-800 hidden md:inline">
                      ST-UT/REV PILOT
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 hidden sm:block leading-tight">
                    Revenue &amp; Registration Verification · Bengaluru District
                  </div>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${link.className}`}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                ))}
              </nav>

              {/* Tablet: condensed navigation */}
              <nav className="hidden sm:flex lg:hidden items-center gap-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${link.className}`}
                    title={link.label}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                ))}
              </nav>

              {/* Node status badge (desktop) */}
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/80 rounded border border-slate-700 text-[10px] font-mono text-emerald-400 shrink-0">
                <Cpu className="w-3 h-3" />
                <span>Node #256 · Online</span>
              </div>
            </div>
          </div>

          {/* Mobile navigation bar */}
          <nav className="sm:hidden flex border-t border-slate-800/80 bg-slate-900/90 backdrop-blur px-1 py-1 overflow-x-auto justify-around">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex-1 min-w-[56px] flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 text-[10px] font-medium transition-colors rounded ${link.className}`}
              >
                {link.icon}
                <span className="text-center leading-tight text-[9px] whitespace-nowrap">
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>
        </header>

        {/* ─── Main Content ─── */}
        <main className="flex-1">{children}</main>

        {/* ─── Institutional Footer ─── */}
        <footer className="bg-carbon-primary text-slate-400 text-xs py-10 border-t border-slate-800 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            {/* Top row: brand + nav links */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b border-slate-800">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-300 font-bold">
                  <ShieldCheck className="w-4 h-4 text-terracotta" />
                  <span>BhuSetu | भू-सेतु</span>
                </div>
                <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
                  Permissioned Hyperledger Fabric Ledger Pilot · State/UT Land Administration · Bengaluru District
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Phone className="w-3 h-3" />
                  Helpdesk:{" "}
                  <strong className="text-slate-300">1800-419-7388</strong>
                  <span className="mx-2">·</span>
                  Jurisdiction:{" "}
                  <code className="text-slate-200 font-mono">AP / Guntur / Tenali</code>
                </div>
              </div>

              {/* Footer Nav Links */}
              <div className="grid grid-cols-2 gap-x-10 gap-y-1.5 text-[11px]">
                <div className="text-slate-500 font-semibold uppercase tracking-widest text-[10px] col-span-2 mb-1">
                  Platform
                </div>
                {FOOTER_LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* §65B Statutory Evidentiary Notice */}
            <div className="flex items-start gap-3">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed text-slate-400 max-w-4xl text-[11px]">
                <strong className="text-slate-300">Statutory Evidentiary Notice:</strong> BhuSetu verifies evidence document fingerprints and records append-only history pursuant to §65B Information Technology Act 2000. Official State Revenue, Registration, Survey/Settlement, and Judicial systems remain the sole legal authority. A verified result indicates evidence authenticity at the recorded time and is not a conclusive guarantee of legal title.
              </p>
            </div>

            {/* Bottom bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-500 pt-2 border-t border-slate-800 gap-2">
              <div>© 2026 BhuSetu Platform · Built on AWS Serverless &amp; Hyperledger Fabric</div>
              <div className="flex items-center gap-3">
                <span>WCAG 2.2 AA Accessible</span>
                <span>·</span>
                <span>Minimal PII Disclosure Policy</span>
                <span>·</span>
                <Link href="/how-it-works" className="hover:text-slate-300 transition-colors">
                  Transparency Guide
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
