import { Parcel, EvidenceEvent, AuditEvent } from '../types/domain';
import { fabricLedgerEngine } from '../ledger/fabric-engine';
import { calculateSha256 } from '../crypto/hash';
import {
  saveParcelToDynamo,
  getParcelFromDynamo,
  getAllParcelsFromDynamo,
  getParcelByStateIdFromDynamo,
  saveEvidenceToDynamo,
  getEvidenceByEventIdFromDynamo,
  getEvidenceByRefFromDynamo,
  getEvidenceByHashFromDynamo,
  getEventsForParcelFromDynamo,
  getPendingEventsFromDynamo,
  saveAuditToDynamo,
  getAuditLogsFromDynamo,
  uploadEvidenceToS3,
} from '../aws/aws-client';

const DEMO_DOCS: Record<string, string> = {
  'doc-ror-041': 'OFFICIAL RECORD OF RIGHTS (ROR) EXTRACT - TEHSIL TENALI, GUNTUR DISTRICT. PARCEL AP-GNT-SUR-2024-041. AREA: 2.45 ACRES. CLASSIFICATION: WET AGRICULTURAL LAND.',
  'court-order-442': 'CIVIL SUIT OS 442/2025 INJUNCTION ORDER',
  'old-ror-2018': 'OLD ROR 2018 EXTRACT SUPERSEDED BY MUTATION ORDER MUT-2026-44819',
  'mutation-order-043': 'MUTATION ORDER MUT-2026-44819 - SUCCESSION TRANSFER. PARCEL AP-GNT-SUR-2024-043.',
};

/**
 * AWS-First Data Repository with Offline/Local Resiliency Fallback
 * 
 * In production, all reads and writes target Amazon DynamoDB and S3.
 * When running offline or in local test environments without live AWS credentials,
 * the repository gracefully falls back to the in-memory seed dataset.
 */
class DataRepository {
  private memoryParcels: Map<string, Parcel> = new Map();
  private memoryEvidenceEvents: Map<string, EvidenceEvent> = new Map();
  private memoryAuditLogs: AuditEvent[] = [];
  private memoryDocuments: Map<string, string> = new Map();

  constructor() {
    this.seedFallbackData();
  }

  private seedFallbackData() {
    const sha041 = calculateSha256(DEMO_DOCS['doc-ror-041']);
    const evt041: EvidenceEvent = {
      eventId: 'evt-041-issue',
      parcelId: 'PCL-AP-GNT-041',
      eventType: 'ISSUE',
      evidenceType: 'ROR_EXTRACT',
      sha256: sha041,
      objectRef: 's3://bhusetu-evidence-storage/evidence/2026/09/doc-ror-041.pdf.enc',
      sourceSystem: 'Meeseva / AP Revenue Portal',
      sourceReference: 'AP-REV-2024-99812',
      status: 'APPROVED',
      makerActorId: 'user-reg-maker-01',
      makerRole: 'REGISTRATION_MAKER',
      checkerActorId: 'user-rev-checker-01',
      checkerRole: 'REVENUE_CHECKER',
      approvalReason: 'Initial verified district pilot ingestion',
      verificationReference: 'BHS-2M7D-9KQX',
      ledgerTxId: 'tx-fb-041-genesis-commit',
      createdAt: '2026-09-10T10:00:00Z',
      approvedAt: '2026-09-10T11:30:00Z',
    };
    this.memoryEvidenceEvents.set(evt041.eventId, evt041);
    fabricLedgerEngine.commitEvent(evt041);

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
      version: 1,
    };
    this.memoryParcels.set(pcl041.parcelId, pcl041);

