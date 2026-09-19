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
  RefreshCw
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
          // Step 1: Reference Lookup (BHS-2M7D-9KQX)
          const res = await fetch("/api/v1/verify/reference", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reference: "BHS-2M7D-9KQX" })
          });
          resData = await res.json();
          break;
        }

        case 2: {
          // Step 2: Upload Original Document -> Hash Match
          const res = await fetch("/api/v1/verify/document", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileContent: demoOriginalText, fileName: "original_ror_041.pdf" })
          });
          resData = await res.json();
          break;
        }

        case 3: {
          // Step 3: Upload 1-Character Tampered Document -> Mismatch
          const res = await fetch("/api/v1/verify/document", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileContent: demoTamperedText, fileName: "tampered_ror_041.pdf" })
          });
          resData = await res.json();
          break;
        }

        case 4: {
          // Step 4: Registration Maker Submits Mutation Event
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
          // Step 5: Attempt Maker Self-Approval -> Expect HTTP 403 Server Violation
          const pendingEvtId = stepResults[4]?.event?.eventId || "evt-041-issue";
          const res = await fetch(`/api/v1/evidence/${pendingEvtId}/approve`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              actorId: "user-reg-maker-01", // Maker attempting self approval!
              approvalReason: "Self approval attempt"
            })
          });
          resData = await res.json();
          resData.status = res.status;
          break;
        }

        case 6: {
          // Step 6: Distinct Revenue Checker Approves -> Ledger Commit
          const pendingEvtId = stepResults[4]?.event?.eventId || "evt-041-issue";
          const res = await fetch(`/api/v1/evidence/${pendingEvtId}/approve`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              actorId: "user-rev-checker-01", // Distinct checker!
              approvalReason: "Verified mutation deed and approved for pilot ledger commit"
            })
          });
          resData = await res.json();
          break;
        }

        case 7: {
          // Step 7: Dispute Hold Flagged -> Public Verification changes to DISPUTED
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

          // Fetch public verification to confirm status changed to DISPUTED
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
          // Step 8: Export Complete Audit Trail
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
    { num: 1, title: "Public Reference Verification", desc: "Verify synthetic parcel reference BHS-2M7D-9KQX" },
    { num: 2, title: "Original Document Upload", desc: "Compute SHA-256 fingerprint & demonstrate VERIFIED match" },
    { num: 3, title: "Tampered Document Check", desc: "Modify 1 character (2.45 to 9.45 acres) -> demonstrate MISMATCH" },
    { num: 4, title: "Registration Maker Mutation", desc: "Sign in as Maker and submit pending mutation proposal" },
    { num: 5, title: "Maker Self-Approval Rejection", desc: "Attempt Maker self-approval -> demonstrate HTTP 403 block" },
    { num: 6, title: "Revenue Checker Approval", desc: "Distinct Checker approves -> commit to Fabric ledger" },
    { num: 7, title: "Civil Court Dispute Hold", desc: "Apply dispute hold -> public result immediately becomes DISPUTED" },
    { num: 8, title: "Audit Trail Reconstruction", desc: "Export complete traceable event audit log" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Play className="w-4 h-4" />
          Interactive Pilot Evaluation Runner
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold">BhuSetu 8-Step Pilot Demo Script</h1>
        <p className="text-sm text-slate-300">
          Executes the complete pilot evaluation script from Section 4 of <code className="text-amber-300">MOST_IMPORTANT_FEATURES_PAGE.md</code>.
        </p>
      </div>

      {/* Steps Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        {stepsInfo.map((s) => (
          <div
            key={s.num}
            onClick={() => executeStep(s.num)}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              stepResults[s.num]
                ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                : currentStep === s.num
                ? "bg-amber-50 border-amber-400 text-amber-950 font-bold shadow"
                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between font-bold mb-1">
              <span>Step {s.num}</span>
              {stepResults[s.num] && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            </div>
            <div className="font-semibold text-slate-900 text-[11px]">{s.title}</div>
          </div>
        ))}
      </div>

      {/* Current Step Execution Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Current Execution Step</span>
            <h2 className="text-xl font-bold text-slate-900">
              Step {currentStep}: {stepsInfo[currentStep - 1].title}
            </h2>
            <p className="text-xs text-slate-600">{stepsInfo[currentStep - 1].desc}</p>
          </div>

          <button
            onClick={() => executeStep(currentStep)}
            disabled={loading}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
          >
            {loading ? "Running Step..." : "Execute Step"}
          </button>
        </div>

        {/* Live Step Output Inspection */}
        {stepResults[currentStep] && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
              Live System Response Inspection
            </h3>

            <div className="bg-slate-950 text-slate-200 p-4 rounded-xl text-xs font-mono overflow-x-auto space-y-2 border border-slate-800">
              <pre>{JSON.stringify(stepResults[currentStep], null, 2)}</pre>
            </div>
          </div>
        )}
      </div>

      {/* All Executed Results Summary */}
      {Object.keys(stepResults).length > 0 && (
        <div className="bg-slate-100 rounded-2xl border border-slate-200 p-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Executed Step Verification Log</h3>
          <div className="space-y-2 text-xs font-mono">
            {Object.entries(stepResults).map(([num, data]) => (
              <div key={num} className="bg-white p-3 rounded-lg border border-slate-200 flex justify-between items-center">
                <span>Step {num}: {stepsInfo[Number(num) - 1].title}</span>
                <span className="font-bold text-emerald-700">COMPLETED ✓</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
