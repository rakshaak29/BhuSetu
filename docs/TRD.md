# Technical Requirements Document — BhuSetu

| Field | Value |
| --- | --- |
| System | BhuSetu land-record verification pilot |
| Status | Draft v0.1 |
| Primary deployment region | AWS Asia Pacific (Mumbai) / `ap-south-1` |
| Architecture style | Serverless verification platform with permissioned-ledger proof of concept |

## 1. Technical principles

1. **Authoritative-source first:** blockchain records integrity and provenance; it does not override an official source system.
2. **PII off-chain:** documents and personal data remain in encrypted, access-controlled AWS storage.
3. **Immutable by addition:** corrections and disputes append new events; no approved event is overwritten or deleted.
4. **Least privilege:** access is constrained by role, jurisdiction, action, and purpose.
5. **Fail safely:** an unavailable integration, invalid signature, or incomplete status must not produce a positive verification result.
6. **Cost-aware:** prefer pay-per-use managed services; no always-on Kubernetes in the pilot.

## 2. Target architecture

```text
Web/PWA
  └─ CloudFront → S3 static application
       └─ Cognito / approved State SSO
            └─ API Gateway
                 ├─ Verification Lambda → DynamoDB → private S3 evidence
                 ├─ Officer-workflow Lambda → Step Functions → SQS/EventBridge
                 ├─ Integration Lambda → State-system adapter / exception queue
                 └─ Ledger-gateway Lambda → Fabric gateway (pilot environment)

KMS encrypts S3, DynamoDB, secrets, and signing material.
CloudWatch, CloudTrail, AWS Config, and Budgets provide audit, alerting, and cost control.
```

## 3. AWS service selection

| Service | Use | Requirement |
| --- | --- | --- |
| S3 | Static web, private evidence objects, audit export | Separate buckets/prefixes by environment; block public access; versioning; KMS encryption; retention policy. |
| CloudFront | HTTPS delivery of static web | Use an origin access control; do not expose the S3 bucket publicly. |
| Cognito | Pilot identity and role claims | Federate with approved State identity provider before production use. |
| API Gateway | Public and officer API edge | HTTPS only, throttling, WAF/rate limits where available, request IDs. |
| Lambda | Stateless verification, workflow, QR, ingestion adapters | No secret in code/environment plaintext; set strict timeout and concurrency limits. |
| Step Functions | Maker-checker and long-running ingestion workflows | Persist approval state and explicit failure transitions. |
| DynamoDB | Parcel index, event metadata, workflow state, idempotency keys | Point-in-time recovery; KMS encryption; conditional writes for state transitions. |
| EventBridge + SQS | Decoupled notifications and retries | Dead-letter queues and alerting are mandatory. |
| KMS + Secrets Manager | Envelope encryption, service secrets, signing | Separate key policy by environment; rotation and access review. |
| CloudWatch + CloudTrail | Observability and security audit | Structured logs; retention policy; alarms for errors and privileged actions. |
| AWS Budgets | Credit/cost guardrails | Alerts at $10, $25, $50, and $75 during credit-limited pilot. |

### Not selected for the pilot

- **EKS:** unnecessary operational burden and baseline cost.
- **RDS/Aurora:** DynamoDB serves the pilot’s key-based evidence/event access pattern.
- **OpenSearch:** defer until authorized search needs exceed DynamoDB indexes.
- **SageMaker:** no AI-based title decisioning; any future OCR must be separately approved.
- **Amazon Managed Blockchain:** design for later consortium adoption, but do not run it against a $100-credit pilot.

## 4. Environments

| Environment | Data | Purpose | Deployment policy |
| --- | --- | --- | --- |
| Local | Synthetic only | Chaincode/unit development | Docker Fabric test network; SAM/LocalStack optional |
| Dev | Synthetic only | Integration and UI development | Automatic deployment after tests |
| Test | Synthetic, masked fixtures | Security, performance, UAT | Change-controlled deployment |
| Pilot | Explicitly authorized data only | Limited district pilot | Manual approval, audit enabled, least privilege |
| Production | Government-approved data | Future State/UT operation | Separate account and completed governance/security gates |

