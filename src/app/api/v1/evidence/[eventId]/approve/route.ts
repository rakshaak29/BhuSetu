import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';
import { fabricLedgerEngine } from '@/lib/ledger/fabric-engine';
import { MOCK_USERS } from '@/lib/auth/rbac';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const body = await req.json();
    const { actorId, approvalReason, action } = body;

    const user = MOCK_USERS[actorId] || MOCK_USERS['user-rev-checker-01'];
    const event = repository.getEvidenceEvent(eventId);

    if (!event) {
      return NextResponse.json({ error: `Evidence event ${eventId} not found` }, { status: 404 });
    }

    if (event.status !== 'PENDING') {
      return NextResponse.json({ error: `Event ${eventId} is already in ${event.status} status` }, { status: 400 });
    }

    // SERVER-SIDE MAKER-CHECKER SEPARATION ENFORCEMENT
    if (user.actorId === event.makerActorId) {
      repository.logAudit({
        correlationId: `req-${Math.random().toString(36).substring(2, 9)}`,
        actorId: user.actorId,
        actorRole: user.role,
        action: 'APPROVE_EVIDENCE_DENIED',
        resourceType: 'EVIDENCE_EVENT',
        resourceId: eventId,
        jurisdiction: 'AP/GNT/TNL',
        outcome: 'DENIED',
        details: { reason: 'Maker-checker violation: Creator attempted self-approval' }
      });

      return NextResponse.json({
        error: 'MAKER_CHECKER_VIOLATION: Creator cannot approve their own submission. Approval requires a distinct Revenue checker.'
      }, { status: 403 });
    }

    if (action === 'REJECT') {
      event.status = 'REJECTED';
      event.checkerActorId = user.actorId;
      event.checkerRole = user.role;
      event.approvalReason = approvalReason || 'Rejected during checker review';
      repository.saveEvidenceEvent(event);

      repository.logAudit({
        correlationId: `req-${Math.random().toString(36).substring(2, 9)}`,
        actorId: user.actorId,
        actorRole: user.role,
        action: 'REJECT_EVIDENCE',
        resourceType: 'EVIDENCE_EVENT',
        resourceId: eventId,
        jurisdiction: 'AP/GNT/TNL',
        outcome: 'SUCCESS'
      });

      return NextResponse.json({ message: 'Evidence event rejected', event });
    }

    // Approve event
    event.status = 'APPROVED';
    event.checkerActorId = user.actorId;
    event.checkerRole = user.role;
    event.approvalReason = approvalReason || 'Approved post maker-checker audit and source verification';
    event.approvedAt = new Date().toISOString();

    // Commit transaction to Hyperledger Fabric Ledger
    const ledgerResult = fabricLedgerEngine.commitEvent(event, ['RevenueOrg', 'RegistrationOrg']);
    event.ledgerTxId = ledgerResult.txId;
    event.status = 'COMMITTED';

    repository.saveEvidenceEvent(event);

    // Update Parcel active state
    const parcel = repository.getParcelById(event.parcelId);
    if (parcel) {
      parcel.activeEventId = event.eventId;
      if (!parcel.disputeHold) {
        parcel.verificationStatus = 'VERIFIED';
      }
      repository.updateParcel(parcel);
    }

    repository.logAudit({
      correlationId: `req-${Math.random().toString(36).substring(2, 9)}`,
      actorId: user.actorId,
      actorRole: user.role,
      action: 'APPROVE_AND_COMMIT_EVIDENCE',
      resourceType: 'EVIDENCE_EVENT',
      resourceId: eventId,
      jurisdiction: 'AP/GNT/TNL',
      outcome: 'SUCCESS',
      details: { ledgerTxId: ledgerResult.txId, blockNumber: ledgerResult.blockNumber }
    });

    return NextResponse.json({
      message: 'Evidence successfully approved and committed to permissioned ledger.',
      event,
      ledger: ledgerResult
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Approval failure' }, { status: 500 });
  }
}
