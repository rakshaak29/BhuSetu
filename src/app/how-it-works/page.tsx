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
  UserCheck,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: <Hash className="w-6 h-6 text-[#C18C5D]" />,
    title: "Creating a Digital Fingerprint of Your Document",
    summary: "Every land document (Record of Rights, sale deed, or survey report) gets a unique digital fingerprint the moment it is submitted. Think of it like a thumbprint for your file.",
    detail:
      "This fingerprint is a 64-character code created using SHA-256 technology. If even one character in the document is changed, the fingerprint will be completely different. The original document is never stored publicly. Only the fingerprint is kept, which protects your privacy while still allowing anyone to check if a document is genuine.",
    badge: "Document Safety",
    badgeColor: "text-[#C18C5D] bg-[#C18C5D]/10 border border-[#C18C5D]/30",
    example: {
      label: "Sample Digital Fingerprint",
      value: "a3f9c821e047bcd90f41a2d93...",
    },
  },
  {
    number: "02",
    icon: <Users className="w-6 h-6 text-blue-600" />,
    title: "Two Officers Review Every Document",
    summary:
      "A Registration Officer uploads the document. A Tahsildar or Revenue Inspector (always a different person) reviews and approves or rejects it.",
    detail:
      "The system enforces this rule automatically. If the same person tries to both upload and approve a document, the system will block it with an error. This two-person rule prevents any single officer from tampering with records.",
    badge: "Two-Person Approval",
    badgeColor: "text-blue-700 bg-blue-50 border border-blue-200",
    example: {
      label: "What happens if same person tries to approve",
      value: "Error 403: The person who submitted cannot approve",
    },
  },
  {
    number: "03",
    icon: <GitMerge className="w-6 h-6 text-purple-600" />,
    title: "Multiple Government Departments Confirm the Record",
    summary:
      "After approval, the record is sent to all participating departments on a secure shared record book: Revenue, Registration, and Survey departments must each confirm the entry.",
    detail:
      "Each department independently checks that the record follows all the agreed rules. Only after enough departments have confirmed does the record become permanent. No single government department can change records on its own.",
    badge: "Multi-Department Verification",
    badgeColor: "text-purple-700 bg-purple-50 border border-purple-200",
    example: {
      label: "Confirming Departments",
      value: "Revenue, Registration, Survey",
    },
  },
  {
    number: "04",
    icon: <Database className="w-6 h-6 text-emerald-600" />,
    title: "Record Saved Permanently with a Verification Code",
    summary:
      "Confirmed records are written permanently and cannot be changed. BhuSetu gives each record a short, easy-to-read verification code (like BHS-2M7D-9KQX) that you can use anytime to check it.",
    detail:
      "Once saved, nobody (not even a system administrator) can change or delete a record without breaking the entire chain. The verification code can be printed on physical documents and shown to banks or courts for independent checking.",
    badge: "Permanent Record",
    badgeColor: "text-emerald-700 bg-emerald-50 border border-emerald-200",
    example: {
      label: "Sample Verification Code",
      value: "BHS-2M7D-9KQX",
    },
  },
  {
    number: "05",
    icon: <Search className="w-6 h-6 text-slate-600" />,
    title: "Anyone Can Verify Without Seeing Private Details",
    summary:
      "Any citizen, bank, or court can check a document by entering its verification code or uploading the file. BhuSetu shows a clear result (Verified, Mismatch, or Disputed) without revealing the owner's name or personal details.",
    detail:
      "Land parcel IDs are partially hidden (like AP-XX-...-041) in all results. Private files are never shared. The result is a clean, trustworthy answer that can be used in a bank branch or court filing.",
    badge: "Privacy Protected Verification",
    badgeColor: "text-slate-700 bg-slate-50 border border-slate-200",
    example: {
      label: "How Parcel ID appears publicly",
      value: "AP-XX-...-041",
    },
  },
  {
    number: "06",
    icon: <AlertTriangle className="w-6 h-6 text-status-disputed-text" />,
    title: "Court Cases Immediately Block Verification",
    summary:
      "A District Court officer or Revenue Officer can place a hold on any land parcel at any time. This immediately changes the status to Disputed, no matter how many verified records exist for that parcel.",
    detail:
      "The Disputed status is shown in red on all verification results, warning banks, lawyers, and citizens about an active legal issue. The hold includes a court order reference number. Only an authorized officer can remove the hold, and every change is permanently recorded.",
    badge: "Court Case Protection",
    badgeColor: "text-status-disputed-text bg-status-disputed-bg border border-status-disputed-border",
    example: {
      label: "Sample Court Reference",
      value: "COURT-OS-442-2025",
    },
  },
  {
    number: "07",
    icon: <Eye className="w-6 h-6 text-indigo-600" />,
    title: "Every Action is Recorded and Legally Admissible",
    summary:
      "Every action in the system (login, document check, approval, dispute, or export) is permanently recorded with the officer's ID, role, area, time, and result.",
    detail:
      "This record can be exported as a structured file that is accepted as legal evidence under Section 65B of the IT Act, 2000. Only auditors and admins can view the full record. Each entry has a unique tracking ID to trace any action from start to finish.",
    badge: "Section 65B IT Act 2000",
    badgeColor: "text-indigo-700 bg-indigo-50 border border-indigo-200",
    example: {
      label: "Actions Recorded",
      value: "Approve, Flag Dispute, Export Audit, Public Verify",
    },
  },
];

