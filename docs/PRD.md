# Product Requirements Document: BhuSetu

| Field | Value |
| --- | --- |
| Product | BhuSetu: Blockchain-Based Land Ownership Verification |
| Status | Draft v0.1 |
| Target release | District pilot |
| Primary market | State/UT land-administration ecosystem in India |
| Product owner | To be assigned with the pilot State/UT |

## 1. Product summary

BhuSetu enables an authorized official, citizen, lender, or auditor to verify whether a presented land-record evidence bundle matches an approved, cryptographically protected record. The platform hashes approved evidence, stores the documents securely off-chain, and records a linked, append-only event on a permissioned ledger.

The product **does not decide legal title**. A State/UT's official Revenue, Registration, Survey/Settlement, and Court sources remain authoritative. A verified result means that the evidence matches the version approved by an authorized source at the recorded time; it is not a legal opinion or a conclusive-title certificate unless the competent government authority explicitly issues one.

## 2. Problem

Land disputes and fraud can be enabled by forged, altered, stale, or inconsistently sourced deeds, RoR extracts, mutation records, and cadastral maps. Verifiers often lack a simple way to determine whether a document is authentic, whether it corresponds to the correct parcel, or whether it has been superseded or put under dispute.

## 3. Opportunity and product vision

Create a trusted verification layer that connects to existing land-record systems, makes evidence tampering detectable, preserves a reviewable event history, and gives citizens a simple way to check a document without exposing personal information.

**Vision:** Every approved land-record evidence bundle has a verifiable digital fingerprint, a clear official provenance trail, and an understandable current status.

## 4. Goals

1. Detect altered documents with deterministic hash verification.
2. Link evidence to the correct State parcel identifier and, where available, ULPIN.
3. Create an append-only history for issuance, mutation, dispute, correction, and supersession events.
4. Give authorized staff a controlled workflow for record approval and status changes.
5. Provide a public verification experience through a QR code or reference number with minimal personal-data disclosure.
6. Make every access, decision, integration call, and ledger action auditable.
7. Deliver a cloud pilot that fits a low-cost, serverless AWS operating model.

## 5. Non-goals

- Replacing State/UT land-registry, registration, cadastral, or judicial systems.
- Determining ownership by AI, heuristic, or blockchain consensus alone.
- Publishing owner PII, documents, coordinates, or parcel boundaries to a public blockchain.
- Automating transfer or mutation without an authorized government workflow.
- Supporting every Indian State/UT in the first pilot.
- Tokenizing land, creating NFTs, enabling cryptocurrency payments, or supporting speculative trading.

## 6. Pilot scope

### In scope

- One State/UT, one district/tehsil, and 200–500 test or authorized pilot parcels.
- Read-only ingestion from one approved Revenue/Registration export or API.
- RoR extract, registered-deed reference, mutation reference, and cadastral-map evidence where available.
- QR/reference-based verification.
- Officer approval, correction, supersession, and dispute-hold workflows.
- Role-based access, signed audit events, and monitoring.
- Local Fabric proof of concept with three simulated organizations: Revenue, Registration, and Survey.

### Out of scope for the pilot

- Live automatic write-back to government systems.
- Nationwide search.
- Court-case adjudication.
- Aadhaar authentication or storage.
- Production public-blockchain anchoring unless separately approved.

## 7. Users and roles

| Role | Primary need | Core permissions |
| --- | --- | --- |
| Citizen / document holder | Check whether a document/reference is authentic | Public, privacy-minimized verification only |
| Bank / institutional verifier | Assess document integrity before due diligence | Verification plus permitted evidence view |
| Registration officer | Submit approved registration/mutation evidence | Create pending event; attach signed source evidence |
| Revenue officer | Approve RoR/mutation state | Approve, supersede, or correct records within jurisdiction |
| Survey officer | Validate parcel/map linkage | Add or validate cadastral-map evidence |
| Court / dispute liaison | Prevent unsafe reliance during an active matter | Apply or resolve a dispute hold using authorized references |
| Auditor | Reconstruct record history and actor trail | Read immutable history and audit export |
| Platform administrator | Operate platform safely | Manage users/configuration; no unilateral title-status approval |

## 8. Status model

| Status | Meaning | Public response |
| --- | --- | --- |
| Verified | Presented evidence hash matches an active, authorized record | “Evidence verified; see source and timestamp.” |
| Mismatch | Presented evidence does not match the approved version | “Evidence could not be verified. Do not rely on it.” |
| Pending review | An authorized workflow is incomplete | “Verification is pending official review.” |
| Disputed | An authorized dispute/court/revenue hold exists | “Record is subject to a dispute/hold. Seek the competent authority.” |
| Superseded | A newer authorized record replaced this version | “This version is not current; view the latest authorized reference.” |
| Unavailable | No permitted result can be returned | “No verifiable record is available for this request.” |

`Verified` must never be rendered as `owner confirmed`, `legally clear`, `free of encumbrance`, or `conclusive title` without an explicit legal authorization and data source for that conclusion.

## 9. Key journeys

### 9.1 Citizen verifies a document

1. Citizen scans the QR code or enters a verification reference.
2. Platform asks for the document upload only when hash verification is required.
3. Platform calculates the document fingerprint and looks up the authorized evidence event.
4. Platform shows status, issuing authority, issue timestamp, parcel reference, and safe next step.
5. The result omits PII and document images unless the user is separately authorized.

### 9.2 Officer adds an approved record

