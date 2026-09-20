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

  const statusBadge = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return "bg-[#EEF4EB] text-[#2D5A27] border border-[#A8C89C] glow-verified";
      case "DISPUTED":
        return "bg-[#FFF1F2] text-[#9F1239] border border-[#FECDD3] glow-disputed";
      case "PENDING_REVIEW":
        return "bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] glow-pending";
      case "MISMATCH":
        return "bg-[#FFF1F2] text-[#9F1239] border border-[#FECDD3]";
      default:
        return "bg-[#F0EBE5] text-[#78786C] border border-[#DED8CF]";
    }
  };

  const eventTypeIcon = (type: string) => {
    switch (type) {
      case "ISSUE": return <FileText className="w-4 h-4 text-[#5D7052]" />;
      case "MUTATION": return <Layers className="w-4 h-4 text-[#C18C5D]" />;
      case "DISPUTE_HOLD": return <Scale className="w-4 h-4 text-[#9E2A2B]" />;
      case "DISPUTE_RELEASE": return <CheckCircle2 className="w-4 h-4 text-[#5D7052]" />;
      case "CORRECTION": return <AlertTriangle className="w-4 h-4 text-[#B45309]" />;
      default: return <Clock className="w-4 h-4 text-[#78786C]" />;
    }
  };

  const eventStatusBadge = (status: string) => {
    switch (status) {
      case "COMMITTED": return "bg-[#EEF4EB] text-[#2D5A27] border-[#A8C89C]";
      case "APPROVED": return "bg-[#EEF4EB] text-[#2D5A27] border-[#A8C89C]";
      case "PENDING": return "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]";
      case "REJECTED": return "bg-[#FFF1F2] text-[#9F1239] border-[#FECDD3]";
      default: return "bg-[#F0EBE5] text-[#78786C] border-[#DED8CF]";
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="animate-pulse space-y-4 max-w-md mx-auto">
          <div className="h-8 bg-[#E6DCCD] rounded-full w-64 mx-auto" />
          <div className="h-4 bg-[#F0EBE5] rounded-full w-48 mx-auto" />
          <div className="h-64 bg-[#FEFEFA] rounded-3xl border border-[#DED8CF] shadow-soft mt-8" />
        </div>
      </div>
    );
  }

  if (error || !parcel) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-[#FFF1F2] border border-[#FECDD3] flex items-center justify-center mx-auto text-[#9E2A2B]">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#2C2C24]">Parcel Record Not Found</h2>
        <p className="text-xs sm:text-sm text-[#78786C] max-w-md mx-auto">{error || `No record found for ${parcelId}`}</p>
        <Link
          href="/officer"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#5D7052] hover:bg-[#4E5E44] text-[#F3F4F1] text-xs font-semibold rounded-full transition-all shadow-soft active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Officer Workspace
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8 animate-fadeIn">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-[#78786C]">
        <Link 
          href="/officer" 
          className="inline-flex items-center gap-1 text-[#5D7052] hover:text-[#4E5E44] font-sans font-semibold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Officer Workspace
        </Link>
        <span>/</span>
        <span className="text-[#2C2C24] font-bold">{parcelId}</span>
      </div>

      {/* Parcel Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#242A22] via-[#2A3127] to-[#1F241E] text-[#F3F4F1] p-6 sm:p-8 border border-[#3E4A3B] shadow-float space-y-6">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#5D7052]/20 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#3E4A3B]/80 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5D7052]/30 border border-[#5D7052]/50 text-[#C9D6C3] text-[11px] font-semibold tracking-wider uppercase">
              <Building2 className="w-3.5 h-3.5 text-[#A3B899]" />
              Immutable Land Parcel Ledger Timeline
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
              {parcel.stateParcelId}
            </h1>
            <span className="text-xs font-mono text-[#A8AEA4] block">{parcel.parcelId}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {parcel.disputeHold && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#FECDD3] bg-[#9F1239]/40 px-3 py-1 rounded-full border border-[#E11D48]/50">
                <Lock className="w-3.5 h-3.5 text-[#FECDD3]" />
                DISPUTE HOLD ACTIVE
              </span>
            )}
            <span className={`text-[11px] font-extrabold uppercase px-3 py-1 rounded-full ${statusBadge(parcel.verificationStatus)}`}>
              {parcel.verificationStatus}
            </span>
          </div>
        </div>

        {/* Parcel Details Grid */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#1A1F18]/80 p-4 sm:p-5 rounded-2xl border border-[#3E4A3B]/60 font-mono">
          <div>
            <span className="text-[#8B9387] block font-sans text-[11px] mb-0.5">State Code</span>
            <span className="font-bold text-white text-sm">{parcel.stateCode}</span>
          </div>
          <div>
            <span className="text-[#8B9387] block font-sans text-[11px] mb-0.5">District</span>
            <span className="font-bold text-white text-sm">{parcel.districtCode}</span>
          </div>
          <div>
            <span className="text-[#8B9387] block font-sans text-[11px] mb-0.5">Tehsil</span>
            <span className="font-bold text-white text-sm">{parcel.tehsilCode}</span>
          </div>
          <div>
            <span className="text-[#8B9387] block font-sans text-[11px] mb-0.5">ULPIN</span>
            <span className="font-bold text-[#E0B286] text-xs">{parcel.ulpin || "N/A"}</span>
          </div>
          <div className="pt-2">
            <span className="text-[#8B9387] block font-sans text-[11px] mb-0.5">Active Event</span>
            <span className="font-bold text-[#A3B899]">{parcel.activeEventId || "None"}</span>
          </div>
          <div className="pt-2">
            <span className="text-[#8B9387] block font-sans text-[11px] mb-0.5">Ledger Version</span>
            <span className="font-bold text-white">v{parcel.version}</span>
          </div>
          <div className="pt-2 col-span-2 sm:col-span-2">
            <span className="text-[#8B9387] block font-sans text-[11px] mb-0.5">Last Sync Timestamp</span>
            <span className="text-[#D3D8CF] text-[11px]">{new Date(parcel.updatedAt).toLocaleString()}</span>
          </div>
        </div>

        {parcel.disputeHold && parcel.disputeReason && (
          <div className="relative z-10 bg-[#291316]/90 border border-[#9F1239]/50 rounded-2xl p-4 flex items-start gap-3 text-xs text-[#FECDD3]">
            <Scale className="w-4 h-4 text-[#E11D48] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-white">Active Dispute Injunction:</strong> {parcel.disputeReason}
              {parcel.disputeReference && (
                <div className="text-[11px] text-[#A8AEA4] font-mono mt-0.5">Order Ref: {parcel.disputeReference}</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Evidence Events Timeline */}
      <div className="space-y-5">
        <div className="px-1">
          <h2 className="font-serif text-xl font-bold text-[#2C2C24] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#5D7052]" />
            Evidence Event History ({events.length} events)
          </h2>
          <p className="text-xs text-[#78786C] mt-0.5">Chronological maker-checker submission and endorsement records.</p>
        </div>

        {events.length === 0 ? (
          <div className="organic-card rounded-3xl border border-[#DED8CF] p-10 text-center shadow-soft">
            <Clock className="w-10 h-10 text-[#78786C] mx-auto opacity-50" />
            <p className="text-xs sm:text-sm text-[#78786C] mt-2">No evidence events recorded for this parcel.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-[#DED8CF]" />

            <div className="space-y-5">
              {events.map((evt) => (
                <div key={evt.eventId} className="relative pl-12">
                  {/* Timeline dot */}
                  <div className="absolute left-3.5 top-6 w-3.5 h-3.5 rounded-full bg-[#FEFEFA] border-2 border-[#5D7052] flex items-center justify-center z-10 shadow-xs">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      evt.status === "COMMITTED" ? "bg-[#5D7052]" :
                      evt.status === "PENDING" ? "bg-[#B45309]" :
                      evt.status === "REJECTED" ? "bg-[#9E2A2B]" : "bg-[#C18C5D]"
                    }`} />
                  </div>

                  <div className="organic-card rounded-3xl border border-[#DED8CF] p-6 space-y-4 shadow-soft hover:shadow-lift transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DED8CF]/70 pb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {eventTypeIcon(evt.eventType)}
                        <h3 className="font-serif font-bold text-[#2C2C24] text-sm sm:text-base">
                          {evt.eventType} • {evt.evidenceType}
                        </h3>
                        <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${eventStatusBadge(evt.status)}`}>
                          {evt.status}
                        </span>
                      </div>
                      <span className="text-xs text-[#78786C] font-mono">
                        {new Date(evt.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#F0EBE5]/50 p-3.5 rounded-2xl border border-[#DED8CF]/60 font-mono">
                      <div>
                        <span className="text-[#78786C] block font-sans text-[11px] mb-0.5">Event ID</span>
                        <span className="text-[#2C2C24] font-semibold">{evt.eventId}</span>
                      </div>
                      <div>
                        <span className="text-[#78786C] block font-sans text-[11px] mb-0.5">Verification Ref</span>
                        <span className="font-bold text-[#5D7052]">{evt.verificationReference}</span>
                      </div>
                      <div>
                        <span className="text-[#78786C] block font-sans text-[11px] mb-0.5">Source Authority</span>
                        <span className="text-[#2C2C24] truncate block">{evt.sourceSystem} / {evt.sourceReference}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                      <div className="flex items-center gap-1.5 text-[#78786C]">
                        <Hash className="w-3.5 h-3.5 text-[#5D7052] shrink-0" />
                        <span className="truncate">SHA: <code className="text-[#2C2C24] font-bold">{evt.sha256.substring(0, 16)}...</code></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#78786C]">
                        <User className="w-3.5 h-3.5 text-[#C18C5D] shrink-0" />
                        <span>Maker: <span className="font-semibold text-[#2C2C24]">{evt.makerActorId}</span></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#78786C]">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#5D7052] shrink-0" />
                        <span>Checker: <span className="font-semibold text-[#2C2C24]">{evt.checkerActorId || "Pending"}</span></span>
                      </div>
                    </div>

                    {evt.ledgerTxId && (
                      <div className="text-xs bg-[#EEF4EB] border border-[#A8C89C] rounded-2xl px-3.5 py-2 font-mono text-[#2D5A27] flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-[#5D7052]" />
                        <span>Ledger Tx: <strong className="break-all">{evt.ledgerTxId}</strong></span>
                      </div>
                    )}

                    {evt.approvalReason && (
                      <div className="text-xs text-[#78786C] italic bg-[#FEFEFA] p-2.5 rounded-xl border border-[#DED8CF]">
                        Endorsement Note: {evt.approvalReason}
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
        <div className="rounded-3xl bg-gradient-to-br from-[#242A22] to-[#1F241E] text-white p-6 sm:p-8 border border-[#3E4A3B] shadow-float space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#3E4A3B] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#5D7052]/30 flex items-center justify-center text-[#A3B899]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h2 className="font-serif font-bold text-base sm:text-lg">
                Immutable Fabric Ledger Blocks ({ledgerBlocks.length})
              </h2>
            </div>
            <span className="text-xs font-mono bg-[#1A1F18] px-3 py-1 rounded-full border border-[#3E4A3B] text-[#A3B899]">
              Channel: <strong>land-records-pilot</strong>
            </span>
          </div>

          <div className="space-y-4">
            {ledgerBlocks.map((blk) => (
              <div key={blk.blockHash} className="bg-[#1A1F18]/90 rounded-2xl p-5 border border-[#3E4A3B] text-xs space-y-3 font-mono shadow-soft">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[#A3B899]">
                  <span className="font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#5D7052] animate-pulse" />
                    Block #{blk.blockNumber}
                  </span>
                  <span className="text-[#8B9387] text-[11px]">{new Date(blk.timestamp).toLocaleString()}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#C9D6C3] text-[11px]">
                  <div>
                    <span className="text-[#8B9387]">Block Hash: </span>
                    <span className="text-white truncate block">{blk.blockHash}</span>
                  </div>
                  <div>
                    <span className="text-[#8B9387]">Prev Hash: </span>
                    <span className="text-[#A8AEA4] truncate block">{blk.previousBlockHash}</span>
                  </div>
                  <div>
                    <span className="text-[#8B9387]">TxId: </span>
                    <span className="text-white truncate block">{blk.txId}</span>
                  </div>
                  <div>
                    <span className="text-[#8B9387]">Endorsements: </span>
                    <span className="text-[#E0B286] truncate block">{blk.endorsingOrgs.join(", ")}</span>
                  </div>
                </div>

                <div className="bg-[#141812] p-4 rounded-xl text-[#A8AEA4] text-[11px] space-y-1 border border-[#2D352A]">
                  <div>Event: <span className="text-white">{blk.eventData.eventId}</span> | Type: <span className="text-[#A3B899] font-bold">{blk.eventData.eventType}</span></div>
                  <div>Ref: <span className="text-[#E0B286] font-bold">{blk.eventData.verificationReference}</span> | SHA: <span className="text-[#D3D8CF]">{blk.eventData.sha256.substring(0, 24)}...</span></div>
                  <div>Maker: <span className="text-white">{blk.eventData.makerActorId}</span> | Checker: <span className="text-white">{blk.eventData.checkerActorId}</span></div>
                  {blk.eventData.approvalReason && (
                    <div className="pt-1 text-[#C9D6C3] italic">Approval: {blk.eventData.approvalReason}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Back Navigation */}
      <div className="flex justify-center pt-2">
        <Link
          href="/officer"
          className="btn-shine px-6 py-3 bg-[#5D7052] hover:bg-[#4E5E44] text-[#F3F4F1] text-xs font-semibold rounded-full flex items-center gap-2 transition-all shadow-soft active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Officer Workspace
        </Link>
      </div>
    </div>
  );
}
