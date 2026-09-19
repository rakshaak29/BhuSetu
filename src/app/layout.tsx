import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { ShieldCheck, Lock, Landmark, FileCheck2, UserCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "BhuSetu | Blockchain-Based Land Ownership Verification",
  description: "Official district pilot for cryptographically verifiable land record evidence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-xl tracking-wider text-white shadow-md group-hover:bg-emerald-500 transition-colors">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-extrabold text-lg tracking-tight flex items-center gap-2">
                    BhuSetu <span className="bg-emerald-950 text-emerald-400 text-xs px-2 py-0.5 rounded font-mono border border-emerald-800">PILOT</span>
                  </div>
                  <div className="text-xs text-slate-400">Land Record Evidence Verification Layer</div>
                </div>
              </Link>

              <nav className="flex items-center space-x-1 sm:space-x-4">
                <Link
                  href="/verify"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-800 flex items-center gap-1.5 transition-colors text-slate-200"
                >
                  <FileCheck2 className="w-4 h-4 text-emerald-400" />
                  <span>Verify Record</span>
                </Link>
                <Link
                  href="/officer"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-800 flex items-center gap-1.5 transition-colors text-slate-200"
                >
                  <UserCheck className="w-4 h-4 text-blue-400" />
                  <span>Officer Portal</span>
                </Link>
                <Link
                  href="/demo"
                  className="px-3 py-2 rounded-md text-sm font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 flex items-center gap-1.5 transition-colors"
                >
                  <Landmark className="w-4 h-4" />
                  <span>Demo Script</span>
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2 text-slate-300 font-medium">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Permissioned Hyperledger Fabric Ledger Pilot • State/UT Land Administration</span>
              </div>
              <div className="text-slate-400">
                Jurisdiction: <span className="text-slate-200 font-mono">AP / Guntur / Tenali</span>
              </div>
            </div>

            <p className="leading-relaxed text-slate-400 max-w-4xl">
              <strong className="text-slate-300">Authoritative Source Notice:</strong> BhuSetu verifies evidence document fingerprints and records append-only history. Official State Revenue, Registration, Survey/Settlement, and Judicial systems remain the sole legal authority. A verified result indicates evidence authenticity at the recorded time and is not a conclusive guarantee of legal title.
            </p>

            <div className="flex justify-between items-center text-[11px] text-slate-500 pt-2">
              <div>© 2026 BhuSetu Platform • Built under AWS Serverless & Hyperledger Fabric Guidelines</div>
              <div>WCAG 2.2 AA Accessible • Minimal PII Disclosure Policy</div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
