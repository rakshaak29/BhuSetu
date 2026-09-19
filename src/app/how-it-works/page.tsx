import Link from "next/link";
import {
  ShieldCheck,
  Hash,
  FileCheck2,
  Lock,
  Users,
  GitMerge,
  Eye,
  AlertTriangle,
  ArrowRight,
  Scale,
  Database,
  Search,
  CheckCircle2,
  BookOpen,
  Cpu,
  Layers,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: <Hash className="w-6 h-6 text-terracotta" />,
    title: "Document Fingerprinting (SHA-256 Hashing)",
    summary: "Every land-record document — a Record of Rights extract, a Sub-Registrar deed, or a Survey report — is converted into a unique 64-character SHA-256 cryptographic hash the moment it is submitted.",
    detail:
      "The hash acts as a tamper-evident fingerprint. Even a single changed character in the document produces a completely different hash. The original document is never stored on the public ledger — only its fingerprint is. This ensures privacy while enabling independent verification by any third party who holds a copy of the original document.",
    badge: "Cryptographic Integrity",
    badgeColor: "text-terracotta bg-terracotta-light border border-terracotta/30",
    example: {
      label: "Sample SHA-256 Fingerprint",
      value: "a3f9c821e047bcd90f41a2d93...",
    },
  },
  {
    number: "02",
    icon: <Users className="w-6 h-6 text-blue-600" />,
    title: "Maker-Checker Dual-Control Submission",
    summary:
      "A Registration Officer (Maker) submits the evidence proposal. A Tahsildar or Revenue Checker (Checker) — always a separate, distinct individual — independently reviews and approves or rejects the submission.",
    detail:
      "The server enforces this rule programmatically: if the submitter's actor ID matches the approver's actor ID, the API returns HTTP 403 Forbidden — no exceptions. This dual-control design mirrors Indian Treasury rules and prevents single points of corruption.",
    badge: "Dual Authority Control",
    badgeColor: "text-blue-700 bg-blue-50 border border-blue-200",
    example: {
      label: "Server Guard Response on Self-Approval",
      value: "HTTP 403 — Creator cannot approve their own submission",
    },
  },
  {
    number: "03",
    icon: <GitMerge className="w-6 h-6 text-purple-600" />,
    title: "Multi-Organisation Ledger Endorsement",
    summary:
      "Once approved, the evidence event is broadcast to all participating organisations on the permissioned Hyperledger Fabric ledger: RevenueOrg, RegistrationOrg, and SurveyOrg must each endorse the transaction.",
    detail:
      "Endorsement means each organisation independently verifies that the transaction follows the agreed smart-contract rules. Only after a policy-defined quorum (e.g. 2 of 3 orgs) has endorsed does the ordering service commit the block to the permanent chain. No single government department can alter records unilaterally.",
    badge: "Hyperledger Fabric · land-records-pilot",
    badgeColor: "text-purple-700 bg-purple-50 border border-purple-200",
    example: {
      label: "Endorsing Orgs",
      value: "RevenueOrg · RegistrationOrg · SurveyOrg",
    },
  },
  {
    number: "04",
    icon: <Database className="w-6 h-6 text-emerald-600" />,
    title: "Immutable Block Commit & Reference Generation",
    summary:
      "Endorsed transactions are written into an immutable block with a unique block hash, block number, and transaction ID. BhuSetu generates a short, human-readable Verification Reference (e.g., BHS-2M7D-9KQX) for each committed evidence event.",
    detail:
      "Because Fabric ledger blocks are append-only and cryptographically chained, no party — not even the system administrator — can alter or delete a committed block without breaking every subsequent hash in the chain. The verification reference can be printed on physical documents and presented to banks or courts for independent lookup.",
    badge: "Append-Only Immutable Chain",
    badgeColor: "text-emerald-700 bg-emerald-50 border border-emerald-200",
    example: {
      label: "Sample Verification Reference",
      value: "BHS-2M7D-9KQX",
    },
  },
  {
    number: "05",
    icon: <Search className="w-6 h-6 text-slate-600" />,
    title: "Public Verification (Zero PII Exposure)",
    summary:
      "Any citizen, bank, or institution can verify a document by submitting its SHA-256 hash or the printed Verification Reference. BhuSetu compares against the ledger record and returns a clear status — VERIFIED, MISMATCH, or DISPUTED — without revealing owner names or private identifiers.",
    detail:
      "Owner parcel IDs are masked (e.g. AP-XX-•••-041) in all public API responses. Private S3 file references are never returned. The result is a clean, trustworthy signal with a mandatory legal disclaimer — suitable for display in a bank branch or court filing.",
    badge: "PII Minimisation · Public API",
    badgeColor: "text-slate-700 bg-slate-50 border border-slate-200",
    example: {
      label: "Sample Masked Parcel Reference",
      value: "AP-XX-•••-041",
    },
  },
  {
    number: "06",
    icon: <AlertTriangle className="w-6 h-6 text-status-disputed-text" />,
    title: "Dispute Hold Override",
    summary:
      "A District Court Liaison or Revenue Officer can place a Dispute Hold on any parcel at any time. This immediately overrides the verification status to DISPUTED — regardless of how many approved evidence events exist.",
    detail:
      "The DISPUTED status is displayed prominently in red on all public verification outputs, alerting banks, lawyers, and citizens to an active legal encumbrance. The hold includes a mandatory court-order reference and reason. The hold can only be released by an authorised officer, and every change is logged immutably in the audit trail.",
    badge: "Dispute Override · Mandatory Hold",
    badgeColor: "text-status-disputed-text bg-status-disputed-bg border border-status-disputed-border",
    example: {
      label: "Sample Dispute Reference",
      value: "COURT-OS-442-2025",
    },
  },
  {
    number: "07",
    icon: <Eye className="w-6 h-6 text-indigo-600" />,
    title: "Full Audit Trail & §65B Export",
    summary:
      "Every action in the system — login, read, evidence submission, approval, dispute flag, or audit export — is logged in an append-only DynamoDB audit table with actor ID, role, jurisdiction, timestamp, and outcome.",
    detail:
      "The audit trail is exportable as structured JSON, admissible under §65B of the Information Technology Act, 2000. Audit read access is restricted to AUDITOR and ADMIN roles only. Each log entry includes a unique Correlation ID to trace any multi-step workflow end-to-end.",
    badge: "§65B IT Act 2000 · Admissible Evidence",
    badgeColor: "text-indigo-700 bg-indigo-50 border border-indigo-200",
    example: {
      label: "Audit Actions Logged",
      value: "APPROVE_EVIDENCE · FLAG_DISPUTE · EXPORT_AUDIT · PUBLIC_VERIFY",
    },
  },
];

