import { Parcel, EvidenceEvent, AuditEvent } from '../types/domain';
import { fabricLedgerEngine } from '../ledger/fabric-engine';
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

/**
 * AWS-First Data Repository
 * 
 * All reads and writes go directly to real Amazon DynamoDB and S3.
 * No in-memory caches — every call is a live AWS operation.
 */
class DataRepository {

  // --- Parcel Methods (all async, all DynamoDB) ---

  public async getParcelById(parcelId: string): Promise<Parcel | null> {
    return getParcelFromDynamo(parcelId);
  }

  public async getParcelByStateId(stateParcelId: string): Promise<Parcel | null> {
    return getParcelByStateIdFromDynamo(stateParcelId);
  }

  public async getAllParcels(): Promise<Parcel[]> {
    return getAllParcelsFromDynamo();
  }

  public async updateParcel(parcel: Parcel): Promise<void> {
    parcel.version = (parcel.version || 0) + 1;
    parcel.updatedAt = new Date().toISOString();
    await saveParcelToDynamo(parcel);
  }

  // --- Evidence Methods (all async, all DynamoDB) ---

  public async getEvidenceEvent(eventId: string): Promise<EvidenceEvent | null> {
    return getEvidenceByEventIdFromDynamo(eventId);
  }

  public async getEvidenceByReference(ref: string): Promise<EvidenceEvent | null> {
    const cleanRef = ref.trim().toUpperCase();
    return getEvidenceByRefFromDynamo(cleanRef);
  }

  public async getEvidenceByHash(hashHex: string): Promise<EvidenceEvent | null> {
    return getEvidenceByHashFromDynamo(hashHex);
  }

  public async getEventsForParcel(parcelId: string): Promise<EvidenceEvent[]> {
    return getEventsForParcelFromDynamo(parcelId);
  }

  public async getPendingEvents(): Promise<EvidenceEvent[]> {
    return getPendingEventsFromDynamo();
  }

  public async saveEvidenceEvent(event: EvidenceEvent): Promise<void> {
    await saveEvidenceToDynamo(event);
  }

  // --- Document Storage (S3) ---

  public async storeDocument(hashHex: string, content: string): Promise<void> {
    await uploadEvidenceToS3(`evidence/documents/${hashHex}.enc`, content, { sha256: hashHex });
  }

  // --- Audit Log Methods (all async, all DynamoDB) ---

  public async logAudit(event: Omit<AuditEvent, 'auditEventId' | 'occurredAt'>): Promise<AuditEvent> {
    const fullEvent: AuditEvent = {
      ...event,
      auditEventId: `aud-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`,
      occurredAt: new Date().toISOString()
    };
    await saveAuditToDynamo(fullEvent);
    return fullEvent;
  }

  public async getAuditLogs(filters?: {
    parcelId?: string;
    actorId?: string;
    action?: string;
  }): Promise<AuditEvent[]> {
    return getAuditLogsFromDynamo(filters);
  }
}

export const repository = new DataRepository();
