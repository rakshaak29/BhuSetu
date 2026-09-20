"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Download,
  History,
  Filter,
  RefreshCw,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Search,
  AlertTriangle,
  User,
  Calendar,
  Activity,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { AuditEvent } from "@/lib/types/domain";

type OutcomeFilter = "ALL" | "SUCCESS" | "DENIED" | "ERROR";
type ActionFilter = "ALL" | string;

function OutcomeBadge({ outcome }: { outcome: string }) {
  const styles: Record<string, string> = {
    SUCCESS: "bg-[#EEF4EB] text-[#2D5A27] border border-[#A8C89C]",
    DENIED: "bg-[#FFF1F2] text-[#9F1239] border border-[#FECDD3]",
    ERROR: "bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]",
  };
  const icons: Record<string, React.ReactNode> = {
    SUCCESS: <CheckCircle2 className="w-3 h-3 text-[#437C3C]" />,
    DENIED: <XCircle className="w-3 h-3 text-[#E11D48]" />,
    ERROR: <AlertTriangle className="w-3 h-3 text-[#D97706]" />,
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
        styles[outcome] || "bg-[#F0EBE5] text-[#78786C] border border-[#DED8CF]"
      }`}
    >
      {icons[outcome]}
      {outcome}
    </span>
  );
}

function ActionBadge({ action }: { action: string }) {
  const color = action.includes("APPROVE") || action.includes("VERIFY")
    ? "text-[#2D5A27] bg-[#EEF4EB] border-[#A8C89C]"
    : action.includes("DISPUTE") || action.includes("REJECT")
    ? "text-[#9F1239] bg-[#FFF1F2] border-[#FECDD3]"
    : action.includes("EXPORT") || action.includes("AUDIT")
    ? "text-[#6B21A8] bg-[#F3E8FF] border-[#E9D5FF]"
    : "text-[#5D7052] bg-[#F0EBE5] border-[#DED8CF]";
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[10.5px] font-mono font-semibold ${color}`}>
      {action}
    </span>
  );
}

