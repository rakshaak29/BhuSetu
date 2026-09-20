# UI Rules: BhuSetu

## 1. Purpose

These rules make BhuSetu safe, understandable, accessible, and appropriate for land-record verification. The interface must communicate evidence integrity and official provenance without overstating legal meaning.

## 2. Core UI principles

1. **Status before detail:** show the verification status, its meaning, and the next safe action before document or parcel details.
2. **Never imply title:** do not use labels such as “owner verified,” “title clear,” “fraud-free,” or “legal owner” unless the competent authority explicitly supplies that conclusion and its legal basis.
3. **Privacy by default:** public screens reveal the minimum needed to verify; PII is masked unless authorization is proven.
4. **Evidence, not magic:** explain what was checked (reference, issuing authority, time, document hash) instead of vague claims that “blockchain guarantees” anything.
5. **Mobile-first, low-bandwidth:** critical verification works on a small phone screen, with text alternatives for QR scanning and minimal downloads.
6. **Accessible by design:** conform to WCAG 2.2 AA; never use color, icons, or a QR code as the sole carrier of meaning.
7. **Safe failure:** ambiguity, unavailable sources, and disputes receive clear non-positive results and escalation guidance.

## 3. Navigation and information architecture

### Public navigation

- Verify document
- Verify reference / scan QR
- How verification works
- Get help / contact issuing authority
- Language selector

Public navigation must not expose officer tools, audit history, private search, or administration.

### Authorized navigation

- Verification queue
- Parcels
- Evidence submissions
- Approvals
- Disputes and exceptions
- Integrations
- Audit trail
- Administration

Only show a navigation item when the signed-in role has access. Hiding an item never replaces server-side authorization.

## 4. Status presentation

Every result uses a text label, icon, concise explanation, timestamp, and next step. Never depend on color alone.

| Status | Visual treatment | Required content |
| --- | --- | --- |
| Verified | Success icon and restrained positive color | “Evidence matches an authorized record”; issue time; authority; title disclaimer. |
| Mismatch | Warning/error icon | “Evidence could not be verified”; no inferred reason; authority contact action. |
| Pending review | Neutral clock icon | “Official review is pending”; reference and expected contact path. |
| Disputed | High-attention warning icon | “Subject to an authorized dispute/hold”; do-not-rely instruction. |
| Superseded | Neutral history icon | “A newer authorized record exists”; link only if permitted. |
| Unavailable | Neutral information icon | “No verifiable result available”; retry/contact option. |

### Required status disclaimer

For every public `Verified` result, show:

> This result confirms an evidence match to an authorized record at the time shown. It is not, by itself, a determination of legal title, ownership, encumbrance, or boundary.

## 5. Page rules

### 5.1 Verification page

- Put `Scan QR`, `Enter reference`, and `Upload document` in one clear primary area.
- State accepted file types, maximum size, and that the upload is used for integrity verification.
- Explain that users should not upload Aadhaar, identity documents, or unrelated personal material.
- Display result above the fold once verification completes.
- Provide a copyable verification reference and result timestamp.
- Do not show raw hash values to general public users; authorized users may reveal/copy them in a separate details panel.

### 5.2 Parcel details page

- Start with current status, State parcel reference, ULPIN if authorized/available, and latest authoritative event.
- Keep owner/occupant PII masked by default.
- Separate `Current record`, `Evidence`, `History`, `Map`, and `Audit` into clear sections/tabs.
- Preserve event chronology; do not hide a dispute or supersession behind a collapsed detail section.
- Maps must not reveal restricted boundaries/location data to public users.

### 5.3 Officer submission page

- Use a stepper: Parcel → Evidence → Source reference → Review → Submit.
- Clearly mark required fields and validation errors beside the field.
- Display maker identity, jurisdiction, and source-system reference before submission.
- Show the generated document hash only after the platform completes it; it must be copyable for authorized staff.
- Warn that submission creates a pending record, not an approved record.

### 5.4 Approval page

- Show maker, source reference, evidence hash, previous/current status, jurisdiction, and required reason.
- Show a prominent conflict if maker and checker are the same person; disable approval.
- Require an explicit decision and reason for rejection/correction/dispute/supersession.
- Offer document preview/download only after authorization and log the access.
- Never place `Approve` beside a destructive action without a confirmation summary.

### 5.5 History and audit page

- Use a chronological timeline with event type, status, authority, time, source reference, and linkage to preceding event.
- Clearly distinguish `system time`, `source event time`, and `approval time`.
- Do not edit the visual history in place; corrections appear as new linked events.
- Keep audit exports role-restricted and visibly record the export request.