## 5. Data classification

| Class | Examples | Storage/handling |
| --- | --- | --- |
| Public verification metadata | Status, masked parcel reference, issue timestamp, authority name | API response only; no PII by default |
| Restricted personal data | Owner names, contact details, identity references | Encrypted private storage; role/purpose controlled; never on ledger/public QR |
| Restricted land evidence | RoR, deed, mutation order, map file | Encrypted S3; hash and reference only on ledger |
| Confidential government operations | Approval notes, credentials, integration payloads | KMS encryption, Secrets Manager, restricted logs |
| Audit/security data | Actor IDs, IP/device signals, API traces | Tamper-evident log retention; access restricted to auditors |

## 6. Domain model

### 6.1 Parcel index

| Field | Type | Notes |
| --- | --- | --- |
| `parcelId` | string | Internal canonical ID; partition key |
| `stateCode`, `districtCode`, `tehsilCode` | string | Jurisdiction controls |
| `stateParcelId` | string | Authoritative State-system reference |
| `ulpin` | string, optional | Validate format only; do not infer location from it |
| `activeEventId` | string | Latest eligible ledger event |
| `verificationStatus` | enum | One of defined PRD statuses |
| `disputeHold` | boolean | Conservative verification guard |
| `updatedAt` | ISO-8601 timestamp | System timestamp |
| `version` | integer | Optimistic-concurrency guard |

### 6.2 Evidence event

| Field | Type | Notes |
| --- | --- | --- |
| `eventId` | UUID/ULID | Immutable event identity |
| `parcelId` | string | Canonical parcel reference |
| `eventType` | enum | `ISSUE`, `MUTATION`, `CORRECTION`, `SUPERSESSION`, `DISPUTE_HOLD`, `DISPUTE_RELEASE` |
| `evidenceType` | enum | RoR, deed reference, map, order, other approved type |
| `sha256` | hex string | Hash of canonical evidence bytes |
| `objectRef` | private URI | Never returned publicly |
| `sourceSystem` | string | E.g., approved State Revenue system |
| `sourceReference` | string | Source-system transaction/reference ID |
| `previousEventId` | string, optional | Causal history link |
| `status` | enum | Pending, approved, rejected, committed |
| `makerActorId`, `checkerActorId` | opaque ID | Distinct actors required |
| `approvalReason` | string | Required for correction/dispute/supersession |
| `ledgerTxId` | string | Fabric transaction reference |
| `createdAt`, `approvedAt` | timestamps | Audit timestamps |

### 6.3 Audit event

```json
{
  "auditEventId": "01J...",
  "correlationId": "req-...",
  "actorId": "opaque-user-id",
  "actorRole": "REVENUE_APPROVER",
  "action": "APPROVE_EVIDENCE",
  "resourceType": "EVIDENCE_EVENT",
  "resourceId": "evt-...",
  "jurisdiction": "STATE/DISTRICT/TEHSIL",
  "outcome": "SUCCESS",
  "occurredAt": "2026-09-19T00:00:00Z"
}
```

Audit logs must not record evidence contents, identity numbers, session tokens, credentials, or unredacted document URLs.

## 7. Ledger design

### 7.1 Local proof-of-concept network

- Framework: Hyperledger Fabric LTS-compatible release.
- Simulated organizations: `RevenueOrg`, `RegistrationOrg`, `SurveyOrg`.
- Channel: `land-records-pilot`.
- Endorsement policy: any two of Revenue, Registration, and Survey for lifecycle events that change an active record; authorized Revenue/Court role for dispute states according to the pilot governance policy.
- Chaincode state stores only event metadata, SHA-256 hash, approval references, and status; it stores no files or PII.

### 7.2 Required chaincode functions

