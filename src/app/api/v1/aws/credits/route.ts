import { NextRequest, NextResponse } from 'next/server';
import {
  getAwsBudgetStatus,
  recordAwsOperation,
  toggleCircuitBreaker,
  simulateWorkload,
  resetBudget,
} from '@/lib/aws/cost-guardrails';

export async function GET() {
  const status = getAwsBudgetStatus();
  return NextResponse.json(status);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, scenario, serviceKey, units, description, active } = body;

    switch (action) {
      case 'toggle_circuit_breaker': {
        const updated = toggleCircuitBreaker(active);
        return NextResponse.json(updated);
      }
      case 'simulate': {
        if (!scenario) {
          return NextResponse.json({ error: 'Missing simulation scenario' }, { status: 400 });
        }
        const updated = simulateWorkload(scenario);
        return NextResponse.json(updated);
      }
      case 'record_usage': {
        if (!serviceKey || !units) {
          return NextResponse.json({ error: 'Missing serviceKey or units' }, { status: 400 });
        }
        const updated = recordAwsOperation(serviceKey, units, description);
        return NextResponse.json(updated);
      }
      case 'reset': {
        const updated = resetBudget();
        return NextResponse.json(updated);
      }
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