## 6. Content and tone

### Use

- “Evidence matches an authorized record.”
- “Record is subject to an authorized dispute/hold.”
- “Contact the issuing Revenue/Registration authority.”
- “This version has been superseded.”
- “We could not verify this evidence.”

### Do not use

- “You are the legal owner.”
- “Blockchain proves ownership.”
- “Fraud detected” unless an authorized fraud process has made that determination.
- “Clear title” or “encumbrance-free” without the exact authoritative source and authorization.
- “Permanent” or “unchangeable” for the legal record; history is immutable, but official records can be corrected through new events.

## 7. Form and validation rules

- Prefer reference/QR verification before requesting a document upload.
- Label formats and examples without using real personal/parcel data.
- Validate early but do not block paste, screen readers, or keyboard navigation.
- Preserve entered non-sensitive data after a recoverable error.
- Mask sensitive values by default; provide a timed, authorized reveal control where genuinely necessary.
- State the purpose of every data collection field.
- Error messages identify the issue and resolution without exposing internal system details.

## 8. Accessibility rules

- Meet WCAG 2.2 AA contrast and keyboard-navigation requirements.
- Use semantic headings, labels, fieldsets, landmarks, and native controls.
- Provide descriptive text alternatives for all icons and QR scanner states.
- Announce verification completion and critical status changes through an accessible live region.
- Do not auto-start camera access; request permission and provide manual reference entry.
- Ensure focus moves to the result/status heading after a verification completes.
- Keep target sizes comfortable for touch and support browser zoom up to 200% without clipped content.
- Do not use CAPTCHA that excludes screen-reader or low-connectivity users without an accessible alternative.

## 9. Localization and inclusivity

- Start with English and the pilot State's official working language(s).
- Translate legal-safe status strings as approved content; do not machine-translate them at runtime without review.
- Support local date presentation while retaining a visible source timestamp and a clear time zone where needed.
- Use plain-language explanations and avoid unexplained technical terms such as hash, ledger, chaincode, or ULPIN; add inline help when required.

## 10. Security and privacy in the interface

- Never include PII, private object paths, access tokens, raw source payloads, or secrets in URLs, client logs, screenshots, or error screens.
- Verification references must be high-entropy and rate-limited; display no sequential internal ID.
- Public QR payloads contain only a verification reference/URL, never owner or parcel data.
- Show recent sign-in/privileged-action context to officers where appropriate.
- Require re-authentication for sensitive export, role change, and break-glass flows.
- Inform users when a download, preview, export, or share action is auditable.

## 11. Visual design rules

- Use a calm, government-service-oriented visual language: clear type, high contrast, restrained color, generous spacing, and no cryptocurrency or speculative-finance imagery.
- Treat green/success as “evidence matches,” not “legal ownership.”
- Use an amber/red warning treatment for `Disputed` and `Mismatch`, paired with plain-language explanation.
- Display authority seals/logos only after written permission and with a text alternative.
- Use a clear hierarchy: page title → verification status → next action → evidence summary → details.
- Avoid decorative blockchain animations, maps that imply legal boundaries, and progress states that imply consensus is a legal decision.

## 12. Empty, error, and offline states

| Situation | UI behavior |
| --- | --- |
| No results | Say no permitted/verifiable result is available; provide contact path. |
| Source temporarily unavailable | Show `Unavailable`, timestamp, and retry guidance; do not use cached data as current without labelling it. |
| Invalid/expired QR | Explain the code cannot be verified and offer manual entry/support. |
| Unsupported document | State allowed format/size and never upload the unsupported file. |
| File hash mismatch | Show `Mismatch`; do not reveal another record’s data. |
| Unauthorized request | Use a generic access-denied message; do not disclose whether records exist. |
| Low connectivity | Preserve form data locally only if approved; offer a text/reference path with minimal assets. |

## 13. UI acceptance checklist

- [ ] Every status is understandable without color, icon, QR, or technical knowledge.
- [ ] Public `Verified` includes the title disclaimer.
- [ ] Public views reveal no owner PII or private document.
- [ ] Verification supports QR and manual reference paths.
- [ ] All privileged actions visibly show required approver/reason context.
- [ ] Maker cannot approve their own submission.
- [ ] Dispute and supersession states are visible in current status and history.
- [ ] Keyboard, screen reader, mobile, zoom, and low-bandwidth flows are tested.
- [ ] Error states are safe, actionable, and do not leak internals.
