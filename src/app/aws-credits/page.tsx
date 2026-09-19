"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  ShieldAlert,
  Server,
  Database,
  HardDrive,
  Cpu,
  Key,
  Activity,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Zap,
  Play,
  Terminal,
  Layers,
  Lock,
  ArrowUpRight
} from "lucide-react";
import { AwsBudgetStatus } from "@/lib/types/domain";

export default function AwsCreditsPage() {
  const [budget, setBudget] = useState<AwsBudgetStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  const fetchBudget = async () => {
    try {
      const res = await fetch("/api/v1/aws/credits");
      if (res.ok) {
        const data = await res.json();
        setBudget(data);
      }
    } catch (err) {
      console.error("Failed to load AWS budget:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget();
  }, []);

  const handleSimulate = async (scenario: string) => {
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/v1/aws/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "simulate", scenario }),
      });
      const data = await res.json();
      if (res.ok) {
        setBudget(data);
        setMessage({ text: `Simulated scenario '${scenario}' executed successfully.`, type: "success" });
      } else {
        setMessage({ text: data.error || "Simulation failed", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Network error during simulation", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleCircuitBreaker = async () => {
    if (!budget) return;
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/v1/aws/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_circuit_breaker",
          active: !budget.circuitBreakerActive,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setBudget(data);
        setMessage({
          text: data.circuitBreakerActive
            ? "Emergency Circuit Breaker ENGAGED: Outgoing billable AWS operations are suspended."
            : "Circuit Breaker RELEASED: Normal pilot operations resumed.",
          type: data.circuitBreakerActive ? "error" : "success",
        });
      }
    } catch (err) {
      setMessage({ text: "Failed to toggle circuit breaker", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReset = async () => {
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/v1/aws/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      const data = await res.json();
      if (res.ok) {
        setBudget(data);
        setMessage({ text: "Budget guardrails reset to pilot baseline ($4.85 spent).", type: "info" });
      }
    } catch (err) {
      setMessage({ text: "Reset failed", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !budget) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-4" />
        <p className="text-slate-600 font-medium">Connecting to AWS Cost & Credits Guardrail Engine...</p>
      </div>
    );
  }

  const getAlertBadge = (level: AwsBudgetStatus["currentAlertLevel"]) => {
    switch (level) {
      case "NOMINAL":
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-300">Nominal (&lt;$10)</span>;
      case "WARMUP_10":
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full border border-blue-300">$10 Alert (Warmup)</span>;
      case "CHECKPOINT_25":
        return <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full border border-yellow-300">$25 Alert (Checkpoint)</span>;
      case "MIDPOINT_50":
        return <span className="px-2.5 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full border border-orange-300">$50 Alert (50% Reached)</span>;
      case "WARNING_75":
        return <span className="px-2.5 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full border border-red-300 animate-pulse">$75 Warning (Auto-Throttle)</span>;
      case "CIRCUIT_BREAKER_100":
        return <span className="px-2.5 py-1 bg-red-600 text-white text-xs font-bold rounded-full border border-red-700 animate-bounce">100% Circuit Breaker Tripped</span>;
    }
  };

  const getServiceIcon = (key: string) => {
    switch (key) {
      case "dynamodb":
        return <Database className="w-5 h-5 text-blue-500" />;
      case "s3_evidence":
        return <HardDrive className="w-5 h-5 text-emerald-500" />;
      case "lambda":
        return <Cpu className="w-5 h-5 text-amber-500" />;
      case "api_gateway":
        return <Server className="w-5 h-5 text-indigo-500" />;
      case "kms":
        return <Key className="w-5 h-5 text-purple-500" />;
      case "cloudwatch":
        return <Activity className="w-5 h-5 text-teal-500" />;
      default:
        return <Layers className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs font-semibold tracking-wide uppercase mb-2">
            <DollarSign className="w-3.5 h-3.5" />
            TRD Section 3 & 4 Guardrails
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            AWS Architecture & Credit Guardrail Center
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Real-time spend monitoring, credit depletion safeguard, and circuit breaker for BhuSetu on AWS Asia Pacific (Mumbai).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            disabled={actionLoading}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? "animate-spin" : ""}`} />
            <span>Reset Baseline</span>
          </button>
          <button
            onClick={handleToggleCircuitBreaker}
            disabled={actionLoading}
            className={`px-4 py-2 text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 ${
              budget.circuitBreakerActive
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-amber-600 hover:bg-amber-700 text-white"
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{budget.circuitBreakerActive ? "Release Circuit Breaker" : "Trip Emergency Breaker"}</span>
          </button>
        </div>
      </div>

      {/* Action Notification Message */}
      {message && (
        <div
          className={`p-4 rounded-xl text-sm border flex items-center gap-3 ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : message.type === "error"
              ? "bg-red-50 border-red-200 text-red-900"
              : "bg-blue-50 border-blue-200 text-blue-900"
          }`}
        >
          {message.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
          {message.type === "error" && <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />}
          {message.type === "info" && <Activity className="w-5 h-5 text-blue-600 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Circuit Breaker Alert Banner */}
      {budget.circuitBreakerActive && (
        <div className="bg-red-950 text-white p-6 rounded-2xl border-2 border-red-500 shadow-xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-800 flex items-center justify-center font-bold text-white shrink-0 animate-pulse">
              <ShieldAlert className="w-6 h-6 text-red-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-red-100">CIRCUIT BREAKER ENGAGED: AWS Operations Suspended</h2>
              <p className="text-xs text-red-300">
                Current spend has reached the safety limit ($100.00). Inbound mutation requests and S3 writes are temporarily routed to local verification simulation to avoid overdrafting project credits.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Cards: Spend, Remaining Credits, Threshold */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Budget */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pilot Credit Pool</div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono">
            ${budget.pilotBudgetLimitUsd.toFixed(2)}
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Non-revolving credit limit</span>
          </div>
        </div>

        {/* Current Spend */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Spend</div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono flex items-baseline gap-2">
            <span>${budget.currentSpendUsd.toFixed(2)}</span>
            <span className="text-xs font-normal text-slate-500">({budget.percentUtilized}% used)</span>
          </div>
          <div className="flex items-center gap-2">{getAlertBadge(budget.currentAlertLevel)}</div>
        </div>

        {/* Remaining Credits */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Remaining Credits</div>
          <div className="text-3xl font-extrabold text-emerald-700 font-mono">
            ${budget.remainingCreditsUsd.toFixed(2)}
          </div>
          <div className="text-xs text-slate-500">Available for district pilot operations</div>
        </div>

        {/* Active AWS Region & Profile */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AWS Environment</div>
          <div className="space-y-1 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Region:</span>
              <span className="font-bold text-slate-800">{budget.region} (Mumbai)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Profile:</span>
              <span className="font-bold text-emerald-600">{budget.profile}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Account:</span>
              <span className="text-slate-700">{budget.awsAccountId}</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400">Connected via AWS MCP Proxy</div>
        </div>
      </div>

      {/* Progress Bar with Budget Threshold Markers */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center text-sm font-semibold text-slate-800">
          <span>AWS Budget Depletion Progress</span>
          <span className="font-mono text-slate-600">${budget.currentSpendUsd.toFixed(2)} / $100.00</span>
        </div>

        <div className="relative w-full bg-slate-100 rounded-full h-4 overflow-hidden border border-slate-200">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              budget.percentUtilized >= 100
                ? "bg-red-600"
                : budget.percentUtilized >= 75
                ? "bg-red-500"
                : budget.percentUtilized >= 50
                ? "bg-amber-500"
                : "bg-emerald-500"
            }`}
            style={{ width: `${Math.min(100, budget.percentUtilized)}%` }}
          />
        </div>

        {/* Threshold Markers */}
        <div className="grid grid-cols-5 text-center text-xs pt-1 text-slate-600 font-mono">
          <div className="border-l border-slate-300 pl-1 text-left">
            <span className="font-bold text-slate-800">$10</span>
            <div className="text-[10px] text-slate-500">Warmup</div>
          </div>
          <div className="border-l border-slate-300 pl-1 text-left">
            <span className="font-bold text-slate-800">$25</span>
            <div className="text-[10px] text-slate-500">Nominal</div>
          </div>
          <div className="border-l border-slate-300 pl-1 text-left">
            <span className="font-bold text-slate-800">$50</span>
            <div className="text-[10px] text-slate-500">Midpoint</div>
          </div>
          <div className="border-l border-slate-300 pl-1 text-left">
            <span className="font-bold text-red-600">$75</span>
            <div className="text-[10px] text-slate-500">Throttle</div>
          </div>
          <div className="border-l border-red-500 pl-1 text-left">
            <span className="font-bold text-red-700">$100</span>
            <div className="text-[10px] text-red-600 font-semibold">Cutoff</div>
          </div>
        </div>
      </div>

      {/* Services Breakdown Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-slate-700" />
          <span>AWS Micro-Service Cost Breakdown (ap-south-1)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Object.entries(budget.services).map(([key, service]) => (
            <div key={key} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    {getServiceIcon(key)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-tight">{service.serviceName}</h3>
                    <span className="text-[11px] text-slate-500">{service.category}</span>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-base font-bold text-slate-900">${service.totalCostUsd.toFixed(2)}</div>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{service.description}</p>

              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-500">Recorded Usage:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {service.quantity.toLocaleString()} {service.usageUnit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Workload Simulator */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-lg space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Interactive Budget Alarm & Stress Simulator</h2>
          </div>
          <span className="text-xs text-slate-400">TRD Section 3 Test Harness</span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          Trigger simulated pilot traffic patterns to verify that AWS Budget alarms fire at $10, $25, $50, $75 thresholds and the Circuit Breaker trips cleanly at $100.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <button
            onClick={() => handleSimulate("verification_burst")}
            disabled={actionLoading || budget.circuitBreakerActive}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-left rounded-xl border border-slate-700 transition-colors disabled:opacity-50 space-y-1.5"
          >
            <div className="font-semibold text-xs text-emerald-400 flex items-center justify-between">
              <span>Burst Verifications</span>
              <Play className="w-3 h-3" />
            </div>
            <div className="text-[11px] text-slate-300">Simulate 100k API Gateway + Lambda + DynamoDB queries (+~$0.15)</div>
          </button>

          <button
            onClick={() => handleSimulate("evidence_ingestion")}
            disabled={actionLoading || budget.circuitBreakerActive}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-left rounded-xl border border-slate-700 transition-colors disabled:opacity-50 space-y-1.5"
          >
            <div className="font-semibold text-xs text-blue-400 flex items-center justify-between">
              <span>Evidence Batch Upload</span>
              <Play className="w-3 h-3" />
            </div>
            <div className="text-[11px] text-slate-300">Upload 5k deeds to encrypted S3 with KMS keys (+~$5.80)</div>
          </button>

          <button
            onClick={() => handleSimulate("cross_75_threshold")}
            disabled={actionLoading || budget.circuitBreakerActive}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-left rounded-xl border border-slate-700 transition-colors disabled:opacity-50 space-y-1.5"
          >
            <div className="font-semibold text-xs text-yellow-400 flex items-center justify-between">
              <span>Trigger $75 Alarm</span>
              <Play className="w-3 h-3" />
            </div>
            <div className="text-[11px] text-slate-300">Force spend to $76.50 to test high-usage CloudWatch alarm</div>
          </button>

          <button
            onClick={() => handleSimulate("trip_circuit_breaker")}
            disabled={actionLoading}
            className="p-3 bg-red-900/40 hover:bg-red-900/60 text-left rounded-xl border border-red-700/50 transition-colors space-y-1.5"
          >
            <div className="font-semibold text-xs text-red-300 flex items-center justify-between">
              <span>Exceed $100 Budget</span>
              <Play className="w-3 h-3" />
            </div>
            <div className="text-[11px] text-red-200">Force spend to $100.25 to verify emergency circuit breaker</div>
          </button>
        </div>
      </div>

      {/* CloudWatch Cost Event Audit Trail */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-slate-700" />
          <span>CloudWatch Cost Event Log & Audit Stream</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Operational Event</th>
                <th className="py-2.5 px-3 text-right">Cost Delta</th>
                <th className="py-2.5 px-3 text-right">Cumulative Spend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {budget.recentCostEvents.map((evt, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-800">{evt.event}</td>
                  <td className="py-2.5 px-3 text-right text-slate-600">
                    {evt.costImpactUsd > 0 ? `+$${evt.costImpactUsd.toFixed(4)}` : "$0.00"}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                    ${evt.runningTotalUsd.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
