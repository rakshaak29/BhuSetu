"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  UserCheck, 
  ShieldCheck, 
  PlusCircle, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  History, 
  Download, 
  Lock, 
  Building2, 
  Scale, 
  Layers,
  RefreshCw,
  Eye,
  Check,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  ArrowUpRight
} from "lucide-react";
import { MOCK_USERS } from "@/lib/auth/rbac";
import { Parcel, EvidenceEvent, AuditEvent } from "@/lib/types/domain";

export default function OfficerPage() {
  const [selectedUserId, setSelectedUserId] = useState<string>("user-rev-checker-01");
  const currentUser = MOCK_USERS[selectedUserId];

  const [activeTab, setActiveTab] = useState<"queue" | "submit" | "disputes" | "parcels" | "audit">("queue");
  const [pendingEvents, setPendingEvents] = useState<EvidenceEvent[]>([]);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Form State: Submit Evidence
  const [selectedParcelId, setSelectedParcelId] = useState("PCL-AP-GNT-041");
  const [evidenceType, setEvidenceType] = useState("ROR_EXTRACT");
  const [sourceSystem, setSourceSystem] = useState("AP Meeseva Portal");
  const [sourceReference, setSourceReference] = useState("REG-2024-883921");
  const [fileContent, setFileContent] = useState("OFFICIAL RECORD OF RIGHTS EXTRACT - PARCEL AP-GNT-SUR-2024-041");

  // Form State: Dispute Hold
  const [disputeParcelId, setDisputeParcelId] = useState("PCL-AP-GNT-041");
  const [disputeHoldToggle, setDisputeHoldToggle] = useState(true);
  const [disputeReason, setDisputeReason] = useState("Civil suit OS 442/2025 interim injunction order");
  const [disputeReference, setDisputeReference] = useState("COURT-OS-442-2025");

  // Selected Parcel History View
  const [parcelHistory, setParcelHistory] = useState<any | null>(null);

  useEffect(() => {
    fetchData();
  }, [selectedUserId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch pending evidence events from DynamoDB
      const pendingRes = await fetch("/api/v1/evidence/pending");
      const pendingData = await pendingRes.json();
      setPendingEvents(pendingData.events || []);

      // Fetch all parcels from DynamoDB
      const parcelsRes = await fetch("/api/v1/parcels");
      const parcelsData = await parcelsRes.json();
      setParcels(parcelsData.parcels || []);

      // Fetch audit logs from DynamoDB
      const auditRes = await fetch("/api/v1/audit/export");
      const auditData = await auditRes.json();
      setAuditLogs(auditData.auditEvents || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch("/api/v1/evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parcelId: selectedParcelId,
          evidenceType,
          sourceSystem,
          sourceReference,
          fileContent,
          actorId: currentUser.actorId
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage({ text: data.message, type: "success" });
      setPendingEvents(prev => [data.event, ...prev]);
      setActiveTab("queue");
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEvent = async (eventId: string, action: "APPROVE" | "REJECT") => {
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/v1/evidence/${eventId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actorId: currentUser.actorId,
          action,
          approvalReason: `Official decision by ${currentUser.name} (${currentUser.role})`
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage({ text: data.message, type: "success" });
      setPendingEvents(prev => prev.filter(e => e.eventId !== eventId));
      fetchData();
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/v1/parcels/${disputeParcelId}/disputes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actorId: currentUser.actorId,
          disputeHold: disputeHoldToggle,
          disputeReason,
          disputeReference
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage({ text: data.message, type: "success" });
      fetchData();
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const viewParcelTimeline = async (parcelId: string) => {
    try {
      const res = await fetch(`/api/v1/parcels/${parcelId}/history`);
      const data = await res.json();
      setParcelHistory(data);
      setActiveTab("parcels");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8 animate-fadeIn">
      {/* Header & Persona Switcher */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#242A22] via-[#2A3127] to-[#1F241E] text-[#F3F4F1] p-6 sm:p-8 border border-[#3E4A3B] shadow-float space-y-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#5D7052]/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-[#C18C5D]/15 rounded-full blur-3xl pointer-events-none -mb-20" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[#3E4A3B]/80 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5D7052]/30 border border-[#5D7052]/50 text-[#C9D6C3] text-[11px] font-semibold tracking-wider uppercase">
              <Building2 className="w-3.5 h-3.5 text-[#A3B899]" />
              Official State/UT Land Administration Command Center
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
              Officer Workspace & Review Hub
            </h1>
            <p className="text-xs sm:text-sm text-[#A8AEA4] max-w-2xl leading-relaxed">
              Multi-org maker-checker evidence lifecycle, immutable Fabric ledger anchors, and civil court injunction flags.
            </p>
          </div>

          {/* Persona Switcher Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 bg-[#1A1F18]/90 p-2 sm:p-2.5 rounded-2xl border border-[#3E4A3B] shrink-0">
            <span className="text-[11px] text-[#A8AEA4] font-medium px-2 shrink-0 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[#C18C5D]" />
              Active Persona:
            </span>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="bg-[#242A22] text-[#F3F4F1] text-xs font-semibold px-3 py-2 rounded-xl border border-[#4D5A49] focus:outline-none focus:border-[#C18C5D] focus:ring-1 focus:ring-[#C18C5D] cursor-pointer"
            >
              {Object.entries(MOCK_USERS).map(([id, u]) => (
                <option key={id} value={id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Persona Scope Grid */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs bg-[#1A1F18]/70 p-4 rounded-2xl border border-[#3E4A3B]/60 font-mono">
          <div className="space-y-1">
            <span className="text-[#8B9387] block font-sans text-[11px] uppercase tracking-wider">Active User</span>
            <span className="font-bold text-[#F3F4F1] text-sm font-sans flex items-center gap-1.5">
              {currentUser.name}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[#8B9387] block font-sans text-[11px] uppercase tracking-wider">Assigned Role</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#C18C5D]/20 text-[#E0B286] font-bold rounded-full border border-[#C18C5D]/40 text-[11px]">
              <ShieldCheck className="w-3 h-3" />
              {currentUser.role}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[#8B9387] block font-sans text-[11px] uppercase tracking-wider">Jurisdiction Scope</span>
            <span className="text-[#D3D8CF] text-xs font-semibold">
              {currentUser.jurisdiction.stateCode} / {currentUser.jurisdiction.districtCode} / {currentUser.jurisdiction.tehsilCode}
            </span>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {message && (
        <div
          className={`p-4 rounded-2xl text-xs font-medium flex items-center justify-between border shadow-soft animate-fadeIn ${
            message.type === "success"
              ? "bg-[#EEF4EB] border-[#A8C89C] text-[#2D5A27]"
              : "bg-[#FDF2F2] border-[#F2B8B8] text-[#9E2A2B]"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-[#437C3C] shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-[#C23B38] shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button 
            onClick={() => setMessage(null)} 
            className="text-xs px-2 py-0.5 rounded-full hover:bg-black/5 font-bold transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Navigation Tabs - Pill Navigation */}
      <div className="flex gap-2 p-1.5 bg-[#F0EBE5] rounded-full border border-[#DED8CF] overflow-x-auto shadow-inner-soft">
        <button
          onClick={() => setActiveTab("queue")}
          className={`py-2 px-4 sm:px-5 text-xs font-semibold rounded-full flex items-center gap-2 whitespace-nowrap transition-all duration-200 ${
            activeTab === "queue"
              ? "bg-[#FEFEFA] text-[#2C2C24] shadow-soft font-bold scale-[1.01]"
              : "text-[#78786C] hover:text-[#2C2C24] hover:bg-[#E6DCCD]/60"
          }`}
        >
          <UserCheck className="w-4 h-4 text-[#5D7052]" />
          <span>Approval Queue</span>
          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
            pendingEvents.length > 0 
              ? "bg-[#5D7052] text-[#F3F4F1]" 
              : "bg-[#DED8CF] text-[#78786C]"
          }`}>
            {pendingEvents.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("submit")}
          className={`py-2 px-4 sm:px-5 text-xs font-semibold rounded-full flex items-center gap-2 whitespace-nowrap transition-all duration-200 ${
            activeTab === "submit"
              ? "bg-[#FEFEFA] text-[#2C2C24] shadow-soft font-bold scale-[1.01]"
              : "text-[#78786C] hover:text-[#2C2C24] hover:bg-[#E6DCCD]/60"
          }`}
        >
          <PlusCircle className="w-4 h-4 text-[#C18C5D]" />
          <span>Submit Evidence</span>
        </button>

        <button
          onClick={() => setActiveTab("disputes")}
          className={`py-2 px-4 sm:px-5 text-xs font-semibold rounded-full flex items-center gap-2 whitespace-nowrap transition-all duration-200 ${
            activeTab === "disputes"
              ? "bg-[#FEFEFA] text-[#2C2C24] shadow-soft font-bold scale-[1.01]"
              : "text-[#78786C] hover:text-[#2C2C24] hover:bg-[#E6DCCD]/60"
          }`}
        >
          <Scale className="w-4 h-4 text-[#A8422B]" />
          <span>Dispute Holds</span>
        </button>

        <button
          onClick={() => setActiveTab("parcels")}
          className={`py-2 px-4 sm:px-5 text-xs font-semibold rounded-full flex items-center gap-2 whitespace-nowrap transition-all duration-200 ${
            activeTab === "parcels"
              ? "bg-[#FEFEFA] text-[#2C2C24] shadow-soft font-bold scale-[1.01]"
              : "text-[#78786C] hover:text-[#2C2C24] hover:bg-[#E6DCCD]/60"
          }`}
        >
          <Layers className="w-4 h-4 text-[#5D7052]" />
          <span>Parcel Timelines</span>
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`py-2 px-4 sm:px-5 text-xs font-semibold rounded-full flex items-center gap-2 whitespace-nowrap transition-all duration-200 ${
            activeTab === "audit"
              ? "bg-[#FEFEFA] text-[#2C2C24] shadow-soft font-bold scale-[1.01]"
              : "text-[#78786C] hover:text-[#2C2C24] hover:bg-[#E6DCCD]/60"
          }`}
        >
          <History className="w-4 h-4 text-[#78786C]" />
          <span>Audit Log</span>
        </button>
      </div>

      {/* TAB 1: APPROVAL QUEUE */}
      {activeTab === "queue" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center px-1">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#2C2C24]">Pending Maker-Checker Approval Work Queue</h2>
              <p className="text-xs text-[#78786C] mt-0.5">Dual-authorization enforcement required before ledger block commitment.</p>
            </div>
            <button 
              onClick={fetchData} 
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FEFEFA] border border-[#DED8CF] hover:border-[#5D7052] text-xs font-semibold text-[#5D7052] shadow-xs hover:shadow-soft transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>

          {pendingEvents.length === 0 ? (
            <div className="organic-card rounded-3xl p-10 text-center space-y-4 border border-[#DED8CF] shadow-soft">
              <div className="w-14 h-14 rounded-full bg-[#5D7052]/10 border border-[#5D7052]/20 flex items-center justify-center mx-auto text-[#5D7052]">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#2C2C24]">No Pending Approvals</h3>
              <p className="text-xs sm:text-sm text-[#78786C] max-w-md mx-auto leading-relaxed">
                All submitted evidence events have been checked and committed to the Hyperledger Fabric ledger. Submit a new evidence proposal from the 'Submit Evidence' tab to test approval flows.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingEvents.map((evt) => {
                const isCreatorSelf = evt.makerActorId === currentUser.actorId;

                return (
                  <div 
                    key={evt.eventId} 
                    className="organic-card rounded-3xl p-6 sm:p-7 space-y-5 border border-[#DED8CF] shadow-soft hover:shadow-lift transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DED8CF]/70 pb-4">
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
                          PENDING APPROVAL
                        </span>
                        <h3 className="font-serif text-base sm:text-lg font-bold text-[#2C2C24]">
                          {evt.evidenceType} for Parcel {evt.parcelId}
                        </h3>
                      </div>
                      <div className="text-xs font-mono bg-[#F0EBE5]/80 px-3 py-1.5 rounded-full border border-[#DED8CF] text-[#78786C] self-start sm:self-center">
                        Ref: <strong className="text-[#2C2C24]">{evt.verificationReference}</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#F0EBE5]/50 p-4 rounded-2xl border border-[#DED8CF]/70 font-mono">
                      <div>
                        <span className="text-[#78786C] block font-sans text-[11px] mb-0.5">Submitted By (Maker)</span>
                        <span className="font-bold text-[#2C2C24]">{evt.makerActorId}</span>
                      </div>
                      <div>
                        <span className="text-[#78786C] block font-sans text-[11px] mb-0.5">Source Reference</span>
                        <span className="text-[#2C2C24] truncate block">{evt.sourceReference} ({evt.sourceSystem})</span>
                      </div>
                      <div>
                        <span className="text-[#78786C] block font-sans text-[11px] mb-0.5">SHA-256 Fingerprint</span>
                        <span className="text-[#5D7052] font-semibold">{evt.sha256.substring(0, 16)}...</span>
                      </div>
                    </div>

                    {/* Maker-Checker Server Guard Banner */}
                    {isCreatorSelf && (
                      <div className="bg-[#FFF1F2] border border-[#FECDD3] rounded-2xl p-4 flex items-start gap-3 text-xs text-[#9F1239]">
                        <Lock className="w-4 h-4 text-[#E11D48] shrink-0 mt-0.5" />
                        <div className="leading-relaxed">
                          <strong>Maker-Checker Guard Active:</strong> You submitted this proposal (<code className="font-mono bg-white/70 px-1 py-0.5 rounded">{currentUser.actorId}</code>). Dual authorization policy forbids self-approval. Switch persona to a distinct Revenue Checker to endorse.
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        onClick={() => handleApproveEvent(evt.eventId, "APPROVE")}
                        disabled={isCreatorSelf || loading}
                        className="btn-shine px-6 py-2.5 bg-[#5D7052] hover:bg-[#4E5E44] disabled:opacity-40 disabled:cursor-not-allowed text-[#F3F4F1] text-xs font-semibold rounded-full transition-all flex items-center gap-2 shadow-soft active:scale-95"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isCreatorSelf ? "Creator Self-Approval Blocked" : "Approve & Commit to Ledger"}</span>
                      </button>

                      <button
                        onClick={() => handleApproveEvent(evt.eventId, "REJECT")}
                        disabled={isCreatorSelf || loading}
                        className="px-5 py-2.5 bg-[#FDF2F2] hover:bg-[#FCE7E7] disabled:opacity-40 text-[#9E2A2B] text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 border border-[#F2B8B8] active:scale-95"
                      >
                        <XCircle className="w-4 h-4 text-[#C23B38]" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SUBMIT EVIDENCE */}
      {activeTab === "submit" && (
        <div className="organic-card rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto space-y-6 border border-[#DED8CF] shadow-soft">
          <div className="border-b border-[#DED8CF]/70 pb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C18C5D]/10 text-[#C18C5D] text-[11px] font-semibold tracking-wider uppercase mb-2">
              <PlusCircle className="w-3.5 h-3.5" />
              Maker Proposal Stage
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2C2C24]">Submit Approved Land Record Evidence</h2>
            <p className="text-xs text-[#78786C] mt-1 leading-relaxed">
              Upload approved source documents or enter extract details to initiate a pending evidence event for maker-checker review.
            </p>
          </div>

          <form onSubmit={handleSubmitEvidence} className="space-y-5 text-xs">
            <div>
              <label className="block font-bold text-[#2C2C24] mb-1.5">Target Parcel ID</label>
              <select
                value={selectedParcelId}
                onChange={(e) => setSelectedParcelId(e.target.value)}
                className="w-full p-3 border border-[#DED8CF] rounded-2xl font-mono text-[#2C2C24] bg-[#FEFEFA] focus:outline-none focus:border-[#5D7052] focus:ring-2 focus:ring-[#5D7052]/20 transition-all"
              >
                <option value="PCL-AP-GNT-041">PCL-AP-GNT-041 (State ID: AP-GNT-SUR-2024-041)</option>
                <option value="PCL-AP-GNT-042">PCL-AP-GNT-042 (State ID: AP-GNT-SUR-2024-042 - Disputed)</option>
                <option value="PCL-AP-GNT-043">PCL-AP-GNT-043 (State ID: AP-GNT-SUR-2024-043)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#2C2C24] mb-1.5">Evidence Category</label>
              <select
                value={evidenceType}
                onChange={(e) => setEvidenceType(e.target.value)}
                className="w-full p-3 border border-[#DED8CF] rounded-2xl text-[#2C2C24] bg-[#FEFEFA] focus:outline-none focus:border-[#5D7052] focus:ring-2 focus:ring-[#5D7052]/20 transition-all"
              >
                <option value="ROR_EXTRACT">Record of Rights (RoR) Extract</option>
                <option value="REGISTERED_DEED">Sub-Registrar Deed of Conveyance</option>
                <option value="MUTATION_ORDER">Tehsildar Approved Mutation Order</option>
                <option value="CADASTRAL_MAP">Cadastral Map / BhuNaksha Extract</option>
                <option value="SURVEY_REPORT">Survey & Settlement Report</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#2C2C24] mb-1.5">Issuing Source System</label>
                <input
                  type="text"
                  value={sourceSystem}
                  onChange={(e) => setSourceSystem(e.target.value)}
                  className="w-full p-3 border border-[#DED8CF] rounded-2xl text-[#2C2C24] bg-[#FEFEFA] focus:outline-none focus:border-[#5D7052] focus:ring-2 focus:ring-[#5D7052]/20 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#2C2C24] mb-1.5">Source Transaction Reference</label>
                <input
                  type="text"
                  value={sourceReference}
                  onChange={(e) => setSourceReference(e.target.value)}
                  className="w-full p-3 border border-[#DED8CF] rounded-2xl font-mono text-[#2C2C24] bg-[#FEFEFA] focus:outline-none focus:border-[#5D7052] focus:ring-2 focus:ring-[#5D7052]/20 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#2C2C24] mb-1.5">Official Document Content / PDF Extract String</label>
              <textarea
                rows={4}
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                className="w-full p-3.5 border border-[#DED8CF] rounded-2xl font-mono text-[#2C2C24] bg-[#FEFEFA] focus:outline-none focus:border-[#5D7052] focus:ring-2 focus:ring-[#5D7052]/20 transition-all"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-shine w-full py-3.5 bg-[#C18C5D] hover:bg-[#A97447] text-white font-semibold text-xs rounded-full shadow-soft hover:shadow-lift transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? "Submitting Proposal..." : "Submit Proposal for Checker Review"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: DISPUTE HOLDS */}
      {activeTab === "disputes" && (
        <div className="organic-card rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto space-y-6 border border-[#DED8CF] shadow-soft">
          <div className="border-b border-[#DED8CF]/70 pb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9E2A2B]/10 text-[#9E2A2B] text-[11px] font-semibold tracking-wider uppercase mb-2">
              <Scale className="w-3.5 h-3.5" />
              Legal & Court Injunction Interlock
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2C2C24] flex items-center gap-2">
              Manage Civil Court & Revenue Dispute Holds
            </h2>
            <p className="text-xs text-[#78786C] mt-1 leading-relaxed">
              Applying a dispute hold immediately halts positive verification across all citizen channels to shield buyers from encumbered properties.
            </p>
          </div>

          <form onSubmit={handleToggleDispute} className="space-y-5 text-xs">
            <div>
              <label className="block font-bold text-[#2C2C24] mb-1.5">Target Parcel ID</label>
              <select
                value={disputeParcelId}
                onChange={(e) => setDisputeParcelId(e.target.value)}
                className="w-full p-3 border border-[#DED8CF] rounded-2xl font-mono text-[#2C2C24] bg-[#FEFEFA] focus:outline-none focus:border-[#5D7052] focus:ring-2 focus:ring-[#5D7052]/20 transition-all"
              >
                <option value="PCL-AP-GNT-041">PCL-AP-GNT-041 (Current Status: Verified)</option>
                <option value="PCL-AP-GNT-042">PCL-AP-GNT-042 (Current Status: Disputed)</option>
                <option value="PCL-AP-GNT-043">PCL-AP-GNT-043 (Current Status: Verified)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#2C2C24] mb-2">Action Directive</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  disputeHoldToggle
                    ? "bg-[#FFF1F2] border-[#E11D48] text-[#9F1239] font-bold shadow-xs"
                    : "bg-[#FEFEFA] border-[#DED8CF] text-[#78786C]"
                }`}>
                  <input
                    type="radio"
                    name="disputeMode"
                    checked={disputeHoldToggle === true}
                    onChange={() => setDisputeHoldToggle(true)}
                    className="accent-[#E11D48]"
                  />
                  <span>Flag Active Dispute Hold</span>
                </label>

                <label className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  !disputeHoldToggle
                    ? "bg-[#EEF4EB] border-[#5D7052] text-[#2D5A27] font-bold shadow-xs"
                    : "bg-[#FEFEFA] border-[#DED8CF] text-[#78786C]"
                }`}>
                  <input
                    type="radio"
                    name="disputeMode"
                    checked={disputeHoldToggle === false}
                    onChange={() => setDisputeHoldToggle(false)}
                    className="accent-[#5D7052]"
                  />
                  <span>Release Dispute Hold</span>
                </label>
              </div>
            </div>

            {disputeHoldToggle && (
              <>
                <div>
                  <label className="block font-bold text-[#2C2C24] mb-1.5">Authoritative Court / Revenue Order Reference</label>
                  <input
                    type="text"
                    value={disputeReference}
                    onChange={(e) => setDisputeReference(e.target.value)}
                    placeholder="e.g. COURT-OS-442-2025"
                    className="w-full p-3 border border-[#DED8CF] rounded-2xl font-mono text-[#2C2C24] bg-[#FEFEFA] focus:outline-none focus:border-[#5D7052] focus:ring-2 focus:ring-[#5D7052]/20 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#2C2C24] mb-1.5">Mandatory Dispute Hold Reason</label>
                  <textarea
                    rows={2}
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    placeholder="Describe court injunction or revenue dispute matter..."
                    className="w-full p-3.5 border border-[#DED8CF] rounded-2xl text-[#2C2C24] bg-[#FEFEFA] focus:outline-none focus:border-[#5D7052] focus:ring-2 focus:ring-[#5D7052]/20 transition-all"
                    required
                  />
                </div>
              </>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`btn-shine w-full py-3.5 text-white font-semibold text-xs rounded-full shadow-soft transition-all active:scale-95 disabled:opacity-50 ${
                  disputeHoldToggle ? "bg-[#9E2A2B] hover:bg-[#831F20]" : "bg-[#5D7052] hover:bg-[#4E5E44]"
                }`}
              >
                {loading ? "Processing..." : disputeHoldToggle ? "Apply Encumbrance & Injunction Hold" : "Authorize & Release Dispute Hold"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: PARCEL TIMELINES */}
      {activeTab === "parcels" && (
        <div className="space-y-6">
          <div className="px-1">
            <h2 className="font-serif text-xl font-bold text-[#2C2C24]">District Pilot Parcels & Hyperledger Fabric History</h2>
            <p className="text-xs text-[#78786C] mt-0.5">Explore real-time parcel state, ULPIN coordinates, and cryptographic block lineage.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {parcels.map((p) => (
              <div 
                key={p.parcelId} 
                className="organic-card rounded-3xl p-6 space-y-4 border border-[#DED8CF] shadow-soft hover:shadow-lift transition-all"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="font-serif font-bold text-[#2C2C24] text-base">{p.stateParcelId}</h3>
                    <span className="text-xs font-mono text-[#78786C]">{p.parcelId}</span>
                  </div>
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full font-mono ${
                    p.disputeHold 
                      ? "bg-[#FFF1F2] text-[#9F1239] border border-[#FECDD3] glow-disputed" 
                      : "bg-[#EEF4EB] text-[#2D5A27] border border-[#A8C89C] glow-verified"
                  }`}>
                    {p.verificationStatus}
                  </span>
                </div>

                <div className="text-xs text-[#78786C] space-y-1.5 font-mono bg-[#F0EBE5]/50 p-3 rounded-2xl border border-[#DED8CF]/70">
                  <div className="flex justify-between">
                    <span className="text-[#8B9387]">ULPIN:</span>
                    <code className="text-[#2C2C24] font-bold">{p.ulpin || "N/A"}</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8B9387]">Scope:</span>
                    <code className="text-[#2C2C24]">{p.stateCode}/{p.districtCode}/{p.tehsilCode}</code>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-1">
                  <button
                    onClick={() => viewParcelTimeline(p.parcelId)}
                    className="flex-1 py-2.5 bg-[#FEFEFA] hover:bg-[#F0EBE5] text-[#2C2C24] border border-[#DED8CF] text-xs font-semibold rounded-full flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#5D7052]" />
                    <span>Quick Ledger</span>
                  </button>
                  <Link
                    href={`/officer/parcels/${p.parcelId}`}
                    className="btn-shine flex-1 py-2.5 bg-[#5D7052] hover:bg-[#4E5E44] text-[#F3F4F1] text-xs font-semibold rounded-full flex items-center justify-center gap-1.5 transition-all text-center shadow-soft active:scale-95"
                  >
                    <span>Full Detail &rarr;</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Parcel Fabric Ledger Timeline Display */}
          {parcelHistory && (
            <div className="rounded-3xl bg-gradient-to-br from-[#242A22] to-[#1F241E] text-white p-6 sm:p-8 border border-[#3E4A3B] shadow-float space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#3E4A3B] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#5D7052]/30 flex items-center justify-center text-[#A3B899]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base sm:text-lg text-[#F3F4F1]">
                      Fabric Ledger Immutable Timeline: {parcelHistory.parcel?.stateParcelId}
                    </h3>
                    <p className="text-xs text-[#A8AEA4]">Direct cryptographic channel audit</p>
                  </div>
                </div>
                <span className="text-xs font-mono bg-[#1A1F18] px-3 py-1 rounded-full border border-[#3E4A3B] text-[#A3B899]">
                  Channel: <strong>land-records-pilot</strong>
                </span>
              </div>

              <div className="space-y-4">
                {parcelHistory.ledgerTimeline?.map((blk: any) => (
                  <div key={blk.blockHash} className="bg-[#1A1F18]/90 rounded-2xl p-5 border border-[#3E4A3B] text-xs space-y-3 font-mono shadow-soft">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[#A3B899]">
                      <span className="font-bold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#5D7052] animate-pulse" />
                        Block #{blk.blockNumber} (Hash: {blk.blockHash.substring(0, 18)}...)
                      </span>
                      <span className="text-[#8B9387] text-[11px]">{new Date(blk.timestamp).toLocaleString()}</span>
                    </div>

                    <div className="text-[#C9D6C3] text-[11px] flex flex-wrap gap-2">
                      <span>TxId: <span className="text-white font-mono">{blk.txId}</span></span>
                      <span>•</span>
                      <span>Endorsements: <span className="text-[#E0B286]">{blk.endorsingOrgs.join(", ")}</span></span>
                    </div>

                    <div className="bg-[#141812] p-4 rounded-xl text-[#A8AEA4] text-[11px] overflow-x-auto space-y-1 border border-[#2D352A]">
                      <div>Event ID: <span className="text-white">{blk.eventData.eventId}</span> | Type: <span className="text-[#A3B899] font-bold">{blk.eventData.eventType}</span></div>
                      <div>Ref: <span className="text-[#E0B286] font-bold">{blk.eventData.verificationReference}</span> | SHA-256: <span className="text-[#D3D8CF]">{blk.eventData.sha256}</span></div>
                      <div>Maker: <span className="text-white">{blk.eventData.makerActorId}</span> | Checker: <span className="text-white">{blk.eventData.checkerActorId}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: AUDIT LOG & EXPORT */}
      {activeTab === "audit" && (
        <div className="organic-card rounded-3xl border border-[#DED8CF] p-6 sm:p-8 space-y-6 shadow-soft">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DED8CF]/70 pb-4">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2C2C24]">Immutable System Audit Trail</h2>
              <p className="text-xs text-[#78786C] mt-1 leading-relaxed">
                Complete traceability of logins, verification inquiries, ledger writes, approvals, and dispute actions with correlation IDs.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/officer/audit"
                className="px-4 py-2 bg-[#F0EBE5] hover:bg-[#E6DCCD] text-[#2C2C24] text-xs font-semibold rounded-full flex items-center gap-1.5 transition-colors border border-[#DED8CF]"
              >
                <span>Full Audit Page</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <a
                href="/api/v1/audit/export"
                target="_blank"
                className="btn-shine px-4 py-2 bg-[#5D7052] hover:bg-[#4E5E44] text-[#F3F4F1] text-xs font-semibold rounded-full flex items-center gap-1.5 shrink-0 transition-all shadow-soft active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Audit JSON</span>
              </a>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#DED8CF]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#F0EBE5] border-b border-[#DED8CF] text-[#78786C]">
                <tr>
                  <th className="p-3.5">Time</th>
                  <th className="p-3.5">Actor</th>
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5">Resource</th>
                  <th className="p-3.5">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DED8CF]/80 bg-[#FEFEFA]">
                {auditLogs.slice(0, 15).map((log) => (
                  <tr key={log.auditEventId} className="hover:bg-[#F0EBE5]/50 transition-colors">
                    <td className="p-3.5 text-[#78786C]">{new Date(log.occurredAt).toLocaleTimeString()}</td>
                    <td className="p-3.5 font-semibold text-[#2C2C24]">{log.actorId} ({log.actorRole})</td>
                    <td className="p-3.5 text-[#C18C5D] font-semibold">{log.action}</td>
                    <td className="p-3.5 text-[#78786C]">{log.resourceType}:{log.resourceId}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        log.outcome === "SUCCESS" 
                          ? "bg-[#EEF4EB] text-[#2D5A27] border border-[#A8C89C]" 
                          : "bg-[#FFF1F2] text-[#9F1239] border border-[#FECDD3]"
                      }`}>
                        {log.outcome}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
