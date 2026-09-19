import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';
import { fabricLedgerEngine } from '@/lib/ledger/fabric-engine';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ parcelId: string }> }
) {
  try {
    const { parcelId } = await params;
    const parcel = await repository.getParcelById(parcelId);

    if (!parcel) {
      return NextResponse.json({ error: `Parcel ${parcelId} not found` }, { status: 404 });
    }

    const events = await repository.getEventsForParcel(parcelId);
    const ledgerBlocks = fabricLedgerEngine.getHistoryForParcel(parcelId);

    await repository.logAudit({
      correlationId: `req-${Math.random().toString(36).substring(2, 9)}`,
      actorId: 'authorized-officer',
      actorRole: 'REVENUE_CHECKER',
      action: 'VIEW_PARCEL_HISTORY',
      resourceType: 'PARCEL',
      resourceId: parcelId,
      jurisdiction: 'AP/GNT/TNL',
      outcome: 'SUCCESS'
    });

    return NextResponse.json({
      parcel,
      events,
      ledgerTimeline: ledgerBlocks
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'History lookup failed' }, { status: 500 });
  }
}
