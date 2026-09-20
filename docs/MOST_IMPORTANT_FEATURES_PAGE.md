# Most Important Features Page: BhuSetu

## Purpose

This page prioritizes the features required for a safe district pilot and defines the product's most important user-facing screen: **Verify Land Record**.

## 1. Feature priority

### P0: Required for a credible pilot

| Feature | User value | Acceptance signal |
| --- | --- | --- |
| QR/reference verification | Anyone can check whether an issued reference maps to an authorized, current evidence event. | Returns a safe status in under 3 seconds for reference-only checks. |
| Document hash verification | Detects altered/forged copies of authorized documents. | Any byte change returns `Mismatch`. |
| Authoritative provenance | Shows issuing department/source reference and issue time. | Every verified result traces to approved source metadata. |
| Private off-chain evidence | Keeps documents/PII protected while retaining verifiable integrity. | Public users cannot access source files or PII. |
| Permissioned event ledger | Preserves evidence lifecycle history across official organizations. | Approved events are append-only and hash-linked. |
| Maker-checker workflow | Prevents one person from unilaterally validating a record. | Creator cannot approve own submission. |
| Dispute and supersession control | Prevents a misleading positive result where a case or newer record exists. | `Disputed`/`Superseded` always override `Verified`. |
| Role/jurisdiction access | Limits records and actions to appropriate authority. | Unauthorized access is denied and audited. |
| Audit timeline/export | Lets an auditor reconstruct a record’s provenance and system actions. | History includes actor, authority, time, source, event, and result. |

### P1: Important after P0 is proven

| Feature | Why it matters |
| --- | --- |
| Approved State-system API/export integration | Reduces manual error and improves currency of source data. |
| ULPIN and cadastral-map linkage | Improves parcel identity matching and spatial context. |
| Officer exception queue | Handles unmatched, stale, duplicate, or conflicting source events safely. |
| Multilingual public experience | Enables equitable use in the pilot State. |
| Notification workflow | Makes approvals, failed integrations, and dispute holds actionable. |
| Bank/verifier restricted workspace | Supports legitimate due diligence without broad data exposure. |

### P2: Scale and optimization

| Feature | Why it is deferred |
| --- | --- |
| Aggregated external-chain anchoring | Needs policy, governance, cost, and legal approval. |
| OCR-assisted intake | Must not be mistaken for evidence verification; requires quality/security review. |
| Cross-State verification | Needs consistent data contracts and intergovernmental governance. |
| Advanced analytics | Avoid until privacy, bias, and lawful-purpose controls are mature. |
| Native mobile app | Responsive web/PWA validates demand first. |

## 2. Critical page specification: Verify Land Record

### User goal

“I have a land-related document or reference. I need to know whether its evidence matches an authorized record and what safe action to take next.”

### Primary users

- Citizen/document holder
- Bank or institutional verifier with authorized access
- Revenue/Registration officer checking a document in the field

### Entry points

- Scan a QR code on an issued document.
- Open a secure verification link.
- Enter a verification reference manually.
- Upload a permitted document to compare its hash.

### Page layout

```text
┌─────────────────────────────────────────────────────────┐
│ BhuSetu                         Language | Help          │
├─────────────────────────────────────────────────────────┤
│ Verify land-record evidence                              │
│ Check an issued reference or compare an approved file.   │
│                                                         │
│ [ Scan QR ]   [ Enter reference ]   [ Upload document ] │
│                                                         │
│ Reference: [____________________]  [ Verify ]           │
│                                                         │
│ Privacy note: Do not upload Aadhaar or unrelated IDs.   │
├─────────────────────────────────────────────────────────┤
│ RESULT                                                   │
│ [icon] Evidence verified                                 │
│ Evidence matches an authorized record issued on …        │
│ Issuing authority: …                                     │
│ Parcel reference: …masked…                               │
│ Verification reference: BHS-…       [Copy]               │
│                                                         │
│ This is not a legal title determination.                 │
│ [How verification works] [Contact issuing authority]     │
├─────────────────────────────────────────────────────────┤
│ What was checked                                         │
│ • Reference / document fingerprint                       │
│ • Authorized source and event timestamp                  │
│ • Current dispute/supersession status                    │
└─────────────────────────────────────────────────────────┘
```

