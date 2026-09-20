<div align="center">
  <img src="assets/image.png" alt="BhuSetu Logo" width="110" />
  <h1>BhuSetu (भू-सेतु)</h1>
  <p><strong>Digital Land Record &amp; Evidence Verification Platform</strong></p>
  <p>
    <em>Instant Document Integrity • Dual-Officer Maker-Checker • Civil Court Injunction Protection • DPDP Act 2023 Compliant</em>
    https://main.dnyzifrukznke.amplifyapp.com/
  </p>
</div>



---

BhuSetu is a digital public platform built for India that lets citizens, revenue officers, and banks instantly check whether a land record document is genuine, without exposing anyone's private personal information.

---

## 1. What Problem Does BhuSetu Solve?

In India, land disputes account for a large portion of civil court cases. Everyday citizens, farmers, and property buyers face several serious challenges:

* **Fake and Altered Documents:** Paper deeds, Pattas, and Record of Rights (RTC/ROR) extracts can be scanned, altered, and reprinted with fake survey numbers or forged signatures.
* **Slow Manual Verification:** To verify whether a document is real, citizens and bank loan officers must physically visit the Tehsil office or Sub-Registrar office, wait weeks, and pay middlemen.
* **Undisclosed Court Disputes:** Buyers often purchase land without knowing that an active civil suit or court stay order already exists on the property.
* **Privacy Risks:** Public portals often expose full names, Aadhaar details, and survey maps, leading to identity theft and unwanted solicitation.

---

## 2. How BhuSetu Solves These Problems

BhuSetu acts as a trusted digital bridge between state revenue records and the public:

1. **Digital Document Fingerprints:** When an official land document is issued by the Revenue Department, the system generates a unique cryptographic fingerprint (SHA-256 hash). Even if a single letter or number is changed in the document, the fingerprint changes completely.
2. **Dual-Officer Approval (Maker-Checker):** No single official can create and approve a record alone. One officer uploads the document (Maker), and a senior officer (Checker) must review and endorse it before it becomes official.
3. **Tamper-Proof Ledger:** Approved records are permanently written to a secure, append-only ledger. Once saved, records cannot be secretly edited, deleted, or backdated by anyone, including database administrators.
4. **Instant 3-Second Public Check:** Anyone can scan a QR code on a deed or type the 12-character verification reference (such as `BHS-2M7D-9KQX`) to see if the document is authentic.
5. **Active Court Dispute Warnings:** If a civil court issues an injunction or stay order, a revenue officer flags the parcel with a dispute hold. The public verification immediately displays a prominent warning to protect potential buyers.
6. **Zero Privacy Leaks:** Personal details like Aadhaar numbers, phone numbers, and full names are never shown on public verification screens. Only the authenticity of the document is verified.

---

## 3. How Different Users Benefit

### For Citizens and Property Buyers
* Verify any land certificate or deed in seconds from your phone before paying advance money.
* See immediately if there is an active dispute or court case on the land.
* Your personal details stay private and safe from identity theft.

### For Tahsildars and Revenue Officers
* Digital work queue for reviewing and approving document submissions.
* Dual-authorization prevents unauthorized edits and protects honest officers from false blame.
* Reduces manual paperwork and long queues at the Tehsil office.
* Simple dispute hold toggles to mark parcels under court litigation.

### For Banks and Lending Officers
* Faster loan processing for home loans and Kisan Credit Cards (KCC).
* Instant verification reduces due diligence time from weeks to seconds.
* Reliable audit trail ensures mortgage documents match government records.

### For Courts and Legal Authorities
* Provides an exact timestamped history of when documents were registered and approved.
* Dispute notices can be linked directly to parcel records to prevent fraudulent secondary sales during active trials.

---

## 4. Compliance with Indian Laws

BhuSetu is specifically designed to operate within India's legal framework:

* **Section 65B of the Information Technology Act, 2000:**
  All verification events and audit logs are recorded with cryptographic timestamps and correlation IDs. This makes the electronic audit log admissible as electronic evidence in Indian courts.
* **Digital Personal Data Protection Act (DPDP Act, 2023):**
  BhuSetu adheres to data minimization. Public verification requires no account creation, collects no personal data from the verifier, and masks all owner details off-chain.
* **State Revenue Primacy:**
  BhuSetu does not claim to create or determine land ownership. The State Revenue Department, Sub-Registrar offices, and Civil Courts remain the sole legal authorities. BhuSetu simply verifies the integrity and authenticity of evidence documents issued by those authorities.

---

## 5. Technology Stack and Architecture

| Technology | Role in BhuSetu | Why It Is Used |
|---|---|---|
| **Next.js (React & TypeScript)** | Frontend & Serverless API Routes | Fast page loads, server-side rendering, and responsive mobile-first UI for citizens and officers. |
| **Vanilla Tailwind CSS** | Styling System | Lightweight, accessible, warm organic design theme that works well on mobile devices. |
| **Amazon DynamoDB** | Fast NoSQL Database | Single-digit millisecond reads for instant public verification. Used for parcels, evidence events, and audit logs. |
| **Amazon S3** | Encrypted Document Storage | Secure off-chain storage for original land documents with server-side encryption. |
| **AWS KMS & IAM** | Security and Key Management | Least-privilege role permissions ensure no unauthorized deletion of audit entries. |
| **Tamper-Proof Ledger (Hyperledger Fabric)** | Immutable Distributed Ledger | Guarantees that evidence records cannot be rewritten or erased by any single party. |
| **Client-Side SHA-256** | In-Browser Document Hashing | The user's document file never leaves their browser during hash verification; only the calculated fingerprint is compared. |

