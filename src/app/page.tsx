"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Search, FileCheck2, UserCheck, PlayCircle, Lock, Cpu, CheckCircle2, AlertTriangle, FileSpreadsheet, Cloud, DollarSign } from "lucide-react";

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
      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            Blockchain-Based Land Record Evidence Verification
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight max-w-3xl mx-auto">
            Tamper-Evident Land Evidence Verification Layer
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Verify official land document fingerprints, trace permissioned Hyperledger Fabric ledger provenance, and inspect current dispute status without exposing private personal information.
          </p>

          {/* Quick Verification Search */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto pt-4">
            <div className="relative flex items-center shadow-2xl rounded-xl overflow-hidden border border-slate-700 bg-slate-800/80 backdrop-blur focus-within:border-emerald-500 transition-colors">
              <Search className="w-5 h-5 text-slate-400 ml-4 shrink-0" />
              <input
                type="text"
                placeholder="Enter Verification Reference (e.g. BHS-2M7D-9KQX)..."
                value={quickRef}
                onChange={(e) => setQuickRef(e.target.value)}
                className="w-full py-4 px-4 bg-transparent text-white placeholder-slate-400 focus:outline-none text-sm sm:text-base font-mono"
              />
              <button
                type="submit"
                className="mr-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-lg transition-colors shrink-0 flex items-center gap-1.5"
              >
                <span>Verify</span>
              </button>
            </div>
            <div className="text-xs text-slate-400 mt-2 text-left flex justify-between px-1">
              <span>Try pilot reference: <code className="text-emerald-400 font-mono">BHS-2M7D-9KQX</code> (Verified)</span>
              <span>Disputed: <code className="text-red-400 font-mono">BHS-88X9-4K2M</code></span>
            </div>
          </form>
        </div>
      </section>

      {/* Main Portals Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Public Verification Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Verify Land Record</h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Check an issued verification reference, scan a QR code, or upload an official PDF extract to verify SHA-256 fingerprint authenticity.
              </p>
            </div>
            <div className="pt-6">
              <Link
                href="/verify"
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <span>Open Verification Portal</span>
              </Link>
            </div>
          </div>

          {/* Officer Workspace Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <UserCheck className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Officer MVP Workspace</h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Role-based workflow for Registration Makers, Revenue Checkers, Survey Officers, Dispute Liaisons, and Auditors. Enforces maker-checker separation.
              </p>
            </div>
            <div className="pt-6">
              <Link
                href="/officer"
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <span>Access Officer Workspace</span>
              </Link>
            </div>
          </div>

          {/* Interactive Demo Runner Card */}
          <div className="bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold border border-amber-500/30">
                <PlayCircle className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white">Pilot Demo Script</h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Step-by-step interactive walkthrough executing all 8 pilot evaluation scenarios: Hash Match, 1-byte Mismatch, Maker-Checker Guard, Dispute Holds, and Ledger Audit.
              </p>
            </div>
            <div className="pt-6">
              <Link
                href="/demo"
                className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-extrabold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <span>Launch Interactive Demo</span>
              </Link>
            </div>
          </div>
        </div>

        {/* AWS Architecture & Credit Guardrail Highlight Card */}
        <div className="mt-8 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white border border-slate-700 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider border border-amber-500/30">
              <DollarSign className="w-3.5 h-3.5" />
              AWS Pilot Credit Guardrails • ap-south-1
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              AWS Serverless Architecture & $100 Budget Guardrail
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Enforcing TRD Section 3 cost-guardrails on AWS Asia Pacific (Mumbai). Real-time monitoring across DynamoDB, private S3 evidence, Lambda, and KMS with automated alert thresholds at $10, $25, $50, $75, and emergency circuit breaker.
            </p>
          </div>
          <Link
            href="/aws-credits"
            className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-extrabold rounded-xl shadow-lg transition-colors shrink-0 flex items-center gap-2"
          >
            <Cloud className="w-4 h-4" />
            <span>Open AWS Credit Guardrails</span>
          </Link>
        </div>
      </section>


      {/* Core Architecture Principles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-slate-100 rounded-2xl p-8 border border-slate-200 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-2xl font-bold text-slate-900">BhuSetu Architectural Principles</h3>
            <p className="text-sm text-slate-600">Designed strictly in accordance with PRD & TRD product safety guidelines.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <h4 className="font-bold text-slate-900 text-sm">Authoritative Source First</h4>
              <p className="text-xs text-slate-600">Blockchain records integrity and provenance; official State Revenue & Court records remain legal authority.</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
              <Lock className="w-6 h-6 text-blue-600" />
              <h4 className="font-bold text-slate-900 text-sm">PII Protected Off-Chain</h4>
              <p className="text-xs text-slate-600">No owner PII, document PDFs, or raw coordinates are ever placed on the blockchain or public response.</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
              <Cpu className="w-6 h-6 text-purple-600" />
              <h4 className="font-bold text-slate-900 text-sm">Server-Side Maker-Checker</h4>
              <p className="text-xs text-slate-600">Strict separation of duties. Submitting creator cannot approve their own evidence event.</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
              <h4 className="font-bold text-slate-900 text-sm">Dispute Hold Protection</h4>
              <p className="text-xs text-slate-600">Active court/revenue dispute holds immediately override positive verification to protect citizens and verifiers.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
