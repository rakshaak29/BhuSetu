import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';

/**
 * GET /api/v1/evidence/pending
 * Returns all evidence events with PENDING status from DynamoDB
 */
export async function GET(req: NextRequest) {
  try {
    const events = await repository.getPendingEvents();

    return NextResponse.json({
      events,
      count: events.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch pending events' },
      { status: 500 }
    );
  }
}
