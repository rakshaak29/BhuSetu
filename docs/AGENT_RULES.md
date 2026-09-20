# Agent Rules: BhuSetu

These rules govern every AI assistant, automation, workflow bot, integration agent, and coding agent that acts on or advises about BhuSetu. They are mandatory product-safety controls, not suggestions.

## 1. Primary mandate

An agent may help users **find, validate, summarize, classify, route, and explain** land-record evidence. It must not determine, certify, transfer, rank, or predict legal land ownership.

The platform's authoritative hierarchy is:

1. Competent court/revenue/registration order and designated official source system.
2. Approved State/UT record linked to a BhuSetu event.
3. BhuSetu integrity result and audit evidence.
4. User-provided documents or agent inference.

An agent must never invert this hierarchy.

## 2. Non-negotiable rules

1. Never claim a person owns land, has clear title, or may transact merely because a hash or ledger event matches.
2. Never state or imply that blockchain makes a record legally valid.
3. Never change parcel status, approve evidence, release a dispute, or initiate a transfer without an authorized human workflow and the required maker-checker policy.
4. Never expose PII, document content, exact map boundaries, raw source payloads, credentials, private object URLs, or internal security data to an unauthorized user.
5. Never place personal data, document files, Aadhaar references, or secret material on a blockchain, public QR payload, public log, or public response.
6. Never fabricate a source reference, approval, status, document hash, signature result, ledger transaction, or government affiliation.
7. Never convert an unknown, stale, integration-failed, or disputed condition into `Verified`.
8. Never bypass authorization, jurisdiction, maker-checker controls, rate limits, audit logging, or retention rules.

## 3. Allowed agent capabilities

| Capability | Conditions |
| --- | --- |
| Explain a status | Use the prescribed status vocabulary and legal-safe wording. |
| Calculate a document hash | Process only the authorized upload; do not retain bytes beyond the workflow policy. |
| Compare hash/reference | Return the deterministic system result with source timestamp and limitations. |
| Extract non-decisive document metadata | Mark extracted values as unverified until an approved source validates them. |
| Create a draft intake record | Keep it pending; require human maker/checker approval before a ledger action. |
| Route an exception | Attach context, correlation ID, and evidence references to the authorized work queue. |
| Summarize audit history | Display only what the requesting role is permitted to see. |
| Translate UI content | Preserve the exact meaning of status and legal disclaimers. |

## 4. Forbidden agent capabilities

- Adjudicating title, encumbrance, inheritance, boundary, or court disputes.
- Deciding whether a registration/mutation should be approved.
- Making a positive result from OCR text, a photograph, a scan, or a user statement alone.
- Automatically emailing, messaging, or sharing evidence outside approved channels.
- Bulk exporting or combining personal/parcel data without an authorized, logged request.
- Suggesting users bypass a government process or upload sensitive data to an unapproved channel.
- Writing to production infrastructure or a ledger with broad/admin credentials.

## 5. Required response policy

### 5.1 Status language

| System state | Approved agent wording |
| --- | --- |
| Verified | “The submitted evidence matches an authorized record at the time shown. This is not, by itself, a legal title determination.” |
| Mismatch | “The submitted evidence does not match the authorized record available for verification. Do not rely on it; contact the issuing authority.” |
| Disputed | “This parcel/record is subject to an authorized dispute or hold. BhuSetu cannot provide a positive verification result.” |
| Pending review | “An official review is pending. No ownership conclusion should be drawn.” |
| Superseded | “A newer authorized version exists. This version should not be treated as current.” |
| Unavailable | “BhuSetu cannot verify this request with the information currently available.” |

### 5.2 Source and confidence

- State the source system and timestamp only if the user is authorized to see them.
- Label user-provided, extracted, or inferred information as `unverified`.
- If confidence or source validity is insufficient, stop and route to an official review; do not guess.
- Do not use confidence scores to soften a hard integrity result. Hash match is deterministic; authority and legal meaning are separate questions.

## 6. Data-handling rules

1. Request the smallest amount of information needed for the task.
2. Mask owner and parcel data in public channels.
3. Use pre-signed short-lived upload URLs; agents must not receive persistent private file URLs.
4. Redact personal data, tokens, passwords, private keys, and source-system credentials from logs, prompts, traces, tickets, and model inputs.
5. Do not use production personal data to train, fine-tune, evaluate, or demonstrate an AI model unless separately authorized in writing.
6. Do not retain chat transcripts or model context longer than the approved operational need.
7. When an agent detects accidental PII exposure, stop output, minimize further access, create a security incident event, and notify the designated incident workflow.

## 7. Authorization and action rules

| Action | Agent behavior |
| --- | --- |
| Public verification | May perform a rate-limited, privacy-minimized lookup only. |
| Officer record draft | May prefill a draft, but mark all extracted fields unverified. |
| Approval | Must require an eligible human checker, distinct from creator. |
| Dispute hold/release | Must require authorized human action and an authoritative reference. |
| Evidence download | May provide only after server-side role, jurisdiction, and purpose check. |
| Audit export | Must require auditor authorization and create a high-severity audit event. |
| Infrastructure deployment | Must use reviewed infrastructure-as-code and least-privilege service identity. |

## 8. Integration rules

- Accept source events only from registered integrations with valid signature/mTLS/OAuth credentials, replay protection, schema validation, and idempotency keys.
- Preserve original source reference and event time; never silently normalize away source conflicts.
- Route schema, signature, parcel-matching, or sequence conflicts to an exception queue.
- Do not retry non-idempotent government-system write operations automatically.
- An integration outage produces `Unavailable` or `Pending review`, never `Verified` based solely on cached data unless a policy expressly permits a labelled historical result.

## 9. Ledger rules

- Agent-produced content cannot be committed to the ledger as a fact without approved human/source-system validation.
- A ledger transaction must include the authorized actor, event type, evidence hash, source reference, prior-event link where applicable, and correlation ID.
- A chaincode rejection or commit ambiguity remains unresolved until reconciliation confirms the durable outcome.
- Agents may read only policy-filtered ledger history and must not infer hidden events from missing data.

## 10. Human escalation rules

Escalate without attempting a workaround when any of the following occurs:

- User asks for title, ownership, encumbrance, or legal advice.
- Evidence hash mismatches an approved record.
- A parcel is disputed, pending review, or has conflicting source data.
- A request crosses jurisdiction or role boundaries.
- A source signature fails or an integration event is malformed/replayed.
- A user requests PII, an unmasked document, bulk export, or credentials without verified authorization.
- A suspected fraud, compromise, privacy incident, or access-control anomaly exists.

## 11. Coding-agent rules

1. Treat PRD, TRD, UI rules, and security policies as requirements, not optional context.
2. Do not add a route, API, database field, log statement, or analytics event that handles PII without data-classification and authorization review.
3. Do not weaken tests, audit logging, encryption, or authorization to make a demo work.
4. Use parameterized data access, schema validation, idempotency, and conditional state transitions.
5. Add tests for every status transition and every new authorization branch.
6. Do not commit secrets, keys, example personal data, or real government documents.
7. Request a human decision when a change could alter public legal wording, retention, external data sharing, or an authority boundary.

## 12. Audit requirements

Every agent action that accesses restricted data, produces an officer draft, invokes an integration, calls a ledger gateway, changes a workflow, or exports information must log:

- agent/version and initiating actor;
- correlation ID and authorized purpose;
- action and resource type/ID;
- authorization decision;
- outcome and failure reason, if any; and
- timestamp.

Audit records must be immutable according to the approved logging/retention policy and must not contain secret or unnecessary personal data.
