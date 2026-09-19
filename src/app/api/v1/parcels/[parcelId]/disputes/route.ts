import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';
import { fabricLedgerEngine } from '@/lib/ledger/fabric-engine';
import { EvidenceEvent } from '@/lib/types/domain';
import { MOCK_USERS } from '@/lib/auth/rbac';
import { calculateSha256, generateVerificationReference } from '@/lib/crypto/hash';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ parcelId: string }> }
) {
  try {
    const { parcelId } = await params;
    const body = await req.json();
    const { actorId, disputeHold, disputeReason, disputeReference } = body;

    const user = MOCK_USERS[actorId] || MOCK_USERS['user-dispute-01'];
    const parcel = await repository.getParcelById(parcelId);

    if (!parcel) {
      return NextResponse.json({ error: `Parcel ${parcelId} not found` }, { status: 404 });
    }

    if (disputeHold && (!disputeReason || !disputeReference)) {
      return NextResponse.json({ error: 'Dispute reason and authoritative court/revenue reference are required for a dispute hold' }, { status: 400 });
    }

    const eventType = disputeHold ? 'DISPUTE_HOLD' : 'DISPUTE_RELEASE';
    const sha = calculateSha256(`${eventType}:${disputeReference}:${disputeReason}`);
    const vRef = generateVerificationReference();

    const disputeEvent: EvidenceEvent = {
      eventId: `evt-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`,
      parcelId,
      eventType,
      evidenceType: 'COURT_ORDER',
      sha256: sha,
      objectRef: `s3://bhusetu-evidence-459532536558-apsouth1/evidence/disputes/${sha.substring(0, 8)}.pdf.enc`,
      sourceSystem: user.name,
      sourceReference: disputeReference || 'RELEASE-REF',
      previousEventId: parcel.activeEventId,
      status: 'APPROVED',
      makerActorId: user.actorId,
      makerRole: user.role,
      checkerActorId: 'user-rev-checker-01',
      checkerRole: 'REVENUE_CHECKER',
      approvalReason: disputeReason || 'Dispute state update',
      verificationReference: vRef,
      createdAt: new Date().toISOString(),
      approvedAt: new Date().toISOString()
    };

    // Commit dispute event to Fabric Ledger
    const ledgerResult = fabricLedgerEngine.commitEvent(disputeEvent, ['RevenueOrg', 'SurveyOrg']);
    disputeEvent.ledgerTxId = ledgerResult.txId;
    disputeEvent.status = 'COMMITTED';
    await repository.saveEvidenceEvent(disputeEvent);

    // Update parcel state
    parcel.disputeHold = !!disputeHold;
    parcel.disputeReason = disputeHold ? disputeReason : undefined;
    parcel.disputeReference = disputeHold ? disputeReference : undefined;
    parcel.verificationStatus = disputeHold ? 'DISPUTED' : 'VERIFIED';
    parcel.activeEventId = disputeEvent.eventId;
    await repository.updateParcel(parcel);

    await repository.logAudit({
      correlationId: `req-${Math.random().toString(36).substring(2, 9)}`,
      actorId: user.actorId,
      actorRole: user.role,
      action: disputeHold ? 'FLAG_DISPUTE' : 'RELEASE_DISPUTE',
      resourceType: 'PARCEL',
      resourceId: parcelId,
      jurisdiction: 'AP/GNT/TNL',
      outcome: 'SUCCESS',
      details: { disputeReason, disputeReference, ledgerTxId: ledgerResult.txId }
    });

    return NextResponse.json({
      message: disputeHold ? 'Dispute hold flagged on parcel. Public verification updated to DISPUTED.' : 'Dispute hold released.',
      parcel,
      event: disputeEvent
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Dispute operation failed' }, { status: 500 });
  }
}
