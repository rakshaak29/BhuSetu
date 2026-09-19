import { Parcel, EvidenceEvent, AuditEvent, VerificationStatus } from '../types/domain';
import { fabricLedgerEngine } from '../ledger/fabric-engine';
import {
  saveParcelToDynamo,
  saveEvidenceToDynamo,
  saveAuditToDynamo,
  uploadEvidenceToS3,
} from '../aws/aws-client';

// Initial synthetic seed evidence documents
const DEMO_DOC_CONTENTS: Record<string, string> = {
  'doc-ror-041': 'OFFICIAL RECORD OF RIGHTS (ROR) EXTRACT - TEHSIL TENALI, GUNTUR DISTRICT. PARCEL AP-GNT-SUR-2024-041. AREA: 2.45 ACRES. CLASSIFICATION: WET AGRICULTURAL LAND.',
  'doc-deed-042': 'REGISTERED DEED OF CONVEYANCE - REG-2024-883921. TEHSIL TENALI. PARCEL AP-GNT-SUR-2024-042.',
  'doc-map-043': 'CADASTRAL MAP EXTRACT BHUNNAKSHA - ULPIN 14829301928471. PARCEL AP-GNT-SUR-2024-043.',
};

class DataRepository {
  private parcels: Map<string, Parcel> = new Map();
  private evidenceEvents: Map<string, EvidenceEvent> = new Map();
  private auditLogs: AuditEvent[] = [];
  private documents: Map<string, string> = new Map(); // SHA256 -> content

  constructor() {
    this.seedPilotData();
  }