---

## 6. How the Security and Verification System Works

```
[ Citizen or Officer ]
        |
        v  (Uploads PDF or scans QR)
[ In-Browser SHA-256 Fingerprint ]
        |
        v  (Sends hash only, not the document)
[ BhuSetu Verification Engine ]
        |
        +---> Check DynamoDB / Ledger for matching fingerprint
        |
        +---> Check for active Court Dispute Holds
        |
        v
[ Instant Result: Verified / Disputed / Mismatch / Superseded ]
```

* **Why is it safe?**
  The original document never needs to travel over the internet during hash verification. The browser calculates the SHA-256 fingerprint locally and checks if that fingerprint exists in the official government registry.
* **Why can't records be forged?**
  A cryptographic hash is irreversible. It is computationally impossible to create a different document that produces the same 64-character hexadecimal hash.
* **Why can't records be erased?**
  Audit logs and ledger transactions are append-only. The system permissions do not grant `Delete` access to any officer or administrator account.

---

## 7. Project Structure

```
BhuSetu/
├── docs/                             # Architecture, PRD, TRD, UI and compliance specifications
│   ├── INDEX.md                      # Documentation index and pilot assumptions
│   ├── PRD.md                        # Product requirements & user journeys
│   ├── TRD.md                        # AWS architecture & security specs
│   ├── AGENT_RULES.md                # System operating rules
│   ├── UI_RULES.md                   # Organic design system & accessibility rules
│   └── MOST_IMPORTANT_FEATURES_PAGE.md # Verification feature specifications
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Public homepage with search & scan options
│   │   ├── verify/page.tsx           # Instant verification page (QR, code, file upload)
│   │   ├── how-it-works/page.tsx     # Step-by-step citizen guide
│   │   ├── officer/                  # Officer workspace
│   │   │   ├── page.tsx              # Approval queue, submit evidence, dispute holds
│   │   │   ├── audit/page.tsx        # Section 65B compliant audit trail & export
│   │   │   └── parcels/[parcelId]/   # Parcel history and timeline view
│   │   ├── api/v1/                   # REST API routes (parcels, evidence, verify, audit)
│   │   ├── layout.tsx                # App shell, navigation header, and legal footer
│   │   └── globals.css               # Design tokens, fonts, and base styling
│   ├── components/                   # Shared UI components and logos
│   └── lib/                          # Domain logic, AWS clients, RBAC roles, and verification
├── scripts/
│   ├── seed-aws.ts                   # Populates DynamoDB tables with realistic test data
│   └── create-gsi.ts                 # Configures DynamoDB secondary indexes
├── assets/                           # Branding assets and emblem
└── tests/                            # Automated test suite
```

---

## 8. Detailed Documentation & Specifications

Comprehensive specifications are maintained in the [`docs/`](docs/INDEX.md) folder:

| Document | Purpose |
| :--- | :--- |
| **[PRD (Product Requirements)](docs/PRD.md)** | Product vision, user personas, operational scope, and acceptance criteria |
| **[TRD (Technical Requirements)](docs/TRD.md)** | AWS architecture, DynamoDB schemas, KMS/IAM security, and data flow |
| **[Agent Rules](docs/AGENT_RULES.md)** | Non-negotiable operating rules for engineering agents |
| **[UI Rules](docs/UI_RULES.md)** | Sovereign organic design system, typography, accessibility, and privacy rules |
| **[Feature Roadmap](docs/MOST_IMPORTANT_FEATURES_PAGE.md)** | Prioritized feature catalog and verification page specification |
| **[Documentation Index](docs/INDEX.md)** | High-level summary and pilot assumptions |

---

## 9. Getting Started Locally

### Prerequisites
* Node.js 18 or higher
* npm or pnpm
* AWS credentials configured (if running against live AWS resources) or offline local mode

### Installation
1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env.local`:
   ```bash
   AWS_REGION=ap-south-1
   PARCEL_TABLE=bhusetu-parcels
   EVIDENCE_TABLE=bhusetu-evidence
   AUDIT_TABLE=bhusetu-audit
   EVIDENCE_BUCKET=bhusetu-evidence-storage
   ```

3. (Optional) Seed the database with sample records:
   ```bash
   npx tsx scripts/seed-aws.ts
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 10. Running Tests

Run the test suite to verify all verification workflows and domain logic:

```bash
npm test
```

To run a production build check:

```bash
npm run build
```

---

## 11. License and Disclaimer

This software is developed as a digital public infrastructure pilot. State Revenue Departments, Sub-Registrar Offices, and Courts remain the sole legal authorities for property title determination under applicable Indian laws.
