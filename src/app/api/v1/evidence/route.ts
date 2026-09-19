import { NextRequest, NextResponse } from 'next/server';
import { calculateSha256, generateVerificationReference } from '@/lib/crypto/hash';
import { repository } from '@/lib/db/repository';
import { EvidenceEvent } from '@/lib/types/domain';
import { MOCK_USERS } from '@/lib/auth/rbac';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { parcelId, evidenceType, sourceSystem, sourceReference, fileContent, actorId, approvalReason } = body;

    if (!parcelId || !evidenceType || !sourceSystem || !sourceReference || !fileContent || !actorId) {
      return NextResponse.json({ error: 'Missing required evidence submission fields' }, { status: 400 });
    }

    const user = MOCK_USERS[actorId] || MOCK_USERS['user-reg-maker-01'];
    const parcel = repository.getParcelById(parcelId);

    if (!parcel) {
      return NextResponse.json({ error: `Parcel ${parcelId} not found` }, { status: 404 });
    }

    const sha256Hash = calculateSha256(fileContent);
    const verificationRef = generateVerificationReference();

    // Store evidence document in mock off-chain S3
    repository.storeDocument(sha256Hash, fileContent);

    const newEvent: EvidenceEvent = {
      eventId: `evt-${Math.random().toString(36).substring(2, 9)}`,
      parcelId,
      eventType: parcel.activeEventId ? 'MUTATION' : 'ISSUE',
      evidenceType,
      sha256: sha256Hash,
      objectRef: `s3://bhusetu-private-evidence/2026/09/${sha256Hash.substring(0, 10)}.pdf.enc`,
      sourceSystem,
      sourceReference,
      previousEventId: parcel.activeEventId,
      status: 'PENDING',
      makerActorId: user.actorId,
      makerRole: user.role,
      verificationReference: verificationRef,
      createdAt: new Date().toISOString()
    };

    repository.saveEvidenceEvent(newEvent);

    repository.logAudit({
      correlationId: `req-${Math.random().toString(36).substring(2, 9)}`,
      actorId: user.actorId,
      actorRole: user.role,
      action: 'SUBMIT_PENDING_EVIDENCE',
      resourceType: 'EVIDENCE_EVENT',
      resourceId: newEvent.eventId,
      jurisdiction: `${user.jurisdiction.stateCode}/${user.jurisdiction.districtCode}/${user.jurisdiction.tehsilCode}`,
      outcome: 'SUCCESS',
      details: { evidenceType, verificationRef, sha256: sha256Hash }
    });

    return NextResponse.json({
      message: 'Pending evidence submission created successfully. Maker-checker approval required.',
      event: newEvent
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Evidence submission failed' }, { status: 500 });
  }
}
