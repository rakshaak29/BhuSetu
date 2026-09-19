export type VerificationStatus = 
  | 'VERIFIED'
  | 'MISMATCH'
  | 'PENDING_REVIEW'
  | 'DISPUTED'
  | 'SUPERSEDED'
  | 'UNAVAILABLE';

export type EventType = 
  | 'ISSUE'
  | 'MUTATION'
  | 'CORRECTION'
  | 'SUPERSEDED'
  | 'DISPUTE_HOLD'
  | 'DISPUTE_RELEASE';

export type EvidenceType = 
  | 'ROR_EXTRACT'
  | 'REGISTERED_DEED'
  | 'MUTATION_ORDER'
  | 'CADASTRAL_MAP'
  | 'COURT_ORDER'
  | 'SURVEY_REPORT';

export type UserRole = 
  | 'CITIZEN'
  | 'VERIFIER'
  | 'REGISTRATION_MAKER'
  | 'REVENUE_CHECKER'
  | 'SURVEY_OFFICER'
  | 'DISPUTE_LIAISON'
  | 'AUDITOR'
  | 'ADMIN';

export interface Jurisdiction {
  stateCode: string;
  districtCode: string;
  tehsilCode: string;
}

export interface Parcel {
  parcelId: string; // e.g. "PCL-AP-GNT-041"
  stateCode: string;
  districtCode: string;
  tehsilCode: string;
  stateParcelId: string; // Authoritative State ID e.g. "AP-GNT-SUR-2024-041"
  ulpin?: string; // 14-digit BhuNnaksha / ULPIN format e.g. "14829301928471"
  activeEventId?: string;
  verificationStatus: VerificationStatus;
  disputeHold: boolean;
  disputeReason?: string;
  disputeReference?: string;
  updatedAt: string; // ISO-8601
  version: number;
}

export interface EvidenceEvent {
  eventId: string; // UUID/ULID e.g. "evt-01j88a91"
  parcelId: string;
  eventType: EventType;
  evidenceType: EvidenceType;
  sha256: string; // 64 hex char hash
  objectRef: string; // Private encrypted S3 reference
  sourceSystem: string; // e.g. "AP Revenue Portal" / "Registration Dept"
  sourceReference: string; // e.g. "REG-2024-883921"
  previousEventId?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMMITTED';
  makerActorId: string;
  makerRole: UserRole;
  checkerActorId?: string;
  checkerRole?: UserRole;
  approvalReason?: string;
  ledgerTxId?: string; // Fabric transaction ID e.g. "tx-fb823a91..."
  verificationReference: string; // e.g. "BHS-2M7D-9KQX"
  createdAt: string;
  approvedAt?: string;
}

export interface AuditEvent {
  auditEventId: string;
  correlationId: string;
  actorId: string;
  actorRole: UserRole;
  action: string; // e.g. "APPROVE_EVIDENCE", "FLAG_DISPUTE", "PUBLIC_VERIFY"
  resourceType: string; // "EVIDENCE_EVENT", "PARCEL", "AUDIT_EXPORT"
  resourceId: string;
  jurisdiction: string;
  outcome: 'SUCCESS' | 'DENIED' | 'ERROR';
  details?: Record<string, unknown>;
  occurredAt: string;
}

export interface PublicVerificationResponse {
  verificationReference: string;
  status: VerificationStatus;
  statusMessage: string;
  issuingAuthority: string;
  issuedAt: string;
  parcelReferenceMasked: string;
  evidenceType?: string;
  nextStep: string;
  legalDisclaimer: string;
}

export interface UserSession {
  actorId: string;
  name: string;
  role: UserRole;
  jurisdiction: Jurisdiction;
}
