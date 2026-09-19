"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Scale,
  Layers,
  Lock,
  ExternalLink,
  Hash,
  User,
  Building2,
} from "lucide-react";
import { Parcel, EvidenceEvent } from "@/lib/types/domain";

interface LedgerBlock {
  blockNumber: number;
  previousBlockHash: string;
  blockHash: string;
  txId: string;
  timestamp: string;
  channelId: string;
  endorsingOrgs: string[];
  eventData: {
    eventId: string;
    parcelId: string;
    eventType: string;
    evidenceType: string;
    sha256: string;
    sourceSystem: string;
    sourceReference: string;
    previousEventId?: string;
    makerActorId: string;
    checkerActorId: string;
    approvalReason?: string;
    verificationReference: string;
  };
}

export default function ParcelTimelinePage() {
  const params = useParams();
  const parcelId = params.parcelId as string;

  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [events, setEvents] = useState<EvidenceEvent[]>([]);
  const [ledgerBlocks, setLedgerBlocks] = useState<LedgerBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (parcelId) fetchTimeline();
  }, [parcelId]);

  const fetchTimeline = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/parcels/${parcelId}/history`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `Parcel ${parcelId} not found`);
      }
      const data = await res.json();
      setParcel(data.parcel);
      setEvents(data.events || []);
      setLedgerBlocks(data.ledgerTimeline || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "VERIFIED": return "bg-emerald-600 text-white";
      case "DISPUTED": return "bg-red-600 text-white";
      case "PENDING_REVIEW": return "bg-amber-500 text-white";
      case "MISMATCH": return "bg-rose-500 text-white";
      default: return "bg-slate-500 text-white";
    }
  };

  const eventTypeIcon = (type: string) => {
    switch (type) {
      case "ISSUE": return <FileText className="w-4 h-4 text-emerald-500" />;
      case "MUTATION": return <Layers className="w-4 h-4 text-blue-500" />;
      case "DISPUTE_HOLD": return <Scale className="w-4 h-4 text-red-500" />;
      case "DISPUTE_RELEASE": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "CORRECTION": return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const eventStatusBadge = (status: string) => {
    switch (status) {
      case "COMMITTED": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "APPROVED": return "bg-blue-100 text-blue-800 border-blue-200";
      case "PENDING": return "bg-amber-100 text-amber-800 border-amber-200";
      case "REJECTED": return "bg-rose-100 text-rose-800 border-rose-200";
      default: return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded-xl w-64 mx-auto" />
          <div className="h-4 bg-slate-100 rounded w-48 mx-auto" />
          <div className="h-64 bg-slate-50 rounded-2xl mt-8" />
        </div>
      </div>
    );
  }

  if (error || !parcel) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Parcel Not Found</h2>
        <p className="text-sm text-slate-600">{error || `No record found for ${parcelId}`}</p>
        <Link
          href="/officer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Officer Workspace
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/officer" className="hover:text-slate-900 transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          Officer Workspace
        </Link>
        <span>/</span>
        <span className="font-mono text-slate-700">{parcelId}</span>
      </div>

      {/* Parcel Header Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <Building2 className="w-4 h-4" />
              Parcel Timeline Detail
            </div>
            <h1 className="text-2xl font-bold mt-1">{parcel.stateParcelId}</h1>
            <span className="text-xs font-mono text-slate-400">{parcel.parcelId}</span>
          </div>

          <div className="flex items-center gap-3">
            {parcel.disputeHold && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-950 px-3 py-1.5 rounded-lg border border-red-800">
                <Lock className="w-3.5 h-3.5" />
                DISPUTE HOLD ACTIVE
              </span>
            )}
            <span className={`text-xs font-extrabold uppercase px-3 py-1.5 rounded-lg ${statusColor(parcel.verificationStatus)}`}>
              {parcel.verificationStatus}
            </span>
          </div>
        </div>

        {/* Parcel Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-800/80 p-4 rounded-xl border border-slate-700">
          <div>
            <span className="text-slate-400 block">State Code</span>
            <span className="font-bold font-mono text-white">{parcel.stateCode}</span>
          </div>
          <div>
            <span className="text-slate-400 block">District</span>
            <span className="font-bold font-mono text-white">{parcel.districtCode}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Tehsil</span>
            <span className="font-bold font-mono text-white">{parcel.tehsilCode}</span>
          </div>
          <div>
            <span className="text-slate-400 block">ULPIN</span>
            <span className="font-bold font-mono text-white">{parcel.ulpin || "N/A"}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Active Event</span>
            <span className="font-bold font-mono text-emerald-400">{parcel.activeEventId || "None"}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Version</span>
            <span className="font-bold text-white">v{parcel.version}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Last Updated</span>
            <span className="font-mono text-slate-200">{new Date(parcel.updatedAt).toLocaleString()}</span>
          </div>
          {parcel.disputeHold && (
            <div>
              <span className="text-slate-400 block">Dispute Ref</span>
              <span className="font-bold font-mono text-red-400">{parcel.disputeReference || "—"}</span>
            </div>
          )}
        </div>

        {parcel.disputeHold && parcel.disputeReason && (
          <div className="bg-red-950/60 border border-red-800 rounded-xl p-3 flex items-start gap-2 text-xs text-red-200">
            <Scale className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-red-300">Dispute Reason:</strong> {parcel.disputeReason}
            </div>
          </div>
        )}
      </div>

      {/* Evidence Events Timeline */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-slate-600" />
          Evidence Event History ({events.length} events)
        </h2>

        {events.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <Clock className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm text-slate-500 mt-2">No evidence events recorded for this parcel.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200" />

            <div className="space-y-4">
              {events.map((evt, idx) => (
                <div key={evt.eventId} className="relative pl-12">
                  {/* Timeline dot */}
                  <div className="absolute left-3 top-5 w-4 h-4 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center z-10">
                    <div className={`w-2 h-2 rounded-full ${
                      evt.status === "COMMITTED" ? "bg-emerald-500" :
                      evt.status === "PENDING" ? "bg-amber-500" :
                      evt.status === "REJECTED" ? "bg-rose-500" : "bg-blue-500"
                    }`} />
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {eventTypeIcon(evt.eventType)}
                        <h3 className="font-bold text-slate-900 text-sm">
                          {evt.eventType} — {evt.evidenceType}
                        </h3>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${eventStatusBadge(evt.status)}`}>
                          {evt.status}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(evt.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-xl">
                      <div>
                        <span className="text-slate-500 block">Event ID</span>
                        <span className="font-mono text-slate-800">{evt.eventId}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Verification Ref</span>
                        <span className="font-mono font-bold text-emerald-700">{evt.verificationReference}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Source</span>
                        <span className="text-slate-800">{evt.sourceSystem} / {evt.sourceReference}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-500">SHA-256:</span>
                        <code className="font-mono text-slate-700">{evt.sha256.substring(0, 20)}...</code>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-500">Maker:</span>
                        <span className="font-semibold text-slate-800">{evt.makerActorId}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-500">Checker:</span>
                        <span className="font-semibold text-slate-800">{evt.checkerActorId || "—"}</span>
                      </div>
                    </div>

                    {evt.ledgerTxId && (
                      <div className="text-xs bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 font-mono text-emerald-800 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-emerald-600" />
                        Ledger Tx: {evt.ledgerTxId}
                      </div>
                    )}

                    {evt.approvalReason && (
                      <div className="text-xs text-slate-600 italic">
                        Reason: {evt.approvalReason}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hyperledger Fabric Ledger Blocks */}
      {ledgerBlocks.length > 0 && (
        <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h2 className="font-bold text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Immutable Fabric Ledger Blocks ({ledgerBlocks.length})
            </h2>
            <span className="text-xs font-mono text-slate-400">
              Channel: <strong>land-records-pilot</strong>
            </span>
          </div>

          <div className="space-y-4">
            {ledgerBlocks.map((blk) => (
              <div key={blk.blockHash} className="bg-slate-800/90 rounded-xl p-4 border border-slate-700 text-xs space-y-3 font-mono">
                <div className="flex justify-between text-emerald-400">
                  <span className="font-bold">Block #{blk.blockNumber}</span>
                  <span>{new Date(blk.timestamp).toLocaleString()}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                  <div>
                    <span className="text-slate-500">Block Hash: </span>
                    <span className="text-slate-100">{blk.blockHash}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Prev Hash: </span>
                    <span className="text-slate-100">{blk.previousBlockHash.substring(0, 24)}...</span>
                  </div>
                  <div>
                    <span className="text-slate-500">TxId: </span>
                    <span className="text-slate-100">{blk.txId}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Endorsements: </span>
                    <span className="text-blue-300">{blk.endorsingOrgs.join(", ")}</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg text-slate-300 text-[11px] space-y-1">
                  <div>Event: <span className="text-white">{blk.eventData.eventId}</span> | Type: <span className="text-emerald-300">{blk.eventData.eventType}</span></div>
                  <div>Ref: <span className="text-white">{blk.eventData.verificationReference}</span> | SHA-256: <span className="text-slate-100">{blk.eventData.sha256.substring(0, 24)}...</span></div>
                  <div>Maker: <span className="text-blue-300">{blk.eventData.makerActorId}</span> | Checker: <span className="text-blue-300">{blk.eventData.checkerActorId}</span></div>
                  {blk.eventData.approvalReason && (
                    <div>Approval: <span className="text-slate-200 italic">{blk.eventData.approvalReason}</span></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Back Navigation */}
      <div className="flex justify-center pt-4">
        <Link
          href="/officer"
          className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Officer Workspace
        </Link>
      </div>
    </div>
  );
}
