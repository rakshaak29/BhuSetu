import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';

/**
 * GET /api/v1/parcels
 * Returns all parcels from DynamoDB
 */
export async function GET(req: NextRequest) {
  try {
    const parcels = await repository.getAllParcels();

    await repository.logAudit({
      correlationId: `req-${Math.random().toString(36).substring(2, 9)}`,
      actorId: 'authorized-officer',
      actorRole: 'REVENUE_CHECKER',
      action: 'LIST_PARCELS',
      resourceType: 'PARCEL',
      resourceId: 'ALL',
      jurisdiction: 'AP/GNT/TNL',
      outcome: 'SUCCESS',
      details: { count: parcels.length },
    });

    return NextResponse.json({
      parcels,
      count: parcels.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch parcels' },
      { status: 500 }
    );
  }
}
