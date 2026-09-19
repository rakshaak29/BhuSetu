"use client";

import { useState, useEffect } from "react";
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
  Check
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
      const auditRes = await fetch("/api/v1/audit/export");
      const auditData = await auditRes.json();
      setAuditLogs(auditData.auditEvents || []);

      const res41 = await fetch("/api/v1/parcels/PCL-AP-GNT-041/history");
      const d41 = await res41.json();
      const res42 = await fetch("/api/v1/parcels/PCL-AP-GNT-042/history");
      const d42 = await res42.json();
      const res43 = await fetch("/api/v1/parcels/PCL-AP-GNT-043/history");
      const d43 = await res43.json();

      setParcels([d41.parcel, d42.parcel, d43.parcel].filter(Boolean));
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
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header & Persona Switcher */}
      <div className="bg-carbon-primary text-white rounded-2xl p-6 border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <Building2 className="w-4 h-4" />
              Official State/UT Land Administration Command Center
            </div>
            <h1 className="text-2xl font-bold mt-1">Officer MVP Workspace</h1>
          </div>

          {/* Persona Switcher Selector */}
          <div className="flex items-center gap-3 bg-slate-800 p-2.5 rounded-xl border border-slate-700">
            <span className="text-xs text-slate-400 font-medium shrink-0">Simulate Persona:</span>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-600 focus:outline-none focus:border-terracotta"
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-slate-800/80 p-4 rounded-xl border border-slate-700 font-mono">
          <div>
            <span className="text-slate-400 block font-sans">Active User</span>
            <span className="font-bold text-white text-sm">{currentUser.name}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-sans">Assigned Role</span>
            <span className="inline-block px-2 py-0.5 bg-terracotta/20 text-terracotta font-bold rounded mt-0.5 border border-terracotta/40">
              {currentUser.role}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-sans">Jurisdiction Scope</span>
            <span className="text-slate-200">{currentUser.jurisdiction.stateCode} / {currentUser.jurisdiction.districtCode} / {currentUser.jurisdiction.tehsilCode}</span>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {message && (
        <div
          className={`p-4 rounded-xl text-xs font-medium flex items-center justify-between ${
            message.type === "success"
              ? "bg-status-verified-bg border border-status-verified-border text-status-verified-text"
              : "bg-status-mismatch-bg border border-status-mismatch-border text-status-mismatch-text"
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-xs opacity-60 hover:opacity-100 font-bold">Dismiss</button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-parchment-border overflow-x-auto bg-parchment-muted rounded-t-xl">
        <button
          onClick={() => setActiveTab("queue")}
          className={`py-3.5 px-5 text-xs font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === "queue" ? "border-terracotta text-terracotta bg-white" : "border-transparent text-carbon-muted hover:text-carbon-primary"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Approval Queue ({pendingEvents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("submit")}
          className={`py-3.5 px-5 text-xs font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === "submit" ? "border-terracotta text-terracotta bg-white" : "border-transparent text-carbon-muted hover:text-carbon-primary"
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Submit Evidence</span>
        </button>

        <button
          onClick={() => setActiveTab("disputes")}
          className={`py-3.5 px-5 text-xs font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === "disputes" ? "border-terracotta text-terracotta bg-white" : "border-transparent text-carbon-muted hover:text-carbon-primary"
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Dispute Holds</span>
        </button>

        <button
          onClick={() => setActiveTab("parcels")}
          className={`py-3.5 px-5 text-xs font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === "parcels" ? "border-terracotta text-terracotta bg-white" : "border-transparent text-carbon-muted hover:text-carbon-primary"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Parcel Timelines</span>
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`py-3.5 px-5 text-xs font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === "audit" ? "border-terracotta text-terracotta bg-white" : "border-transparent text-carbon-muted hover:text-carbon-primary"
          }`}
        >
          <History className="w-4 h-4" />
          <span>Audit Log & Export</span>
        </button>
      </div>

      {/* TAB 1: APPROVAL QUEUE */}
      {activeTab === "queue" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-carbon-primary">Pending Maker-Checker Approval Work Queue</h2>
            <button onClick={fetchData} className="text-xs text-carbon-muted flex items-center gap-1 hover:text-carbon-primary">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Queue
            </button>
          </div>

          {pendingEvents.length === 0 ? (
            <div className="parchment-card rounded-2xl p-8 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-status-verified-text mx-auto" />
              <h3 className="font-bold text-carbon-primary">No Pending Approvals</h3>
              <p className="text-xs text-carbon-muted max-w-md mx-auto">
                All submitted evidence events have been checked and committed to the Hyperledger Fabric ledger. Submit a new evidence event from the 'Submit Evidence' tab to test approval flows.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingEvents.map((evt) => {
                const isCreatorSelf = evt.makerActorId === currentUser.actorId;

                return (
                  <div key={evt.eventId} className="parchment-card rounded-2xl p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-parchment-border pb-3">
                      <div>
                        <span className="text-xs font-mono bg-status-pending-bg text-status-pending-text px-2 py-0.5 rounded font-bold border border-status-pending-border">
                          PENDING APPROVAL
                        </span>
                        <h3 className="font-bold text-carbon-primary text-sm mt-1">
                          {evt.evidenceType} for Parcel {evt.parcelId}
                        </h3>
                      </div>
                      <div className="text-xs font-mono text-carbon-muted">
                        Ref: <strong>{evt.verificationReference}</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-parchment-muted p-3 rounded-xl font-mono">
                      <div>
                        <span className="text-carbon-muted block font-sans">Submitted By (Maker)</span>
                        <span className="font-bold text-carbon-primary">{evt.makerActorId}</span>
                      </div>
                      <div>
                        <span className="text-carbon-muted block font-sans">Source Reference</span>
                        <span className="text-carbon-primary">{evt.sourceReference} ({evt.sourceSystem})</span>
                      </div>
                      <div>
                        <span className="text-carbon-muted block font-sans">SHA-256 Fingerprint</span>
                        <span className="text-carbon-primary">{evt.sha256.substring(0, 16)}...</span>
                      </div>
                    </div>

                    {/* Maker-Checker Server Guard Banner */}
                    {isCreatorSelf && (
                      <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2 text-xs text-rose-900">
                        <Lock className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>
                          <strong>Maker-Checker Guard Active:</strong> You submitted this proposal ({currentUser.actorId}). You CANNOT approve your own submission. Switch persona to a distinct Revenue Checker to approve.
                        </span>
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => handleApproveEvent(evt.eventId, "APPROVE")}
                        disabled={isCreatorSelf || loading}
                        className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isCreatorSelf ? "Creator Self-Approval Blocked" : "Approve & Commit to Ledger"}</span>
                      </button>

                      <button
                        onClick={() => handleApproveEvent(evt.eventId, "REJECT")}
                        disabled={isCreatorSelf || loading}
                        className="px-4 py-2 bg-rose-100 hover:bg-rose-200 disabled:opacity-40 text-rose-800 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 border border-rose-200"
                      >
                        <XCircle className="w-4 h-4 text-rose-600" />
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
        <div className="parchment-card rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto space-y-6">
          <div>
            <h2 className="text-base font-bold text-carbon-primary">Submit Approved Land Record Evidence</h2>
            <p className="text-xs text-carbon-muted">
              Upload approved source documents or enter extract details to create a pending evidence event for maker-checker review.
            </p>
          </div>

          <form onSubmit={handleSubmitEvidence} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-carbon-primary mb-1">Target Parcel ID</label>
              <select
                value={selectedParcelId}
                onChange={(e) => setSelectedParcelId(e.target.value)}
                className="w-full p-2.5 border border-parchment-border rounded-xl font-mono text-carbon-primary bg-white"
              >
                <option value="PCL-AP-GNT-041">PCL-AP-GNT-041 (State ID: AP-GNT-SUR-2024-041)</option>
                <option value="PCL-AP-GNT-042">PCL-AP-GNT-042 (State ID: AP-GNT-SUR-2024-042 - Disputed)</option>
                <option value="PCL-AP-GNT-043">PCL-AP-GNT-043 (State ID: AP-GNT-SUR-2024-043)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-carbon-primary mb-1">Evidence Category</label>
              <select
                value={evidenceType}
                onChange={(e) => setEvidenceType(e.target.value)}
                className="w-full p-2.5 border border-parchment-border rounded-xl text-carbon-primary bg-white"
              >
                <option value="ROR_EXTRACT">Record of Rights (RoR) Extract</option>
                <option value="REGISTERED_DEED">Sub-Registrar Deed of Conveyance</option>
                <option value="MUTATION_ORDER">Tehsildar Approved Mutation Order</option>
                <option value="CADASTRAL_MAP">Cadastral Map / BhuNnaksha Extract</option>
                <option value="SURVEY_REPORT">Survey & Settlement Report</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-carbon-primary mb-1">Issuing Source System</label>
                <input
                  type="text"
                  value={sourceSystem}
                  onChange={(e) => setSourceSystem(e.target.value)}
                  className="w-full p-2.5 border border-parchment-border rounded-xl text-carbon-primary bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-carbon-primary mb-1">Source Transaction Reference</label>
                <input
                  type="text"
                  value={sourceReference}
                  onChange={(e) => setSourceReference(e.target.value)}
                  className="w-full p-2.5 border border-parchment-border rounded-xl font-mono text-carbon-primary bg-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-carbon-primary mb-1">Official Document Content / PDF Extract String</label>
              <textarea
                rows={4}
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                className="w-full p-3 border border-parchment-border rounded-xl font-mono text-carbon-primary bg-white"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-terracotta hover:bg-terracotta-hover text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
              >
                {loading ? "Submitting..." : "Submit Proposal for Checker Review"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: DISPUTE HOLDS */}
      {activeTab === "disputes" && (
        <div className="parchment-card rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto space-y-6 border-l-4 border-l-status-disputed-badge">
          <div>
            <h2 className="text-base font-bold text-carbon-primary flex items-center gap-2">
              <Scale className="w-5 h-5 text-status-disputed-badge" />
              Manage Civil Court & Revenue Dispute Holds
            </h2>
            <p className="text-xs text-carbon-muted">
              Applying a dispute hold immediately updates public verification results to DISPUTED to prevent unauthorized transactions.
            </p>
          </div>

          <form onSubmit={handleToggleDispute} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-carbon-primary mb-1">Target Parcel ID</label>
              <select
                value={disputeParcelId}
                onChange={(e) => setDisputeParcelId(e.target.value)}
                className="w-full p-2.5 border border-parchment-border rounded-xl font-mono text-carbon-primary bg-white"
              >
                <option value="PCL-AP-GNT-041">PCL-AP-GNT-041 (Current Status: Verified)</option>
                <option value="PCL-AP-GNT-042">PCL-AP-GNT-042 (Current Status: Disputed)</option>
                <option value="PCL-AP-GNT-043">PCL-AP-GNT-043 (Current Status: Verified)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-carbon-primary mb-1">Action</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-rose-800">
                  <input
                    type="radio"
                    name="disputeMode"
                    checked={disputeHoldToggle === true}
                    onChange={() => setDisputeHoldToggle(true)}
                  />
                  Flag Active Dispute Hold
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-emerald-800">
                  <input
                    type="radio"
                    name="disputeMode"
                    checked={disputeHoldToggle === false}
                    onChange={() => setDisputeHoldToggle(false)}
                  />
                  Release Dispute Hold
                </label>
              </div>
            </div>

            {disputeHoldToggle && (
              <>
                <div>
                  <label className="block font-bold text-carbon-primary mb-1">Authoritative Court / Revenue Order Reference</label>
                  <input
                    type="text"
                    value={disputeReference}
                    onChange={(e) => setDisputeReference(e.target.value)}
                    placeholder="e.g. COURT-OS-442-2025"
                    className="w-full p-2.5 border border-parchment-border rounded-xl font-mono text-carbon-primary bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-carbon-primary mb-1">Mandatory Dispute Hold Reason</label>
                  <textarea
                    rows={2}
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    placeholder="Describe court injunction or revenue dispute matter..."
                    className="w-full p-2.5 border border-parchment-border rounded-xl text-carbon-primary bg-white"
                    required
                  />
                </div>
              </>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 text-white font-bold text-xs rounded-xl transition-colors shadow-sm ${
                  disputeHoldToggle ? "bg-rose-700 hover:bg-rose-600" : "bg-emerald-700 hover:bg-emerald-600"
                }`}
              >
                {loading ? "Processing..." : disputeHoldToggle ? "Flag Dispute Hold" : "Release Dispute Hold"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: PARCEL TIMELINES */}
      {activeTab === "parcels" && (
        <div className="space-y-6">
          <h2 className="text-base font-bold text-carbon-primary">District Pilot Parcels & Hyperledger Fabric History</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {parcels.map((p) => (
              <div key={p.parcelId} className="parchment-card rounded-2xl p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-carbon-primary text-sm">{p.stateParcelId}</h3>
                    <span className="text-xs font-mono text-carbon-muted">{p.parcelId}</span>
                  </div>
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded font-mono ${
                    p.disputeHold ? "bg-status-disputed-badge text-white" : "bg-status-verified-badge text-white"
                  }`}>
                    {p.verificationStatus}
                  </span>
                </div>

                <div className="text-xs text-carbon-muted space-y-1 font-mono">
                  <div>ULPIN: <code className="text-carbon-primary font-bold">{p.ulpin || "N/A"}</code></div>
                  <div>Scope: <code className="text-carbon-primary">{p.stateCode}/{p.districtCode}/{p.tehsilCode}</code></div>
                </div>

                <button
                  onClick={() => viewParcelTimeline(p.parcelId)}
                  className="w-full py-2 bg-carbon-primary hover:bg-carbon-secondary text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Fabric Ledger Timeline</span>
                </button>
              </div>
            ))}
          </div>

          {/* Selected Parcel Fabric Ledger Timeline Display */}
          {parcelHistory && (
            <div className="bg-carbon-primary text-white rounded-2xl p-6 border border-slate-800 space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Fabric Ledger Immutable Timeline for {parcelHistory.parcel?.stateParcelId}
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  Channel: <strong>land-records-pilot</strong>
                </span>
              </div>

              <div className="space-y-4">
                {parcelHistory.ledgerTimeline?.map((blk: any) => (
                  <div key={blk.blockHash} className="bg-slate-800/90 rounded-xl p-4 border border-slate-700 text-xs space-y-2 font-mono">
                    <div className="flex justify-between text-emerald-400">
                      <span>Block #{blk.blockNumber} (Hash: {blk.blockHash.substring(0, 16)}...)</span>
                      <span>{new Date(blk.timestamp).toLocaleString()}</span>
                    </div>

                    <div className="text-slate-300">
                      TxId: <span className="text-slate-100">{blk.txId}</span> | Endorsements: <span className="text-blue-300">{blk.endorsingOrgs.join(", ")}</span>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-lg text-slate-300 text-[11px] overflow-x-auto">
                      <div>Event ID: {blk.eventData.eventId} | Type: {blk.eventData.eventType}</div>
                      <div>Ref: {blk.eventData.verificationReference} | SHA-256: {blk.eventData.sha256}</div>
                      <div>Maker: {blk.eventData.makerActorId} | Checker: {blk.eventData.checkerActorId}</div>
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
        <div className="parchment-card rounded-2xl border border-parchment-border p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-parchment-border pb-4">
            <div>
              <h2 className="text-base font-bold text-carbon-primary">Immutable System Audit Trail</h2>
              <p className="text-xs text-carbon-muted">
                All logins, reads, writes, approvals, and dispute actions logged with correlation IDs.
              </p>
            </div>

            <a
              href="/api/v1/audit/export"
              target="_blank"
              className="px-4 py-2 bg-carbon-primary hover:bg-carbon-secondary text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shrink-0 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Audit JSON</span>
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-parchment-muted border-b border-parchment-border text-carbon-muted">
                <tr>
                  <th className="p-3">Time</th>
                  <th className="p-3">Actor</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Resource</th>
                  <th className="p-3">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-parchment-border">
                {auditLogs.slice(0, 15).map((log) => (
                  <tr key={log.auditEventId} className="hover:bg-parchment-muted">
                    <td className="p-3 text-carbon-muted">{new Date(log.occurredAt).toLocaleTimeString()}</td>
                    <td className="p-3 font-semibold text-carbon-primary">{log.actorId} ({log.actorRole})</td>
                    <td className="p-3 text-terracotta font-semibold">{log.action}</td>
                    <td className="p-3 text-carbon-secondary">{log.resourceType}:{log.resourceId}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.outcome === "SUCCESS" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
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