const principles = [
  {
    icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
    title: "We Verify Documents, Not Ownership",
    body: "BhuSetu checks if a document's digital fingerprint matches an official record. It does not declare legal ownership. The Revenue Office and Courts remain the final authority under Indian law.",
  },
  {
    icon: <Lock className="w-5 h-5 text-[#C18C5D]" />,
    title: "Your Personal Details Stay Private",
    body: "Owner names, Aadhaar numbers, and full parcel IDs are never shown in public results. We only share the minimum information needed to confirm a document is real.",
  },
  {
    icon: <Layers className="w-5 h-5 text-purple-600" />,
    title: "Private Government Network, Not Public Crypto",
    body: "BhuSetu runs on a private network operated by authorized government departments. It is not a public cryptocurrency. Only verified government officers can add records.",
  },
  {
    icon: <Scale className="w-5 h-5 text-blue-600" />,
    title: "Court Cases Always Take Priority",
    body: "Even if a land parcel has 50 verified documents, it will show as Disputed if there is an active court case. Legal status always comes first.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-16">
      {/* Hero */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#5D7052]/10 border border-[#5D7052]/25 rounded-full text-[#5D7052] text-xs font-semibold tracking-wider uppercase">
          <BookOpen className="w-4 h-4 text-[#5D7052]" />
          How It Works
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#2C2C24] tracking-tight leading-[1.15] max-w-3xl mx-auto">
          How BhuSetu Verifies Your Land Documents
        </h1>
        <p className="text-base text-[#78786C] max-w-2xl mx-auto leading-relaxed">
          BhuSetu helps you check if a land document is genuine. It uses digital fingerprinting, a secure shared record book, and a two-person approval system. Here is how every step works, explained in simple language.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <Link
            href="/verify"
            className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-[#C18C5D] hover:bg-[#AF7B4E] active:scale-95 text-white text-xs font-semibold rounded-full transition-all duration-200 shadow-[0_4px_16px_-2px_rgba(193,140,93,0.35)]"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Verify a Document Now</span>
          </Link>
          <Link
            href="/officer"
            className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-[#5D7052] hover:bg-[#4E5E44] active:scale-95 text-[#F3F4F1] text-xs font-semibold rounded-full transition-all duration-200 shadow-soft"
          >
            <UserCheck className="w-4 h-4" />
            <span>Explore Officer Portal</span>
          </Link>
        </div>
      </div>

      {/* Statutory Disclaimer Banner */}
      <div className="flex items-start gap-3.5 bg-[#C18C5D]/10 border border-[#C18C5D]/30 rounded-3xl p-6 shadow-xs">
        <AlertTriangle className="w-5 h-5 text-[#C18C5D] shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-[#2C2C24] leading-relaxed">
          <strong className="text-[#C18C5D] font-bold">Important Legal Notice:</strong> BhuSetu checks if a document's digital fingerprint matches an official record, as per Section 65B of the Information Technology Act, 2000. The official Revenue, Registration, Survey, and Court systems remain the final legal authority. A "Verified" result means the document is genuine at the recorded time. It does not guarantee ownership, freedom from disputes, or boundary accuracy.
        </div>
      </div>

      {/* Step-by-step Process */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C2C24]">The 7-Step Verification Process</h2>
          <p className="text-xs sm:text-sm text-[#78786C]">From document upload to final result, every step is enforced by the system automatically.</p>
        </div>

        <div className="space-y-6">
          {steps.map((step, idx) => (
            <div
              key={step.number}
              className="organic-card rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 relative overflow-hidden shadow-soft hover:shadow-lift transition-all duration-300 border border-[#DED8CF]"
            >
              {/* Step number accent */}
              <div className="absolute top-0 right-0 font-serif text-[84px] font-bold text-[#DED8CF]/40 leading-none select-none pointer-events-none pr-6 pt-2">
                {step.number}
              </div>

              {/* Icon column */}
              <div className="shrink-0 flex sm:flex-col items-center sm:items-center gap-4 sm:gap-3">
                <div className="w-14 h-14 rounded-2xl bg-[#5D7052]/10 border border-[#5D7052]/20 text-[#5D7052] flex items-center justify-center shadow-xs">
                  {step.icon}
                </div>
                {idx < steps.length - 1 && (
                  <div className="hidden sm:block w-px flex-1 bg-[#DED8CF] mt-2" style={{ minHeight: 28 }} />
                )}
              </div>

              {/* Content column */}
              <div className="flex-1 space-y-3 relative z-10">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold px-3 py-0.5 rounded-full border border-[#5D7052]/30 bg-[#5D7052]/10 text-[#5D7052]">
                    {step.badge}
                  </span>
                </div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2C2C24]">{step.title}</h3>
                <p className="text-xs sm:text-sm text-[#4A4A40] leading-relaxed">{step.summary}</p>
                <p className="text-xs text-[#78786C] leading-relaxed">{step.detail}</p>

                {/* Example block */}
                <div className="flex items-center gap-3 bg-[#FDFCF8] rounded-2xl px-4 py-3 border border-[#DED8CF]/80 font-mono text-xs">
                  <span className="text-[#78786C] shrink-0 font-sans text-[11px] font-semibold">{step.example.label}:</span>
                  <code className="text-[#2C2C24] font-bold truncate text-xs">{step.example.value}</code>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Core Design Principles */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C2C24]">Our Core Principles</h2>
          <p className="text-xs sm:text-sm text-[#78786C]">What BhuSetu does and what it does not do.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {principles.map((p) => (
            <div key={p.title} className="organic-card rounded-3xl p-6 space-y-2.5 border border-[#DED8CF] shadow-soft hover:-translate-y-1 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#5D7052]/10 text-[#5D7052] flex items-center justify-center">
                  {p.icon}
                </div>
                <h3 className="font-serif font-bold text-base text-[#2C2C24]">{p.title}</h3>
              </div>
              <p className="text-xs text-[#78786C] leading-relaxed pl-12">{p.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Architecture Snapshot */}
      <div className="bg-[#1F241E] text-[#DED8CF] rounded-3xl p-8 sm:p-10 space-y-6 border border-[#363E34] shadow-soft">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#8FB97C] uppercase tracking-wider mb-1.5">
            <Cpu className="w-4 h-4" />
            Technology Architecture
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#F3F4F1]">Technology Behind BhuSetu</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="bg-[#2A3129] rounded-2xl p-5 border border-[#3D473B] space-y-2">
            <div className="text-[#8FB97C] font-semibold font-sans text-xs">Secure Record Book</div>
            <div className="text-[#F3F4F1] font-bold">Hyperledger Fabric v2.x</div>
            <div className="text-[#A8A399] text-[11px]">Network: Land Records Pilot</div>
            <div className="text-[#A8A399] text-[11px]">Departments: Revenue, Registration, Survey</div>
          </div>
          <div className="bg-[#2A3129] rounded-2xl p-5 border border-[#3D473B] space-y-2">
            <div className="text-[#E0A97D] font-semibold font-sans text-xs">Data Storage</div>
            <div className="text-[#F3F4F1] font-bold">AWS DynamoDB</div>
            <div className="text-[#A8A399] text-[11px]">Tables: parcels, evidence, audit</div>
            <div className="text-[#A8A399] text-[11px]">Files: AWS S3 (encrypted)</div>
          </div>
          <div className="bg-[#2A3129] rounded-2xl p-5 border border-[#3D473B] space-y-2">
            <div className="text-[#E6DCCD] font-semibold font-sans text-xs">Website Platform</div>
            <div className="text-[#F3F4F1] font-bold">Next.js 15</div>
            <div className="text-[#A8A399] text-[11px]">Hosted on AWS</div>
            <div className="text-[#A8A399] text-[11px]">Secure REST API with role-based access</div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center space-y-4 py-4">
        <h2 className="font-serif text-2xl font-bold text-[#2C2C24]">Ready to verify a document?</h2>
        <p className="text-xs sm:text-sm text-[#78786C]">Enter your verification code or upload a document to check it now.</p>
        <Link
          href="/verify"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#C18C5D] hover:bg-[#AF7B4E] active:scale-95 text-white font-semibold rounded-full transition-all duration-200 shadow-[0_4px_16px_-2px_rgba(193,140,93,0.35)] text-xs sm:text-sm"
        >
          <span>Go to Verification</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