    const sha042 = calculateSha256(DEMO_DOCS['court-order-442']);
    const evt042: EvidenceEvent = {
      eventId: 'evt-042-dispute',
      parcelId: 'PCL-AP-GNT-042',
      eventType: 'DISPUTE_HOLD',
      evidenceType: 'COURT_ORDER',
      sha256: sha042,
      objectRef: 's3://bhusetu-evidence-storage/evidence/2026/09/court-order-442.pdf.enc',
      sourceSystem: 'District Civil Court Tenali',
      sourceReference: 'COURT-OS-442-2025',
      status: 'APPROVED',
      makerActorId: 'user-dispute-01',
      makerRole: 'DISPUTE_LIAISON',
      checkerActorId: 'user-rev-checker-01',
      checkerRole: 'REVENUE_CHECKER',
      approvalReason: 'Active civil injunction order pending title suit',
      verificationReference: 'BHS-88X9-4K2M',
      ledgerTxId: 'tx-fb-042-court-hold',
      createdAt: '2026-09-12T09:00:00Z',
      approvedAt: '2026-09-12T09:15:00Z',
    };
    this.memoryEvidenceEvents.set(evt042.eventId, evt042);
    fabricLedgerEngine.commitEvent(evt042, ['RevenueOrg', 'SurveyOrg']);

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
      version: 1,
    };
    this.memoryParcels.set(pcl042.parcelId, pcl042);

    const sha043 = calculateSha256(DEMO_DOCS['mutation-order-043']);
    const evt043: EvidenceEvent = {
      eventId: 'evt-043-mutation-new',
      parcelId: 'PCL-AP-GNT-043',
      eventType: 'MUTATION',
      evidenceType: 'MUTATION_ORDER',
      sha256: sha043,
      objectRef: 's3://bhusetu-evidence-storage/evidence/2026/09/mutation-order-043.pdf.enc',
      sourceSystem: 'AP Revenue Portal / Mutation Registry',
      sourceReference: 'MUT-2026-44819',
      status: 'APPROVED',
      makerActorId: 'user-reg-maker-01',
      makerRole: 'REGISTRATION_MAKER',
      checkerActorId: 'user-rev-checker-01',
      checkerRole: 'REVENUE_CHECKER',
      approvalReason: 'Approved succession mutation order',
      verificationReference: 'BHS-33F4-77P9',
      ledgerTxId: 'tx-fb-043-new-commit',
      createdAt: '2026-09-15T14:30:00Z',
      approvedAt: '2026-09-15T15:00:00Z',
    };
    this.memoryEvidenceEvents.set(evt043.eventId, evt043);
    fabricLedgerEngine.commitEvent(evt043);

    const pcl043: Parcel = {
      parcelId: 'PCL-AP-GNT-043',
      stateCode: 'AP',
      districtCode: 'GNT',
      tehsilCode: 'TNL',
      stateParcelId: 'AP-GNT-SUR-2024-043',
      ulpin: '14829301928473',
      activeEventId: evt043.eventId,
      verificationStatus: 'VERIFIED',
      disputeHold: false,
      updatedAt: '2026-09-15T15:00:00Z',
      version: 2,
    };
    this.memoryParcels.set(pcl043.parcelId, pcl043);
  }

  // --- Parcel Methods ---

  public async getParcelById(parcelId: string): Promise<Parcel | null> {
    try {
      const fromDynamo = await getParcelFromDynamo(parcelId);
      if (fromDynamo) return fromDynamo;
    } catch {
      // Fall through to memory fallback
    }
    return this.memoryParcels.get(parcelId) || null;
  }

  public async getParcelByStateId(stateParcelId: string): Promise<Parcel | null> {
    try {
      const fromDynamo = await getParcelByStateIdFromDynamo(stateParcelId);
      if (fromDynamo) return fromDynamo;
    } catch {
      // Fall through to memory fallback
    }
    return Array.from(this.memoryParcels.values()).find(p => p.stateParcelId === stateParcelId) || null;
  }

  public async getAllParcels(): Promise<Parcel[]> {
    try {
      const fromDynamo = await getAllParcelsFromDynamo();
      if (fromDynamo && fromDynamo.length > 0) return fromDynamo;
    } catch {
      // Fall through to memory fallback
    }
    return Array.from(this.memoryParcels.values());
  }

  public async updateParcel(parcel: Parcel): Promise<void> {
    parcel.version = (parcel.version || 0) + 1;
    parcel.updatedAt = new Date().toISOString();
    this.memoryParcels.set(parcel.parcelId, parcel);
    try {
      await saveParcelToDynamo(parcel);
    } catch (err: any) {
      console.warn('[Repository] DynamoDB updateParcel fallback to local state:', err?.message || err);
    }
  }

  // --- Evidence Methods ---

  public async getEvidenceEvent(eventId: string): Promise<EvidenceEvent | null> {
    try {
      const fromDynamo = await getEvidenceByEventIdFromDynamo(eventId);
      if (fromDynamo) return fromDynamo;
    } catch {
      // Fall through
    }
    return this.memoryEvidenceEvents.get(eventId) || null;
  }

  public async getEvidenceByReference(ref: string): Promise<EvidenceEvent | null> {
    const cleanRef = ref.trim().toUpperCase();
    try {
      const fromDynamo = await getEvidenceByRefFromDynamo(cleanRef);
      if (fromDynamo) return fromDynamo;
    } catch {
      // Fall through
    }
    return Array.from(this.memoryEvidenceEvents.values()).find(
      e => e.verificationReference.toUpperCase() === cleanRef
    ) || null;
  }

  public async getEvidenceByHash(hashHex: string): Promise<EvidenceEvent | null> {
    const cleanHash = hashHex.trim().toLowerCase();
    try {
      const fromDynamo = await getEvidenceByHashFromDynamo(cleanHash);
      if (fromDynamo) return fromDynamo;
    } catch {
      // Fall through
    }
    return Array.from(this.memoryEvidenceEvents.values()).find(
      e => e.sha256.toLowerCase() === cleanHash && (e.status === 'APPROVED' || e.status === 'COMMITTED')
    ) || null;
  }

  public async getEventsForParcel(parcelId: string): Promise<EvidenceEvent[]> {
    try {
      const fromDynamo = await getEventsForParcelFromDynamo(parcelId);
      if (fromDynamo && fromDynamo.length > 0) return fromDynamo;
    } catch {
      // Fall through
    }
    return Array.from(this.memoryEvidenceEvents.values())
      .filter(e => e.parcelId === parcelId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async getPendingEvents(): Promise<EvidenceEvent[]> {
    try {
      const fromDynamo = await getPendingEventsFromDynamo();
      if (fromDynamo && fromDynamo.length > 0) return fromDynamo;
    } catch {
      // Fall through
    }
    return Array.from(this.memoryEvidenceEvents.values())
      .filter(e => e.status === 'PENDING')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async saveEvidenceEvent(event: EvidenceEvent): Promise<void> {
    this.memoryEvidenceEvents.set(event.eventId, event);
    try {
      await saveEvidenceToDynamo(event);
    } catch (err: any) {
      console.warn('[Repository] DynamoDB saveEvidenceEvent fallback to local state:', err?.message || err);
    }
  }

  // --- Document Storage ---

  public async storeDocument(hashHex: string, content: string): Promise<void> {
    this.memoryDocuments.set(hashHex, content);
    try {
      await uploadEvidenceToS3(`evidence/documents/${hashHex}.enc`, content, { sha256: hashHex });
    } catch (err: any) {
      console.warn('[Repository] S3 storeDocument fallback to local state:', err?.message || err);
    }
  }

  // --- Audit Log Methods ---

  public async logAudit(event: Omit<AuditEvent, 'auditEventId' | 'occurredAt'>): Promise<AuditEvent> {
    const fullEvent: AuditEvent = {
      ...event,
      auditEventId: `aud-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`,
      occurredAt: new Date().toISOString()
    };
    this.memoryAuditLogs.unshift(fullEvent);
    try {
      await saveAuditToDynamo(fullEvent);
    } catch (err: any) {
      console.warn('[Repository] DynamoDB logAudit fallback to local state:', err?.message || err);
    }
    return fullEvent;
  }

  public async getAuditLogs(filters?: {
    parcelId?: string;
    actorId?: string;
    action?: string;
  }): Promise<AuditEvent[]> {
    try {
      const fromDynamo = await getAuditLogsFromDynamo(filters);
      if (fromDynamo && fromDynamo.length > 0) return fromDynamo;
    } catch {
      // Fall through
    }
    let logs = [...this.memoryAuditLogs];
    if (filters?.parcelId) logs = logs.filter(l => l.resourceId === filters.parcelId);
    if (filters?.actorId) logs = logs.filter(l => l.actorId === filters.actorId);
    if (filters?.action) logs = logs.filter(l => l.action === filters.action);
    return logs;
  }
}

export const repository = new DataRepository();