| Function | Required authorization | Effect |
| --- | --- | --- |
| `CreateParcel` | Revenue + Survey | Creates the canonical parcel entry. |
| `SubmitEvidence` | Authorized maker | Adds an unapproved evidence proposal. |
| `ApproveEvidence` | Authorized checker distinct from maker | Commits eligible evidence and updates current state. |
| `RecordMutation` | Registration + Revenue policy | Links approved mutation evidence; may remain pending. |
| `FlagDispute` | Court/revenue liaison | Adds dispute hold with authoritative reference. |
| `ReleaseDispute` | Authorized court/revenue liaison | Adds release event; never erases hold history. |
| `SupersedeEvidence` | Authorized checker | Links a new version to prior evidence. |
| `GetHistory` | Authorized/publicly filtered | Returns a policy-filtered history. |

### 7.3 Ledger invariants

1. Event IDs are unique.
2. An event’s evidence hash and source reference cannot change after approval.
3. Maker and checker identities differ.
4. A disputed parcel cannot return `Verified`.
5. A superseded event cannot become active again without a new authorized event.
6. A ledger transaction is considered complete only after the off-chain evidence object is durable and the index update is idempotently reconciled.

## 8. API contract

All endpoints use HTTPS, JSON, a correlation ID, and standardized error bodies. Officer endpoints require authentication, role claims, jurisdiction checks, and purpose logging.

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/v1/verify/reference` | Public rate-limited | Verify QR/reference without document upload. |
| `POST` | `/v1/verify/document` | Public rate-limited | Upload a supported file to compute/compare its hash. |
| `GET` | `/v1/parcels/{parcelId}` | Authorized | Retrieve policy-filtered parcel details. |
| `GET` | `/v1/parcels/{parcelId}/history` | Authorized/auditor | Retrieve event history by permission. |
| `POST` | `/v1/evidence` | Maker | Create a pending evidence event. |
| `POST` | `/v1/evidence/{eventId}/approve` | Checker | Approve and commit an event. |
| `POST` | `/v1/parcels/{parcelId}/disputes` | Authorized liaison | Flag a dispute/hold. |
| `POST` | `/v1/parcels/{parcelId}/supersessions` | Authorized checker | Create a replacement event. |
| `POST` | `/v1/integrations/{source}/events` | Source adapter | Receive signed, idempotent source events. |
| `GET` | `/v1/audit/export` | Auditor | Start a restricted audit export. |

### Public verification response

```json
{
  "verificationReference": "BHS-2M7D-9KQX",
  "status": "VERIFIED",
  "statusMessage": "Evidence matches an authorized record issued on 2026-09-19.",
  "issuingAuthority": "Pilot Revenue Department",
  "issuedAt": "2026-09-19T00:00:00Z",
  "parcelReferenceMasked": "AP-XX-***-041",
  "nextStep": "For title or encumbrance questions, contact the competent Revenue/Registration authority."
}
```

The response must omit owner names, document URLs, raw hashes unless required for an authorized verifier, source credentials, and all internal IDs.

## 9. Workflow and consistency

1. Upload evidence directly to a pre-signed, short-lived private S3 URL.
2. Lambda validates file type/size, malware scan result if enabled, metadata, and SHA-256 hash.
3. Create a `PENDING` event with idempotency key and audit event.
4. Step Functions routes the request to an eligible checker.
5. On approval, a ledger-gateway transaction commits the event.
6. Update DynamoDB conditionally using event ID/version; publish an `EvidenceCommitted` event.
7. If any downstream step fails, retain the safe `PENDING`/`COMMIT_RECONCILIATION_REQUIRED` state and retry from a durable queue. Never falsely mark it verified.

## 10. Identity and authorization

- Use Cognito groups/claims only for the pilot; design a federation interface for State SSO.
- Enforce `role`, `state`, `district`, `tehsil`, and `allowedActions` at the API and data layer.
- Require MFA for all privileged users.
- Maker-checker separation is enforced server-side; UI hiding alone is insufficient.
- Break-glass access requires an approved incident ticket, a second approver, a short expiry, and a separate audit event.
- Service-to-service integration uses mTLS or OAuth client credentials plus request signing and source allowlisting.

## 11. Security requirements

| Area | Requirement |
| --- | --- |
| Encryption in transit | TLS 1.2+; HSTS on web endpoints; no HTTP fallback. |
| Encryption at rest | KMS-backed encryption for S3, DynamoDB, queues, logs where supported, backups, and secrets. |
| Object protection | S3 Block Public Access; versioning; object lock/retention where legally approved. |
| Keys | Separate KMS keys per environment; key access is least privilege and logged. |
| Secrets | Store credentials only in Secrets Manager; rotate integration secrets; never commit them. |
| Input safety | File size/type limits, content sniffing, malware scanning, schema validation, anti-virus quarantine. |
| API protection | Throttling, WAF/rate limiting as appropriate, request-size limits, abuse monitoring. |
| Logs | Structured/redacted logging; no raw documents, secrets, or unnecessary PII. |
| Backups | DynamoDB PITR; S3 versioning/replication according to approval; periodic restore exercises. |

## 12. Threat model

| Threat | Control |
| --- | --- |
| Forged or modified PDF | Canonical SHA-256 evidence hash, authorized source reference, and signature validation. |
| Rogue officer approval | Maker-checker policy, role/jurisdiction controls, signed audit trail, anomaly alerts. |
| Stolen verifier link/QR | Privacy-minimized public response, rate limits, unguessable references, optional expiry/revocation. |
| Source-system replay | Signed requests, timestamps, nonce/idempotency keys, conditional DynamoDB writes. |
| Ledger/API inconsistency | Durable outbox/reconciliation queue and explicit intermediate states. |
| Ransomware/deletion | Versioning, retention controls, backup/restore validation, least-privilege delete policy. |
| PII leakage in UI/logs | Data minimization, redaction tests, authorization checks, no PII on-chain. |
| AI hallucination | No AI makes title/status decisions; any assistant is limited by `AGENT_RULES.md`. |

## 13. Non-functional requirements

| ID | Requirement |
| --- | --- |
| NFR-01 | Service returns a safe `Unavailable` result if an authoritative source or integrity check cannot complete. |
| NFR-02 | All writes are idempotent and correlation IDs propagate across APIs, workflows, queues, and ledger calls. |
| NFR-03 | Every status-changing action is traceable to a human/service identity and authorization decision. |
| NFR-04 | Infrastructure is defined as code and reviewed before deployment. |
| NFR-05 | Automated tests cover state transitions, authorization boundaries, hash mismatch, duplicate delivery, and dispute holds. |
| NFR-06 | Public UI meets WCAG 2.2 AA and works on low-bandwidth mobile connections. |
| NFR-07 | System clocks use UTC internally and show localized time only at presentation. |

## 14. Observability and operations

- Emit structured JSON logs with `correlationId`, `eventId`, `parcelId` only when authorized, status, latency, and error class.
- Create alarms for Lambda errors/throttles, DLQ depth, integration signature failures, approval backlog, denied privileged actions, unusual public-verification volume, and budget thresholds.
- Maintain runbooks for failed ingestion, failed ledger commit, evidence-access failure, dispute feed outage, suspected data exposure, and rollback.
- Conduct a monthly access review during the pilot and a post-incident review for every security incident.

## 15. Test strategy

| Test class | Mandatory cases |
| --- | --- |
| Unit | Canonical hashing, status transitions, masking, authorization predicates, idempotency. |
| Contract | State-source event schema, signature validation, version compatibility. |
| Integration | S3/DynamoDB/Step Functions/ledger reconciliation, queue retries, DLQ replay. |
| Security | OWASP API checks, access-control tests, secret scans, log-redaction tests, dependency scanning. |
| Performance | Public verification surge, document upload limits, concurrent approvals. |
| UAT | Officer maker/checker, auditor history, citizen QR verification, dispute hold, correction flow. |
| Recovery | Restore DynamoDB/S3 data; reconcile event index against ledger history. |

## 16. Delivery gates

1. Architecture and threat model approved.
2. No critical/high security finding unresolved before pilot data access.
3. Source data contract and authoritative status rules signed off.
4. Backup restore and ledger/index reconciliation tests pass.
5. Accessibility and officer UAT pass.
6. Cost alarms and deprovisioning runbook confirmed before pilot launch.
