import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Fraunces, Nunito, JetBrains_Mono } from "next/font/google";
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
import { BhuSetuLogo } from "@/components/BhuSetuLogo";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  weight: ["400", "600", "700", "800"],
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BhuSetu (भू-सेतु) | Land Record Verification Platform",
  description:
    "Official portal to verify land record authenticity and check for court disputes.",
};

const NAV_LINKS = [
  {
    href: "/verify",
    label: "Verify Record",
    icon: <FileCheck2 className="w-4 h-4 text-[#5D7052]" />,
    isSpecial: false,
  },
  {
    href: "/how-it-works",
    label: "How It Works",
    icon: <BookOpen className="w-4 h-4 text-[#5D7052]" />,
    isSpecial: false,
  },
  {
    href: "/officer",
    label: "Officer Portal",
    icon: <UserCheck className="w-4 h-4 text-[#C18C5D]" />,
    isSpecial: false,
  },
  {
    href: "/officer/audit",
    label: "Audit Log",
    icon: <History className="w-4 h-4 text-[#78786C]" />,
    isSpecial: false,
  },
];

const FOOTER_LINKS = [
  { href: "/verify", label: "Verify Record" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/officer", label: "Officer Portal" },
  { href: "/officer/audit", label: "Audit Log" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${nunito.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-[#FDFCF8] text-[#2C2C24] font-sans antialiased min-h-screen flex flex-col relative selection:bg-[#5D7052]/20 selection:text-[#2C2C24]">
        {/* ─── Floating Pill Header ─── */}
        <header className="sticky top-3 z-50 px-3 sm:px-6 max-w-7xl mx-auto w-full">
          <div className="bg-[#FEFEFA]/90 backdrop-blur-md border border-[#DED8CF]/80 shadow-[0_4px_20px_-2px_rgba(93,112,82,0.12)] rounded-full px-3 sm:px-6 py-2 transition-all duration-300">
            <div className="flex items-center justify-between gap-3">
              {/* Brand */}
              <Link href="/" className="flex items-center group shrink-0">
                <BhuSetuLogo variant="header" size="md" showSubtitle={true} />
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ${
                      link.isSpecial
                        ? "bg-[#C18C5D]/15 text-[#AF7B4E] border border-[#C18C5D]/30 hover:bg-[#C18C5D]/25"
                        : "text-[#4A4A40] hover:text-[#2C2C24] hover:bg-[#5D7052]/10"
                    }`}
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
                    className={`px-2.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors ${
                      link.isSpecial
                        ? "bg-[#C18C5D]/15 text-[#AF7B4E] border border-[#C18C5D]/30"
                        : "text-[#4A4A40] hover:bg-[#5D7052]/10"
                    }`}
                    title={link.label}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                ))}
              </nav>

              {/* Official status badge (desktop) */}
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-[#5D7052]/10 rounded-full border border-[#5D7052]/20 text-[10px] font-mono text-[#5D7052] font-semibold shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-[#5D7052]" />
                <span>Govt of India · Pilot</span>
              </div>
            </div>
          </div>

          {/* Mobile navigation bar */}
          <nav className="sm:hidden mt-1.5 flex bg-[#FEFEFA]/95 backdrop-blur-md border border-[#DED8CF]/80 shadow-sm rounded-2xl px-1 py-1 overflow-x-auto justify-around">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex-1 min-w-[56px] flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 text-[10px] font-medium transition-colors rounded-xl ${
                  link.isSpecial ? "text-[#AF7B4E] font-semibold" : "text-[#4A4A40] hover:text-[#2C2C24]"
                }`}
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

        {/* ─── Footer ─── */}
        <footer className="bg-[#1F241E] text-[#DED8CF] text-xs py-12 border-t border-[#363E34] mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            {/* Top row: brand + nav links */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b border-[#363E34]">
              <div className="space-y-2">
                <Link href="/" className="inline-block group">
                  <BhuSetuLogo variant="footer" size="sm" showSubtitle={false} />
                </Link>
                <p className="text-[11px] text-[#A8A399] max-w-xs leading-relaxed">
                  Land Record Verification Pilot · State Revenue Department · Andhra Pradesh
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-[#C2BDB2]">
                  <Phone className="w-3 h-3 text-[#5D7052]" />
                  Helpdesk:{" "}
                  <strong className="text-[#F3F4F1]">1800-419-7388</strong>
                  <span className="mx-2 text-[#78786C]">·</span>
                  Jurisdiction:{" "}
                  <code className="text-[#E6DCCD] font-mono">AP / Guntur / Tenali</code>
                </div>
              </div>

              {/* Footer Nav Links */}
              <div className="grid grid-cols-2 gap-x-10 gap-y-1.5 text-[11px]">
                <div className="text-[#A8A399] font-semibold uppercase tracking-widest text-[10px] col-span-2 mb-1">
                  Platform
                </div>
                {FOOTER_LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="text-[#C2BDB2] hover:text-[#F3F4F1] transition-colors"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Legal Notice */}
            <div className="flex items-start gap-3 bg-[#2A3129] p-4 rounded-2xl border border-[#3D473B]">
              <Lock className="w-4 h-4 text-[#5D7052] shrink-0 mt-0.5" />
              <p className="leading-relaxed text-[#DED8CF] max-w-4xl text-[11px]">
                <strong className="text-[#F3F4F1]">Legal Notice:</strong> BhuSetu checks document fingerprints against official government records as per Section 65B of the IT Act, 2000. Official State Revenue Offices, Registration Departments, and Courts remain the sole legal authority. A verified result confirms the document matches official records on file, but does not replace court rulings or registration deeds.
              </p>
            </div>

            {/* Bottom bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center text-[10px] text-[#8C867B] pt-2 border-t border-[#363E34] gap-2">
              <div>© 2026 BhuSetu Platform · Built on AWS Serverless &amp; Secure Blockchain</div>
              <div className="flex items-center gap-3">
                <span>WCAG 2.2 AA Accessible</span>
                <span>·</span>
                <span>Minimal PII Disclosure Policy</span>
                <span>·</span>
                <Link href="/how-it-works" className="hover:text-[#F3F4F1] transition-colors">
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