  private seedPilotData() {
    // Register demo document contents
    for (const [_, content] of Object.entries(DEMO_DOC_CONTENTS)) {
      const sha = require('../crypto/hash').calculateSha256(content);
      this.documents.set(sha, content);
    }

    // Parcel 1: VERIFIED - Active RoR record
    const sha041 = require('../crypto/hash').calculateSha256(DEMO_DOC_CONTENTS['doc-ror-041']);
    const evt041: EvidenceEvent = {
      eventId: 'evt-041-issue',
      parcelId: 'PCL-AP-GNT-041',
      eventType: 'ISSUE',
      evidenceType: 'ROR_EXTRACT',
      sha256: sha041,
      objectRef: 's3://bhusetu-private-evidence/2026/09/doc-ror-041.pdf.enc',
      sourceSystem: 'Meeseva / AP Revenue Portal',
      sourceReference: 'AP-REV-2024-99812',
      status: 'APPROVED',
      makerActorId: 'user-reg-maker-01',
      makerRole: 'REGISTRATION_MAKER',
      checkerActorId: 'user-rev-checker-01',
      checkerRole: 'REVENUE_CHECKER',
      approvalReason: 'Initial verified district pilot ingestion',
      verificationReference: 'BHS-2M7D-9KQX',
      createdAt: '2026-09-10T10:00:00Z',
      approvedAt: '2026-09-10T11:30:00Z'
    };
    this.evidenceEvents.set(evt041.eventId, evt041);
    const commit041 = fabricLedgerEngine.commitEvent(evt041);
    evt041.ledgerTxId = commit041.txId;

    const pcl041: Parcel = {
      parcelId: 'PCL-AP-GNT-041',
      stateCode: 'AP',
      districtCode: 'GNT',
      tehsilCode: 'TNL',
      stateParcelId: 'AP-GNT-SUR-2024-041',
      ulpin: '14829301928471',
      activeEventId: evt041.eventId,
      verificationStatus: 'VERIFIED',
      disputeHold: false,
      updatedAt: '2026-09-10T11:30:00Z',
      version: 1
    };
    this.parcels.set(pcl041.parcelId, pcl041);

    // Parcel 2: DISPUTED - Revenue/Court Dispute Hold
    const evt042: EvidenceEvent = {
      eventId: 'evt-042-dispute',
      parcelId: 'PCL-AP-GNT-042',
      eventType: 'DISPUTE_HOLD',
      evidenceType: 'COURT_ORDER',
      sha256: require('../crypto/hash').calculateSha256('CIVIL SUIT OS 442/2025 INJUNCTION ORDER'),
      objectRef: 's3://bhusetu-private-evidence/2026/09/court-order-442.pdf.enc',
      sourceSystem: 'District Civil Court Tenali',
      sourceReference: 'COURT-OS-442-2025',
      status: 'APPROVED',
      makerActorId: 'user-dispute-01',
      makerRole: 'DISPUTE_LIAISON',
      checkerActorId: 'user-rev-checker-01',
      checkerRole: 'REVENUE_CHECKER',
      approvalReason: 'Active civil injunction order pending title suit',
      verificationReference: 'BHS-88X9-4K2M',
      createdAt: '2026-09-12T09:00:00Z',
      approvedAt: '2026-09-12T09:15:00Z'
    };
    this.evidenceEvents.set(evt042.eventId, evt042);
    const commit042 = fabricLedgerEngine.commitEvent(evt042, ['RevenueOrg', 'SurveyOrg']);
    evt042.ledgerTxId = commit042.txId;

    const pcl042: Parcel = {
      parcelId: 'PCL-AP-GNT-042',
      stateCode: 'AP',
      districtCode: 'GNT',
      tehsilCode: 'TNL',
      stateParcelId: 'AP-GNT-SUR-2024-042',
      ulpin: '14829301928472',
      activeEventId: evt042.eventId,
      verificationStatus: 'DISPUTED',
      disputeHold: true,
      disputeReason: 'Interim injunction order by District Civil Court Tenali',
      disputeReference: 'COURT-OS-442-2025',
      updatedAt: '2026-09-12T09:15:00Z',
      version: 1
    };
    this.parcels.set(pcl042.parcelId, pcl042);

    // Parcel 3: SUPERSEDED - Newer mutation record replaced previous version
    const evt043Old: EvidenceEvent = {
      eventId: 'evt-043-old',
      parcelId: 'PCL-AP-GNT-043',
      eventType: 'ISSUE',
      evidenceType: 'ROR_EXTRACT',
      sha256: require('../crypto/hash').calculateSha256('OLD ROR 2020 EXTRACT'),
      objectRef: 's3://bhusetu-private-evidence/2020/01/old-ror.pdf.enc',
      sourceSystem: 'AP Revenue Portal',
      sourceReference: 'REV-2020-00192',
      status: 'APPROVED',
      makerActorId: 'user-reg-maker-01',
      makerRole: 'REGISTRATION_MAKER',
      checkerActorId: 'user-rev-checker-01',
      checkerRole: 'REVENUE_CHECKER',
      verificationReference: 'BHS-OLD1-9999',
      createdAt: '2020-01-01T00:00:00Z',
      approvedAt: '2020-01-01T01:00:00Z'
    };
    this.evidenceEvents.set(evt043Old.eventId, evt043Old);
    fabricLedgerEngine.commitEvent(evt043Old);

    const evt043New: EvidenceEvent = {
      eventId: 'evt-043-new',
      parcelId: 'PCL-AP-GNT-043',
      eventType: 'MUTATION',
      evidenceType: 'MUTATION_ORDER',
      sha256: require('../crypto/hash').calculateSha256(DEMO_DOC_CONTENTS['doc-map-043']),
      objectRef: 's3://bhusetu-private-evidence/2026/09/mutation-order-88.pdf.enc',
      sourceSystem: 'Tehsildar Office Tenali',
      sourceReference: 'MUT-2026-88190',
      previousEventId: evt043Old.eventId,
      status: 'APPROVED',
      makerActorId: 'user-reg-maker-01',
      makerRole: 'REGISTRATION_MAKER',
      checkerActorId: 'user-rev-checker-01',
      checkerRole: 'REVENUE_CHECKER',
      approvalReason: 'Approved mutation post inheritance transfer',
      verificationReference: 'BHS-4K9P-1L0W',
      createdAt: '2026-09-15T14:00:00Z',
      approvedAt: '2026-09-15T15:00:00Z'
    };
    this.evidenceEvents.set(evt043New.eventId, evt043New);
    const commit043 = fabricLedgerEngine.commitEvent(evt043New);
    evt043New.ledgerTxId = commit043.txId;

    const pcl043: Parcel = {
      parcelId: 'PCL-AP-GNT-043',
      stateCode: 'AP',
      districtCode: 'GNT',
      tehsilCode: 'TNL',
      stateParcelId: 'AP-GNT-SUR-2024-043',
      ulpin: '14829301928473',
      activeEventId: evt043New.eventId,
      verificationStatus: 'VERIFIED',
      disputeHold: false,
      updatedAt: '2026-09-15T15:00:00Z',
      version: 2
    };
    this.parcels.set(pcl043.parcelId, pcl043);
  }