const principles = [
  {
    icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
    title: "Evidence, Not Title",
    body: "BhuSetu verifies that a document's cryptographic fingerprint matches an authorised record. It never declares legal title or ownership under the Indian Registration Act 1908 or Transfer of Property Act.",
  },
  {
    icon: <Lock className="w-5 h-5 text-terracotta" />,
    title: "Minimal PII Disclosure",
    body: "Owner names, Aadhaar, and full parcel IDs are never exposed in public API responses. Masking follows the '•••' convention — sharing only the minimum identifier needed for verification.",
  },
  {
    icon: <Layers className="w-5 h-5 text-purple-600" />,
    title: "Permissioned Fabric — Not Public Blockchain",
    body: "BhuSetu runs on a private Hyperledger Fabric network operated by authorised government organisations. It is not a public cryptocurrency chain. Participation requires identity certificates issued by the channel administrator.",
  },
  {
    icon: <Scale className="w-5 h-5 text-blue-600" />,
    title: "Dispute Always Wins",
    body: "Even a parcel with 50 VERIFIED evidence events will show DISPUTED in all public outputs if a Dispute Hold is active. Legal status always supersedes digital verification.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-16">
      {/* Hero */}
      <div className="text-center space-y-5">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-terracotta-light border border-terracotta/30 rounded-full text-terracotta text-xs font-bold">
          <BookOpen className="w-4 h-4" />
          Platform Transparency Guide
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-carbon-primary tracking-tight leading-tight">
          How BhuSetu Verification Works
        </h1>
        <p className="text-base text-carbon-muted max-w-2xl mx-auto leading-relaxed">
          BhuSetu is a land-record evidence verification platform built on cryptographic hashing, permissioned blockchain endorsement, and institutional dual-control. This page explains every step from document upload to public verification in plain language.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <Link
            href="/verify"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-terracotta hover:bg-terracotta-hover text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
          >
            <FileCheck2 className="w-4 h-4" />
            Verify a Document Now
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-carbon-primary hover:bg-carbon-secondary text-white text-sm font-bold rounded-xl transition-colors"
          >
            <Cpu className="w-4 h-4" />
            Run Interactive Demo
          </Link>
        </div>
      </div>

      {/* Statutory Disclaimer Banner */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-900 leading-relaxed">
          <strong>Statutory Notice:</strong> BhuSetu verifies evidence document fingerprints and records append-only history pursuant to §65B Information Technology Act 2000. Official State Revenue, Registration, Survey/Settlement, and Judicial systems remain the sole legal authority. A verified result indicates evidence authenticity at the recorded time and is <em>not</em> a conclusive guarantee of legal title, freedom from encumbrance, or boundary accuracy.
        </div>
      </div>

      {/* Step-by-step Process */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-carbon-primary">The 7-Step Verification Lifecycle</h2>
          <p className="text-sm text-carbon-muted">From document upload to public result — every step enforced by code, not policy.</p>
        </div>

        <div className="space-y-6">
          {steps.map((step, idx) => (
            <div
              key={step.number}
              className="parchment-card rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 relative overflow-hidden"
            >
              {/* Step number accent */}
              <div className="absolute top-0 right-0 text-[80px] font-extrabold text-parchment-border leading-none select-none pointer-events-none pr-4 pt-1">
                {step.number}
              </div>

              {/* Icon column */}
              <div className="shrink-0 flex sm:flex-col items-center sm:items-center gap-4 sm:gap-3">
                <div className="w-12 h-12 rounded-2xl bg-parchment-muted border border-parchment-border flex items-center justify-center shadow-sm">
                  {step.icon}
                </div>
                {idx < steps.length - 1 && (
                  <div className="hidden sm:block w-px flex-1 bg-parchment-border mt-2" style={{ minHeight: 24 }} />
                )}
              </div>

              {/* Content column */}
              <div className="flex-1 space-y-3 relative z-10">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${step.badgeColor}`}>
                    {step.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-carbon-primary">{step.title}</h3>
                <p className="text-sm text-carbon-secondary leading-relaxed">{step.summary}</p>
                <p className="text-xs text-carbon-muted leading-relaxed">{step.detail}</p>

                {/* Example block */}
                <div className="flex items-center gap-3 bg-parchment-muted rounded-xl px-4 py-2.5 border border-parchment-border font-mono text-xs">
                  <span className="text-carbon-muted shrink-0">{step.example.label}:</span>
                  <code className="text-carbon-primary font-bold truncate">{step.example.value}</code>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Core Design Principles */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-carbon-primary">Core Design Principles</h2>
          <p className="text-sm text-carbon-muted">What BhuSetu is — and what it is explicitly not.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {principles.map((p) => (
            <div key={p.title} className="parchment-card rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2">
                {p.icon}
                <h3 className="font-bold text-carbon-primary text-sm">{p.title}</h3>
              </div>
              <p className="text-xs text-carbon-muted leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Architecture Snapshot */}
      <div className="bg-carbon-primary text-white rounded-2xl p-6 sm:p-8 space-y-6 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            <Cpu className="w-4 h-4" />
            Technology Architecture
          </div>
          <h2 className="text-xl font-bold">What Powers BhuSetu</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 space-y-2">
            <div className="text-emerald-400 font-semibold font-sans">Ledger Layer</div>
            <div className="text-slate-200">Hyperledger Fabric v2.x</div>
            <div className="text-slate-400">Channel: land-records-pilot</div>
            <div className="text-slate-400">Orgs: Revenue · Registration · Survey</div>
          </div>
          <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 space-y-2">
            <div className="text-blue-400 font-semibold font-sans">Storage Layer</div>
            <div className="text-slate-200">AWS DynamoDB</div>
            <div className="text-slate-400">Tables: parcels · evidence · audit</div>
            <div className="text-slate-400">S3: bhusetu-evidence-* (server-side encrypted)</div>
          </div>
          <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 space-y-2">
            <div className="text-terracotta font-semibold font-sans">Application Layer</div>
            <div className="text-slate-200">Next.js 14 App Router (TypeScript)</div>
            <div className="text-slate-400">Deployed: AWS Lambda + CloudFront</div>
            <div className="text-slate-400">API: REST · SHA-256 · RBAC</div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center space-y-4 py-4">
        <h2 className="text-xl font-bold text-carbon-primary">Ready to verify a document?</h2>
        <p className="text-sm text-carbon-muted">Submit a document hash or paste a verification reference to get an instant result.</p>
        <Link
          href="/verify"
          className="inline-flex items-center gap-2 px-6 py-3 bg-terracotta hover:bg-terracotta-hover text-white font-bold rounded-xl transition-colors shadow-sm text-sm"
        >
          Go to Verification
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
