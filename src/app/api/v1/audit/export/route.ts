import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parcelId = searchParams.get('parcelId') || undefined;
    const actorId = searchParams.get('actorId') || undefined;
    const action = searchParams.get('action') || undefined;

    const logs = await repository.getAuditLogs({ parcelId, actorId, action });

    await repository.logAudit({
      correlationId: `req-${Math.random().toString(36).substring(2, 9)}`,
      actorId: 'user-auditor-01',
      actorRole: 'AUDITOR',
      action: 'EXPORT_AUDIT_LOGS',
      resourceType: 'AUDIT_EXPORT',
      resourceId: 'ALL',
      jurisdiction: 'AP/GNT/TNL',
      outcome: 'SUCCESS',
      details: { count: logs.length, filters: { parcelId, actorId, action } }
    });

    return NextResponse.json({
      exportTimestamp: new Date().toISOString(),
      recordCount: logs.length,
      auditEvents: logs
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Audit export failed' }, { status: 500 });
  }
}