1. Officer signs in through the approved identity provider.
2. Officer selects a parcel and evidence type, attaches the approved source record, and enters the source-system reference.
3. Platform validates required fields and calculates file hashes.
4. A designated approver approves or rejects the event.
5. On approval, the evidence is encrypted off-chain and a ledger event is committed.
6. The platform issues a verifiable reference/QR code and records a complete audit trail.

### 9.3 Officer corrects or disputes a record

1. Officer locates the active record.
2. Officer selects `correction`, `supersession`, or `dispute hold`; a reason and authoritative reference are mandatory.
3. The system creates a new linked event. It never deletes or edits the historical event.
4. Public verification immediately reflects the safe status.

## 10. Functional requirements

| ID | Priority | Requirement | Acceptance criterion |
| --- | --- | --- | --- |
| FR-01 | P0 | Search by State parcel ID, ULPIN where available, or verification reference. | Authorized search returns the matching record or a safe unavailable response. |
| FR-02 | P0 | Hash uploaded evidence using SHA-256 and compare it to the approved evidence hash. | A one-byte file alteration produces `Mismatch`. |
| FR-03 | P0 | Store originals and derived evidence only in encrypted private storage. | No document object is publicly accessible. |
| FR-04 | P0 | Commit approved lifecycle events to a permissioned append-only ledger. | History shows a hash-linked, signed event sequence. |
| FR-05 | P0 | Require maker-checker approval for new, corrected, and superseding events. | A creator cannot approve their own event. |
| FR-06 | P0 | Support `Verified`, `Pending review`, `Disputed`, `Superseded`, `Mismatch`, and `Unavailable` results. | Each result has prescribed copy and a safe next action. |
| FR-07 | P0 | Generate a unique verification reference and printable/scannable QR code after approval. | QR resolves only to a privacy-minimized verification route. |
| FR-08 | P0 | Maintain an immutable, exportable audit trail of logins, reads, writes, approvals, and integration calls. | Auditor can filter and export events for a parcel/time range. |
| FR-09 | P0 | Enforce jurisdiction- and role-based authorization. | Users cannot see or act outside assigned State/district/tehsil scope. |
| FR-10 | P1 | Ingest evidence from an approved State-system export/API with idempotency and reconciliation. | Replaying the same source event does not create a duplicate record. |
| FR-11 | P1 | Show parcel/map linkage and evidence provenance. | UI shows the source system, reference, issue date, and map availability. |
| FR-12 | P1 | Send secure task notifications for approvals, failed ingestions, and dispute changes. | Delivery failures retry and are visible to an operator. |
| FR-13 | P2 | Offer multilingual support, beginning with English and the pilot State language. | All public status and error content is localized. |
| FR-14 | P2 | Anchor aggregated ledger roots to an independently controlled network. | Design and legal approval are completed before any production anchor. |

## 11. Quality attributes

| Attribute | Target for pilot |
| --- | --- |
| Availability | 99.5% monthly for the public verification API, excluding approved maintenance. |
| Verification latency | 95% of reference-only checks complete within 3 seconds; file checks within 10 seconds for supported sizes. |
| Integrity | Every evidence file has a stored SHA-256 hash, source reference, approver, and ledger-event reference. |
| Accessibility | WCAG 2.2 AA for public and officer interfaces. |
| Privacy | Public response discloses no owner PII by default. |
| Auditability | All state changes and privileged reads have actor, time, reason, correlation ID, and result. |
| Recoverability | Restore approved off-chain evidence and event index using tested backup procedures. |

## 12. Success metrics

| Metric | Pilot target |
| --- | --- |
| Evidence-hash verification accuracy | 100% for the controlled test suite |
| Unauthorized state changes | 0 |
| Tampered-document detection | 100% in acceptance tests |
| Median public verification time | Under 3 seconds for reference-only verification |
| Audit-history completeness | 100% of approved events traceable to source and approver |
| Reconciliation success | At least 98% of pilot source events reconcile or enter an explicit exception queue |
| Staff usability | At least 80% task-completion rate in observed pilot training |

## 13. Dependencies and constraints

- Written pilot agreement with the State/UT department and designated data steward.
- Approved legal wording for public status messages.
- Authoritative IDs, data dictionary, source-event contract, and correction/dispute protocol.
- Government-approved identity/SSO integration or a pilot Cognito tenancy.
- Security assessment before any non-synthetic PII is processed.
- Defined data retention, archival, and right-to-access process.
- Funding/governance commitment before operating a multi-organization production blockchain network.

## 14. Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Blockchain is mistaken for legal title | Persistent product copy, officer training, and immutable status rules. |
| Bad source data becomes permanently trusted | Keep source-system references, maker-checker approval, correction events, and reconciliation queues. |
| PII disclosure through public verification | Hash/reference-only public experience, masked fields, strict authorization, and private storage. |
| A dispute is missed | Require authoritative dispute feeds/manual holds, expiring review tasks, and conservative status display. |
| Cloud budget is exhausted | Serverless architecture, alerts, resource tags, and automatic non-production shutdown. |
| Consortium members disagree on operations | Governance charter, voting/approval model, key-management rules, and exit procedures before production. |

## 15. Release milestones

1. **Design approval:** PRD, data dictionary, pilot charter, legal copy, and threat model approved.
2. **Local proof of concept:** Fabric chaincode and synthetic evidence verification demonstrated.
3. **AWS alpha:** serverless portal and officer workflow deployed with synthetic data.
4. **Controlled pilot:** authorized read-only integration and staff training completed.
5. **Pilot review:** security, accuracy, cost, usability, and governance findings approved for next phase.