### Page states

| State | Required behavior |
| --- | --- |
| Initial | Offer three equal, understandable verification paths; no data is prefilled from the URL except a high-entropy reference. |
| Scanning | Request camera permission only after user action; show manual entry fallback. |
| Uploading | Show file type/size, progress, cancellation, and privacy notice; do not retain unsupported files. |
| Processing | Say what is occurring: “Checking document fingerprint and authorized record.” Do not imply a legal decision. |
| Verified | Show safe positive result, source/time, masked parcel reference, disclaimer, and next actions. |
| Mismatch | Show a clear non-positive result; do not reveal any matching record’s private details. |
| Disputed | Prominently show hold status and an authority contact path; no positive indicators. |
| Superseded | State a newer authorized record exists; only reveal it if the viewer is authorized. |
| Unavailable | Explain that a check cannot be completed; offer retry/reference/contact path. |

### Required interaction rules

1. `Verify` stays disabled until a syntactically valid reference exists, but field-level help remains visible.
2. Pressing Enter triggers the same validation and verification request as the button.
3. On completion, focus moves to the result heading and screen readers announce the status.
4. The user can copy the verification reference but cannot copy hidden PII through the public view.
5. QR scan failure provides a manual-reference field immediately; no dead end.
6. `Contact issuing authority` uses an approved State/UT directory; it must not expose a staff member’s personal contact details.
7. No result may be cached in the browser as a persistent record unless security/privacy policy explicitly allows it.

### Result content contract

| Field | Public | Authorized verifier | Officer/auditor |
| --- | --- | --- | --- |
| Status and safe explanation | Yes | Yes | Yes |
| Issuing authority | Yes, when approved | Yes | Yes |
| Issue timestamp | Yes | Yes | Yes |
| Masked parcel reference | Yes | Yes | Yes |
| Full parcel ID / ULPIN | No by default | Policy controlled | Yes, jurisdiction controlled |
| Owner PII | No | Only justified and authorized | Policy controlled |
| Source document | No | Restricted, logged | Restricted, logged |
| Hash and ledger transaction details | No | If needed for due diligence | Yes |
| Audit history | No | No | Yes, role controlled |

## 3. Officer MVP pages

| Page | P0 function |
| --- | --- |
| Verification queue | Work pending document/reference checks and exceptions. |
| Submit evidence | Upload approved evidence and create a pending event. |
| Approval review | Maker-checker review with source, hash, status, and reason. |
| Parcel timeline | View current state, prior events, disputes, and supersessions. |
| Dispute hold | Add an authoritative hold/reference and block positive verification. |
| Audit lookup | Filter actions by parcel, actor, date, status, and correlation ID. |

## 4. Pilot demo script

1. Search a synthetic parcel by reference and show a `Verified` result.
2. Upload the original approved document and demonstrate a hash match.
3. Alter one character in a copy and demonstrate `Mismatch`.
4. Sign in as a Registration maker and submit a mutation event.
5. Sign in as a distinct Revenue checker and approve it.
6. Show the new event on the immutable parcel timeline.
7. Apply a dispute hold and show that public verification no longer returns a positive result.
8. Export the corresponding authorized audit history.

## 5. Definition of done for P0

- [ ] All P0 features in this document meet their acceptance signals.
- [ ] Public results contain no owner PII or private evidence links.
- [ ] Hash mismatch, dispute, and supersession are exercised in UAT.
- [ ] Maker-checker separation is enforced server-side.
- [ ] Audit history is complete for the demo flow.
- [ ] Security, accessibility, and low-bandwidth checks pass.
- [ ] AWS budget alarms and environment shutdown/deprovision procedures are tested.
- [ ] Pilot State/UT stakeholders approve status wording and escalation contacts.
