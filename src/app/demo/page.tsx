"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Play, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  FileCheck2, 
  Lock, 
  UserCheck, 
  Download, 
  ArrowRight,
  RefreshCw,
  Sparkles,
  Terminal,
  Layers,
  Scale,
  History
} from "lucide-react";

export default function DemoPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [stepResults, setStepResults] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(false);

  const demoOriginalText = "OFFICIAL RECORD OF RIGHTS (ROR) EXTRACT - TEHSIL TENALI, GUNTUR DISTRICT. PARCEL AP-GNT-SUR-2024-041. AREA: 2.45 ACRES. CLASSIFICATION: WET AGRICULTURAL LAND.";
  const demoTamperedText = "OFFICIAL RECORD OF RIGHTS (ROR) EXTRACT - TEHSIL TENALI, GUNTUR DISTRICT. PARCEL AP-GNT-SUR-2024-041. AREA: 9.45 ACRES. CLASSIFICATION: WET AGRICULTURAL LAND.";

  const executeStep = async (stepNum: number) => {
    setLoading(true);
    try {
      let resData: any = null;

      switch (stepNum) {
        case 1: {
          const res = await fetch("/api/v1/verify/reference", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reference: "BHS-2M7D-9KQX" })
          });
          resData = await res.json();
          break;
        }

        case 2: {
          const res = await fetch("/api/v1/verify/document", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileContent: demoOriginalText, fileName: "original_ror_041.pdf" })
          });
          resData = await res.json();
          break;
        }

        case 3: {
          const res = await fetch("/api/v1/verify/document", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileContent: demoTamperedText, fileName: "tampered_ror_041.pdf" })
          });
          resData = await res.json();
          break;
        }

        case 4: {
          const res = await fetch("/api/v1/evidence", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              parcelId: "PCL-AP-GNT-041",
              evidenceType: "MUTATION_ORDER",
              sourceSystem: "Tenali Registration Office",
              sourceReference: "MUT-DEMO-2026-001",
              fileContent: demoOriginalText + " [MUTATION TRANSFER]",
              actorId: "user-reg-maker-01"
            })
          });
          resData = await res.json();
          break;
        }

        case 5: {
          const pendingEvtId = stepResults[4]?.event?.eventId || "evt-041-issue";
          const res = await fetch(`/api/v1/evidence/${pendingEvtId}/approve`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              actorId: "user-reg-maker-01",
              approvalReason: "Self approval attempt"
            })
          });
          resData = await res.json();
          resData.status = res.status;
          break;
        }

        case 6: {
          const pendingEvtId = stepResults[4]?.event?.eventId || "evt-041-issue";
          const res = await fetch(`/api/v1/evidence/${pendingEvtId}/approve`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              actorId: "user-rev-checker-01",
              approvalReason: "Verified mutation deed and approved for pilot ledger commit"
            })
          });
          resData = await res.json();
          break;
        }

        case 7: {
          const res = await fetch("/api/v1/parcels/PCL-AP-GNT-041/disputes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              actorId: "user-dispute-01",
              disputeHold: true,
              disputeReason: "Interim title stay by Tenali Civil Court",
              disputeReference: "COURT-INJUNCTION-2026-99"
            })
          });
          const disputeRes = await res.json();

          const verifyRes = await fetch("/api/v1/verify/reference", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reference: "BHS-2M7D-9KQX" })
          });
          const publicStatus = await verifyRes.json();
          resData = { disputeRes, publicStatus };
          break;
        }

        case 8: {
          const res = await fetch("/api/v1/audit/export");
          resData = await res.json();
          break;
        }
      }

      setStepResults(prev => ({ ...prev, [stepNum]: resData }));
      if (stepNum < 8) setCurrentStep(stepNum + 1);
    } catch (err: any) {
      setStepResults(prev => ({ ...prev, [stepNum]: { error: err.message } }));
    } finally {
      setLoading(false);
    }
  };

  const stepsInfo = [
    { num: 1, title: "Public Reference Verification", desc: "Verify synthetic parcel reference BHS-2M7D-9KQX", icon: <FileCheck2 className="w-4 h-4" /> },
    { num: 2, title: "Original Document Upload", desc: "Compute SHA-256 fingerprint & demonstrate VERIFIED match", icon: <ShieldCheck className="w-4 h-4" /> },
    { num: 3, title: "Tampered Document Check", desc: "Modify 1 character (2.45 to 9.45 acres) -> demonstrate MISMATCH", icon: <AlertTriangle className="w-4 h-4" /> },
    { num: 4, title: "Registration Maker Mutation", desc: "Sign in as Maker and submit pending mutation proposal", icon: <Layers className="w-4 h-4" /> },
    { num: 5, title: "Maker Self-Approval Rejection", desc: "Attempt Maker self-approval -> demonstrate HTTP 403 block", icon: <Lock className="w-4 h-4" /> },
    { num: 6, title: "Revenue Checker Approval", desc: "Distinct Checker approves -> commit to Fabric ledger", icon: <UserCheck className="w-4 h-4" /> },
    { num: 7, title: "Civil Court Dispute Hold", desc: "Apply dispute hold -> public result immediately becomes DISPUTED", icon: <Scale className="w-4 h-4" /> },
    { num: 8, title: "Audit Trail Reconstruction", desc: "Export complete traceable event audit log", icon: <History className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#242A22] via-[#2A3127] to-[#1F241E] text-[#F3F4F1] p-6 sm:p-8 border border-[#3E4A3B] shadow-float space-y-4">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#5D7052]/20 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-[#C18C5D]/15 rounded-full blur-3xl pointer-events-none -mb-20" />

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C18C5D]/20 border border-[#C18C5D]/40 text-[#E0B286] text-[11px] font-semibold tracking-wider uppercase">
            <Play className="w-3.5 h-3.5 fill-current" />
            Interactive Pilot Evaluation Runner
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
            BhuSetu 8-Step Pilot Demonstration
          </h1>
          <p className="text-xs sm:text-sm text-[#A8AEA4] max-w-2xl leading-relaxed">
            Execute the complete end-to-end evaluation pipeline: public verification, cryptographic mismatch defense, multi-org maker-checker dual controls, court injunction interlock, and immutable audit export.
          </p>
        </div>
      </div>

      {/* Steps Pipeline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        {stepsInfo.map((s) => {
          const isDone = !!stepResults[s.num];
          const isCurrent = currentStep === s.num;

          return (
            <div
              key={s.num}
              onClick={() => executeStep(s.num)}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-2 ${
                isDone
                  ? "bg-[#EEF4EB] border-[#A8C89C] text-[#2D5A27] shadow-xs"
                  : isCurrent
                  ? "bg-[#FEFEFA] border-[#5D7052] ring-2 ring-[#5D7052]/20 text-[#2C2C24] font-bold shadow-soft scale-[1.02]"
                  : "bg-[#FEFEFA] border-[#DED8CF] text-[#78786C] hover:border-[#5D7052]/50 hover:bg-[#F0EBE5]/50"
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span className="inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider">
                  Step {s.num}
                </span>
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-[#437C3C]" />
                ) : (
                  <span className="text-[#8B9387]">{s.icon}</span>
                )}
              </div>
              <div className="font-semibold text-[11.5px] leading-snug line-clamp-2">
                {s.title}
              </div>
            </div>
          );
        })}
      </div>

      {/* Current Step Execution Box */}
      <div className="organic-card rounded-3xl border border-[#DED8CF] p-6 sm:p-8 space-y-6 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DED8CF]/70 pb-5">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-[#C18C5D] uppercase tracking-wider inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Active Demonstration Step
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2C2C24]">
              Step {currentStep}: {stepsInfo[currentStep - 1].title}
            </h2>
            <p className="text-xs sm:text-sm text-[#78786C] leading-relaxed">
              {stepsInfo[currentStep - 1].desc}
            </p>
          </div>

          <button
            onClick={() => executeStep(currentStep)}
            disabled={loading}
            className="btn-shine px-7 py-3 bg-[#5D7052] hover:bg-[#4E5E44] text-[#F3F4F1] font-semibold text-xs rounded-full flex items-center justify-center gap-2 transition-all shrink-0 shadow-soft hover:shadow-lift active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running Step...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Execute Step {currentStep}</span>
              </>
            )}
          </button>
        </div>

        {/* Live Step Output Inspection */}
        {stepResults[currentStep] && (
          <div className="space-y-3 animate-fadeIn">
            <div className="flex items-center gap-2 text-[11px] font-bold text-[#78786C] uppercase tracking-wider">
              <Terminal className="w-3.5 h-3.5 text-[#5D7052]" />
              Live API Response Payload
            </div>

            <div className="bg-[#141812] text-[#D3D8CF] p-5 rounded-2xl text-xs font-mono overflow-x-auto space-y-2 border border-[#2D352A] shadow-inner-soft">
              <pre>{JSON.stringify(stepResults[currentStep], null, 2)}</pre>
            </div>
          </div>
        )}
      </div>

      {/* All Executed Results Summary */}
      {Object.keys(stepResults).length > 0 && (
        <div className="organic-card rounded-3xl border border-[#DED8CF] p-6 sm:p-7 space-y-4 shadow-soft animate-fadeIn">
          <h3 className="font-serif text-base font-bold text-[#2C2C24] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#5D7052]" />
            Executed Step Verification Log
          </h3>
          <div className="space-y-2.5 text-xs font-mono">
            {Object.entries(stepResults).map(([num, data]) => (
              <div 
                key={num} 
                className="bg-[#F0EBE5]/50 p-3.5 rounded-2xl border border-[#DED8CF] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <span className="font-semibold text-[#2C2C24]">
                  Step {num}: {stepsInfo[Number(num) - 1].title}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2D5A27] bg-[#EEF4EB] px-2.5 py-0.5 rounded-full border border-[#A8C89C] self-start sm:self-auto">
                  <CheckCircle2 className="w-3 h-3 text-[#437C3C]" />
                  COMPLETED
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