export default function AuditPage() {
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportTimestamp, setExportTimestamp] = useState<string>("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Filters
  const [outcomeFilter, setOutcomeFilter] = useState<OutcomeFilter>("ALL");
  const [actionFilter, setActionFilter] = useState<ActionFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const fetchAuditLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/audit/export");
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setAuditLogs(data.auditEvents || []);
      setExportTimestamp(data.exportTimestamp || new Date().toISOString());
      setLastRefreshed(new Date());
    } catch (err: any) {
      setError(err.message || "Failed to load audit logs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  // Derive unique actions for filter dropdown
  const uniqueActions = Array.from(new Set(auditLogs.map((l) => l.action))).sort();

  // Apply filters + search
  useEffect(() => {
    let result = [...auditLogs];

    if (outcomeFilter !== "ALL") {
      result = result.filter((l) => l.outcome === outcomeFilter);
    }
    if (actionFilter !== "ALL") {
      result = result.filter((l) => l.action === actionFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.actorId.toLowerCase().includes(q) ||
          l.actorRole.toLowerCase().includes(q) ||
          l.resourceId.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q) ||
          l.correlationId.toLowerCase().includes(q)
      );
    }

    setFilteredLogs(result);
  }, [auditLogs, outcomeFilter, actionFilter, searchQuery]);

  // Summary counts
  const successCount = auditLogs.filter((l) => l.outcome === "SUCCESS").length;
  const deniedCount = auditLogs.filter((l) => l.outcome === "DENIED").length;
  const errorCount = auditLogs.filter((l) => l.outcome === "ERROR").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#242A22] via-[#2A3127] to-[#1F241E] text-[#F3F4F1] p-6 sm:p-8 border border-[#3E4A3B] shadow-float space-y-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#5D7052]/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-[#C18C5D]/15 rounded-full blur-3xl pointer-events-none -mb-20" />

        <div className="relative z-10 flex items-center gap-2">
          <Link
            href="/officer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1A1F18]/90 border border-[#3E4A3B] text-xs font-semibold text-[#A8AEA4] hover:text-white hover:border-[#5D7052] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Officer Workspace
          </Link>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5D7052]/30 border border-[#5D7052]/50 text-[#C9D6C3] text-[11px] font-semibold tracking-wider uppercase">
              <History className="w-3.5 h-3.5 text-[#A3B899]" />
              District Audit Trail
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
              Audit Log & Export Centre
            </h1>
            <p className="text-xs sm:text-sm text-[#A8AEA4] max-w-2xl leading-relaxed">
              Every action in the system is logged here with a unique ID, including verification requests, approvals, and court hold updates, as per Section 65B of the IT Act, 2000.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={fetchAuditLogs}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#1A1F18]/90 hover:bg-[#242A22] text-[#F3F4F1] text-xs font-semibold rounded-full border border-[#3E4A3B] transition-colors shadow-soft"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#A3B899] ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <a
              href="/api/v1/audit/export"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-shine inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#C18C5D] hover:bg-[#A97447] text-white text-xs font-semibold rounded-full transition-all shadow-soft active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              Export Full JSON
            </a>
          </div>
        </div>

        {/* Summary KPIs */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-2 border-t border-[#3E4A3B]/80">
          <div className="bg-[#1A1F18]/80 rounded-2xl p-4 text-center border border-[#3E4A3B]/60 shadow-inner-soft">
            <Activity className="w-4 h-4 text-[#8B9387] mx-auto mb-1.5" />
            <div className="font-serif text-2xl font-bold text-white">{auditLogs.length}</div>
            <div className="text-[10.5px] text-[#8B9387] uppercase tracking-wider mt-0.5">Total Events</div>
          </div>
          <div className="bg-[#152317]/80 rounded-2xl p-4 text-center border border-[#2D5A27]/40 shadow-inner-soft">
            <CheckCircle2 className="w-4 h-4 text-[#A8C89C] mx-auto mb-1.5" />
            <div className="font-serif text-2xl font-bold text-[#A8C89C]">{successCount}</div>
            <div className="text-[10.5px] text-[#A8C89C] uppercase tracking-wider mt-0.5">Success</div>
          </div>
          <div className="bg-[#291316]/80 rounded-2xl p-4 text-center border border-[#9F1239]/40 shadow-inner-soft">
            <XCircle className="w-4 h-4 text-[#FECDD3] mx-auto mb-1.5" />
            <div className="font-serif text-2xl font-bold text-[#FECDD3]">{deniedCount}</div>
            <div className="text-[10.5px] text-[#FECDD3] uppercase tracking-wider mt-0.5">Denied</div>
          </div>
          <div className="bg-[#261B0E]/80 rounded-2xl p-4 text-center border border-[#B45309]/40 shadow-inner-soft">
            <AlertTriangle className="w-4 h-4 text-[#FDE68A] mx-auto mb-1.5" />
            <div className="font-serif text-2xl font-bold text-[#FDE68A]">{errorCount}</div>
            <div className="text-[10.5px] text-[#FDE68A] uppercase tracking-wider mt-0.5">Errors</div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      <div className="organic-card rounded-3xl p-5 sm:p-6 space-y-4 border border-[#DED8CF] shadow-soft">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#78786C] uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-[#5D7052]" />
          Filter & Search Audit Stream
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78786C] pointer-events-none" />
            <input
              type="text"
              placeholder="Search actor, resource, action, correlation ID…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-[#DED8CF] rounded-2xl bg-[#FEFEFA] text-[#2C2C24] placeholder-[#78786C]/70 focus:outline-none focus:ring-2 focus:ring-[#5D7052]/20 focus:border-[#5D7052] transition-all"
            />
          </div>

          {/* Outcome filter */}
          <select
            value={outcomeFilter}
            onChange={(e) => setOutcomeFilter(e.target.value as OutcomeFilter)}
            className="w-full px-3.5 py-2.5 text-xs border border-[#DED8CF] rounded-2xl bg-[#FEFEFA] text-[#2C2C24] focus:outline-none focus:ring-2 focus:ring-[#5D7052]/20 focus:border-[#5D7052] transition-all cursor-pointer"
          >
            <option value="ALL">All Outcomes</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="DENIED">DENIED</option>
            <option value="ERROR">ERROR</option>
          </select>

          {/* Action filter */}
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs border border-[#DED8CF] rounded-2xl bg-[#FEFEFA] text-[#2C2C24] focus:outline-none focus:ring-2 focus:ring-[#5D7052]/20 focus:border-[#5D7052] transition-all cursor-pointer"
          >
            <option value="ALL">All Action Types</option>
            {uniqueActions.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
        </div>

        {/* Active filter summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#78786C] font-mono pt-1">
          <span>
            Showing <strong className="text-[#2C2C24]">{filteredLogs.length}</strong> of{" "}
            <strong className="text-[#2C2C24]">{auditLogs.length}</strong> events
            {lastRefreshed && (
              <>
                {" "}&bull;{" "}
                <span className="inline-flex items-center gap-1 text-[#5D7052]">
                  <Clock className="w-3 h-3" />
                  Refreshed {lastRefreshed.toLocaleTimeString("en-IN")}
                </span>
              </>
            )}
          </span>
          {(outcomeFilter !== "ALL" || actionFilter !== "ALL" || searchQuery) && (
            <button
              onClick={() => {
                setOutcomeFilter("ALL");
                setActionFilter("ALL");
                setSearchQuery("");
              }}
              className="text-[#C18C5D] hover:underline font-semibold self-start sm:self-auto"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Audit Table */}
      <div className="organic-card rounded-3xl border border-[#DED8CF] overflow-hidden shadow-soft">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <RefreshCw className="w-8 h-8 text-[#5D7052] animate-spin" />
            <span className="text-xs text-[#78786C]">Loading audit events…</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <AlertTriangle className="w-8 h-8 text-[#9E2A2B]" />
            <p className="text-xs text-[#9E2A2B] font-semibold">{error}</p>
            <button onClick={fetchAuditLogs} className="text-xs underline text-[#78786C] hover:text-[#2C2C24]">
              Retry
            </button>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <FileText className="w-8 h-8 text-[#78786C]" />
            <p className="text-xs text-[#78786C]">No audit events match your current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono min-w-[800px]">
              <thead className="bg-[#F0EBE5] border-b border-[#DED8CF] text-[#78786C] sticky top-0">
                <tr>
                  <th className="p-3.5 font-semibold text-[10px] uppercase tracking-wider w-32">Time (IST)</th>
                  <th className="p-3.5 font-semibold text-[10px] uppercase tracking-wider">Actor</th>
                  <th className="p-3.5 font-semibold text-[10px] uppercase tracking-wider">Action</th>
                  <th className="p-3.5 font-semibold text-[10px] uppercase tracking-wider">Resource</th>
                  <th className="p-3.5 font-semibold text-[10px] uppercase tracking-wider">Jurisdiction</th>
                  <th className="p-3.5 font-semibold text-[10px] uppercase tracking-wider">Outcome</th>
                  <th className="p-3.5 font-semibold text-[10px] uppercase tracking-wider w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DED8CF]/70 bg-[#FEFEFA]">
                {filteredLogs.map((log) => {
                  const isExpanded = expandedRow === log.auditEventId;
                  return (
                    <div key={log.auditEventId} className="contents">
                      <tr
                        className="hover:bg-[#F0EBE5]/50 cursor-pointer transition-colors"
                        onClick={() => setExpandedRow(isExpanded ? null : log.auditEventId)}
                      >
                        <td className="p-3.5 text-[#78786C] whitespace-nowrap">
                          <span className="font-semibold text-[#2C2C24]">
                            {new Date(log.occurredAt).toLocaleTimeString("en-IN", { hour12: false })}
                          </span>
                          <div className="text-[9.5px] text-[#78786C]/70">
                            {new Date(log.occurredAt).toLocaleDateString("en-IN")}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-[#2C2C24]">{log.actorId}</div>
                          <div className="text-[10px] text-[#78786C] font-sans">{log.actorRole}</div>
                        </td>
                        <td className="p-3.5">
                          <ActionBadge action={log.action} />
                        </td>
                        <td className="p-3.5">
                          <span className="text-[10px] text-[#78786C] block">{log.resourceType}</span>
                          <div className="font-semibold text-[#2C2C24] truncate max-w-[170px]">{log.resourceId}</div>
                        </td>
                        <td className="p-3.5 text-[#78786C]">{log.jurisdiction}</td>
                        <td className="p-3.5">
                          <OutcomeBadge outcome={log.outcome} />
                        </td>
                        <td className="p-3.5 text-[#78786C]">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-[#5D7052]" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </td>
                      </tr>

                      {/* Expandable row: correlation ID + details */}
                      {isExpanded && (
                        <tr className="bg-[#F0EBE5]/40 border-b border-[#DED8CF]">
                          <td colSpan={7} className="px-6 py-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-[11px]">
                              <div className="space-y-2 bg-[#FEFEFA] p-4 rounded-2xl border border-[#DED8CF]">
                                <div className="font-sans font-bold text-[#78786C] uppercase tracking-wider text-[10px]">
                                  Cryptographic Identifiers
                                </div>
                                <div className="space-y-1">
                                  <div>
                                    <span className="text-[#78786C]">Audit Event ID: </span>
                                    <code className="text-[#2C2C24] font-bold">{log.auditEventId}</code>
                                  </div>
                                  <div>
                                    <span className="text-[#78786C]">Correlation ID: </span>
                                    <code className="text-[#5D7052] font-semibold">{log.correlationId}</code>
                                  </div>
                                  <div>
                                    <span className="text-[#78786C]">Full Timestamp: </span>
                                    <code className="text-[#2C2C24]">{log.occurredAt}</code>
                                  </div>
                                </div>
                              </div>
                              {log.details && Object.keys(log.details).length > 0 && (
                                <div className="space-y-2 bg-[#FEFEFA] p-4 rounded-2xl border border-[#DED8CF]">
                                  <div className="font-sans font-bold text-[#78786C] uppercase tracking-wider text-[10px]">
                                    Event Payload Snapshot
                                  </div>
                                  <pre className="text-[#2C2C24] bg-[#F0EBE5]/60 border border-[#DED8CF] rounded-xl p-3 text-[10.5px] overflow-auto max-h-32">
                                    {JSON.stringify(log.details, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </div>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer */}
        {!loading && !error && auditLogs.length > 0 && (
          <div className="px-5 py-3.5 border-t border-[#DED8CF] bg-[#F0EBE5] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[10.5px] font-mono text-[#78786C]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#5D7052]" />
              Permanent log: once recorded, audit entries cannot be edited or deleted.
            </span>
            <span>
              Export snapshot: <strong className="text-[#2C2C24]">{new Date(exportTimestamp).toLocaleString("en-IN")}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Legal Footer Note */}
      <div className="flex items-start gap-3 text-xs text-[#78786C] bg-[#F0EBE5]/60 border border-[#DED8CF] rounded-3xl p-5 sm:p-6 shadow-soft">
        <ShieldCheck className="w-5 h-5 text-[#5D7052] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-[#2C2C24]">Section 65B Electronic Evidence Compliance:</strong> This audit log can be presented in court as valid electronic evidence. Every event is time-stamped and stored permanently in secure database tables where no user or officer has permission to delete records. Exports are restricted to authorized Auditor and Admin accounts.
        </p>
      </div>
    </div>
  );
}
