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
    SUCCESS: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    DENIED: "bg-rose-100 text-rose-800 border border-rose-200",
    ERROR: "bg-amber-100 text-amber-800 border border-amber-200",
  };
  const icons: Record<string, React.ReactNode> = {
    SUCCESS: <CheckCircle2 className="w-3 h-3" />,
    DENIED: <XCircle className="w-3 h-3" />,
    ERROR: <AlertTriangle className="w-3 h-3" />,
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${styles[outcome] || "bg-slate-100 text-slate-700"}`}
    >
      {icons[outcome]}
      {outcome}
    </span>
  );
}

function ActionBadge({ action }: { action: string }) {
  const color = action.includes("APPROVE") || action.includes("VERIFY")
    ? "text-emerald-700 bg-emerald-50 border-emerald-200"
    : action.includes("DISPUTE") || action.includes("REJECT")
    ? "text-rose-700 bg-rose-50 border-rose-200"
    : action.includes("EXPORT") || action.includes("AUDIT")
    ? "text-purple-700 bg-purple-50 border-purple-200"
    : "text-slate-700 bg-slate-50 border-slate-200";
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded border text-[10px] font-mono font-semibold ${color}`}>
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
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <div className="bg-carbon-primary text-white rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Link
            href="/officer"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Officer Workspace
          </Link>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <History className="w-4 h-4" />
              Immutable System Audit Trail
            </div>
            <h1 className="text-2xl font-bold mt-1">Audit Log & Export Centre</h1>
            <p className="text-xs text-slate-400 mt-1">
              All system actions — logins, reads, writes, approvals, and dispute events — logged with correlation IDs per §65B IT Act 2000.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              onClick={fetchAuditLogs}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <a
              href="/api/v1/audit/export"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 bg-terracotta hover:bg-terracotta-hover text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              Export Full JSON
            </a>
          </div>
        </div>

        {/* Summary KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
          <div className="bg-slate-800/80 rounded-xl p-3 text-center">
            <Activity className="w-4 h-4 text-slate-400 mx-auto mb-1" />
            <div className="text-2xl font-bold text-white">{auditLogs.length}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Total Events</div>
          </div>
          <div className="bg-emerald-950/60 rounded-xl p-3 text-center border border-emerald-900/40">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <div className="text-2xl font-bold text-emerald-400">{successCount}</div>
            <div className="text-[10px] text-emerald-500 uppercase tracking-wider">Success</div>
          </div>
          <div className="bg-rose-950/60 rounded-xl p-3 text-center border border-rose-900/40">
            <XCircle className="w-4 h-4 text-rose-400 mx-auto mb-1" />
            <div className="text-2xl font-bold text-rose-400">{deniedCount}</div>
            <div className="text-[10px] text-rose-500 uppercase tracking-wider">Denied</div>
          </div>
          <div className="bg-amber-950/60 rounded-xl p-3 text-center border border-amber-900/40">
            <AlertTriangle className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <div className="text-2xl font-bold text-amber-400">{errorCount}</div>
            <div className="text-[10px] text-amber-500 uppercase tracking-wider">Errors</div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      <div className="parchment-card rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-carbon-muted uppercase tracking-wider">
          <Filter className="w-4 h-4" />
          Filter & Search
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-carbon-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Search actor, resource, action, correlation ID…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-parchment-border rounded-xl bg-white text-carbon-primary focus:outline-none focus:ring-2 focus:ring-terracotta/30"
            />
          </div>

          {/* Outcome filter */}
          <select
            value={outcomeFilter}
            onChange={(e) => setOutcomeFilter(e.target.value as OutcomeFilter)}
            className="w-full px-3 py-2 text-xs border border-parchment-border rounded-xl bg-white text-carbon-primary focus:outline-none focus:ring-2 focus:ring-terracotta/30"
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
            className="w-full px-3 py-2 text-xs border border-parchment-border rounded-xl bg-white text-carbon-primary focus:outline-none focus:ring-2 focus:ring-terracotta/30"
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
        <div className="flex items-center justify-between text-[10px] text-carbon-muted font-mono">
          <span>
            Showing <strong className="text-carbon-primary">{filteredLogs.length}</strong> of{" "}
            <strong className="text-carbon-primary">{auditLogs.length}</strong> events
            {lastRefreshed && (
              <>
                {" "}&bull;{" "}
                <span className="flex items-center gap-1 inline-flex">
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
              className="text-terracotta hover:underline font-semibold"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Audit Table */}
      <div className="parchment-card rounded-2xl border border-parchment-border overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <RefreshCw className="w-8 h-8 text-carbon-muted animate-spin" />
            <span className="text-xs text-carbon-muted">Loading audit events…</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <AlertTriangle className="w-8 h-8 text-status-mismatch-text" />
            <p className="text-xs text-status-mismatch-text font-semibold">{error}</p>
            <button onClick={fetchAuditLogs} className="text-xs underline text-carbon-muted hover:text-carbon-primary">
              Retry
            </button>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <FileText className="w-8 h-8 text-carbon-muted" />
            <p className="text-xs text-carbon-muted">No audit events match your current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono min-w-[800px]">
              <thead className="bg-parchment-muted border-b border-parchment-border text-carbon-muted sticky top-0">
                <tr>
                  <th className="p-3 font-semibold text-[10px] uppercase tracking-wider w-28">Time (IST)</th>
                  <th className="p-3 font-semibold text-[10px] uppercase tracking-wider">Actor</th>
                  <th className="p-3 font-semibold text-[10px] uppercase tracking-wider">Action</th>
                  <th className="p-3 font-semibold text-[10px] uppercase tracking-wider">Resource</th>
                  <th className="p-3 font-semibold text-[10px] uppercase tracking-wider">Jurisdiction</th>
                  <th className="p-3 font-semibold text-[10px] uppercase tracking-wider">Outcome</th>
                  <th className="p-3 font-semibold text-[10px] uppercase tracking-wider w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-parchment-border">
                {filteredLogs.map((log) => {
                  const isExpanded = expandedRow === log.auditEventId;
                  return (
                    <>
                      <tr
                        key={log.auditEventId}
                        className="hover:bg-parchment-muted cursor-pointer transition-colors"
                        onClick={() => setExpandedRow(isExpanded ? null : log.auditEventId)}
                      >
                        <td className="p-3 text-carbon-muted whitespace-nowrap">
                          {new Date(log.occurredAt).toLocaleTimeString("en-IN", { hour12: false })}
                          <div className="text-[9px] text-carbon-muted/70">
                            {new Date(log.occurredAt).toLocaleDateString("en-IN")}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-carbon-primary">{log.actorId}</div>
                          <div className="text-[10px] text-carbon-muted font-sans">{log.actorRole}</div>
                        </td>
                        <td className="p-3">
                          <ActionBadge action={log.action} />
                        </td>
                        <td className="p-3 text-carbon-secondary">
                          <span className="text-[10px] text-carbon-muted">{log.resourceType}</span>
                          <div className="font-semibold text-carbon-primary truncate max-w-[160px]">{log.resourceId}</div>
                        </td>
                        <td className="p-3 text-carbon-muted">{log.jurisdiction}</td>
                        <td className="p-3">
                          <OutcomeBadge outcome={log.outcome} />
                        </td>
                        <td className="p-3 text-carbon-muted">
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </td>
                      </tr>

                      {/* Expandable row: correlation ID + details */}
                      {isExpanded && (
                        <tr key={`${log.auditEventId}-detail`} className="bg-parchment-muted">
                          <td colSpan={7} className="px-6 py-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px]">
                              <div className="space-y-1.5">
                                <div className="font-sans font-semibold text-carbon-muted uppercase tracking-wider text-[10px]">Identifiers</div>
                                <div>
                                  <span className="text-carbon-muted">Audit Event ID: </span>
                                  <code className="text-carbon-primary">{log.auditEventId}</code>
                                </div>
                                <div>
                                  <span className="text-carbon-muted">Correlation ID: </span>
                                  <code className="text-carbon-primary">{log.correlationId}</code>
                                </div>
                                <div>
                                  <span className="text-carbon-muted">Full Timestamp: </span>
                                  <code className="text-carbon-primary">{log.occurredAt}</code>
                                </div>
                              </div>
                              {log.details && Object.keys(log.details).length > 0 && (
                                <div className="space-y-1.5">
                                  <div className="font-sans font-semibold text-carbon-muted uppercase tracking-wider text-[10px]">Event Details</div>
                                  <pre className="text-carbon-primary bg-white border border-parchment-border rounded-lg p-3 text-[10px] overflow-auto max-h-28">
                                    {JSON.stringify(log.details, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer */}
        {!loading && !error && auditLogs.length > 0 && (
          <div className="px-4 py-3 border-t border-parchment-border bg-parchment-muted flex justify-between items-center text-[10px] font-mono text-carbon-muted">
            <span>
              <ShieldCheck className="inline w-3 h-3 text-emerald-600 mr-1" />
              Append-only ledger — no audit events can be deleted or modified post-record.
            </span>
            <span>
              Export snapshot: <strong>{new Date(exportTimestamp).toLocaleString("en-IN")}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Legal Footer Note */}
      <div className="flex items-start gap-3 text-[11px] text-carbon-muted bg-parchment-muted border border-parchment-border rounded-xl p-4">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p>
          <strong className="text-carbon-secondary">§65B IT Act 2000 Compliance:</strong> This audit trail is admissible as electronic evidence. All events are cryptographically time-stamped and stored in append-only DynamoDB tables with no delete privileges granted to any role. Audit export access is restricted to users with the <code className="bg-parchment-border px-1 rounded">AUDITOR</code> or <code className="bg-parchment-border px-1 rounded">ADMIN</code> role.
        </p>
      </div>
    </div>
  );
}