  // --- Parcel Methods ---
  public getParcelById(parcelId: string): Parcel | undefined {
    return this.parcels.get(parcelId);
  }

  public getParcelByStateId(stateParcelId: string): Parcel | undefined {
    return Array.from(this.parcels.values()).find(p => p.stateParcelId === stateParcelId);
  }

  public getAllParcels(): Parcel[] {
    return Array.from(this.parcels.values());
  }

  public updateParcel(parcel: Parcel): void {
    parcel.version += 1;
    parcel.updatedAt = new Date().toISOString();
    this.parcels.set(parcel.parcelId, parcel);
    saveParcelToDynamo(parcel).catch((err) => console.warn('DynamoDB parcel sync skipped:', err.message));
  }

  // --- Evidence Methods ---
  public getEvidenceEvent(eventId: string): EvidenceEvent | undefined {
    return this.evidenceEvents.get(eventId);
  }

  public getEvidenceByReference(ref: string): EvidenceEvent | undefined {
    const cleanRef = ref.trim().toUpperCase();
    return Array.from(this.evidenceEvents.values()).find(e => e.verificationReference.toUpperCase() === cleanRef);
  }

  public getEvidenceByHash(hashHex: string): EvidenceEvent | undefined {
    const cleanHash = hashHex.trim().toLowerCase();
    return Array.from(this.evidenceEvents.values()).find(e => e.sha256.toLowerCase() === cleanHash && e.status === 'APPROVED');
  }

  public getEventsForParcel(parcelId: string): EvidenceEvent[] {
    return Array.from(this.evidenceEvents.values())
      .filter(e => e.parcelId === parcelId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getPendingEvents(): EvidenceEvent[] {
    return Array.from(this.evidenceEvents.values())
      .filter(e => e.status === 'PENDING')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public saveEvidenceEvent(event: EvidenceEvent): void {
    this.evidenceEvents.set(event.eventId, event);
    saveEvidenceToDynamo(event).catch((err) => console.warn('DynamoDB evidence sync skipped:', err.message));
  }

  // --- Document Storage Methods ---
  public storeDocument(hashHex: string, content: string): void {
    this.documents.set(hashHex, content);
    uploadEvidenceToS3(`evidence/documents/${hashHex}.enc`, content, { sha256: hashHex }).catch((err) =>
      console.warn('S3 document sync skipped:', err.message)
    );
  }

  // --- Audit Log Methods ---
  public logAudit(event: Omit<AuditEvent, 'auditEventId' | 'occurredAt'>): AuditEvent {
    const fullEvent: AuditEvent = {
      ...event,
      auditEventId: `aud-${Math.random().toString(36).substring(2, 10)}`,
      occurredAt: new Date().toISOString()
    };
    this.auditLogs.unshift(fullEvent);
    saveAuditToDynamo(fullEvent).catch((err) => console.warn('DynamoDB audit sync skipped:', err.message));
    return fullEvent;
  }

  public getAuditLogs(): AuditEvent[] {
    return [...this.auditLogs];
  }
}

export const repository = new DataRepository();
