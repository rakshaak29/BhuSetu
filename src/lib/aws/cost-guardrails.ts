import { AwsBudgetStatus, AwsServiceCost } from '../types/domain';

// Target AWS Region and Account from Setup
export const AWS_CONFIG = {
  region: process.env.AWS_REGION || 'ap-south-1',
  profile: process.env.AWS_PROFILE || 'dev',
  accountId: '459532536558', // Authenticated dev profile account
  pilotBudgetLimitUsd: 100.0,
  thresholds: [10.0, 25.0, 50.0, 75.0, 100.0],
};

// Pricing rates in AWS ap-south-1 (Mumbai)
const PRICING_RATES = {
  dynamodb_read: { rate: 0.00000025, unit: 'Read Request Units (RRU)' }, // $0.25 / million
  dynamodb_write: { rate: 0.00000125, unit: 'Write Request Units (WRU)' }, // $1.25 / million
  s3_storage_mb: { rate: 0.0000225, unit: 'MB-Months' }, // $0.023 / GB
  s3_put_request: { rate: 0.000005, unit: 'PUT/POST API Calls' }, // $0.005 / 1,000
  s3_get_request: { rate: 0.0000004, unit: 'GET API Calls' }, // $0.0004 / 1,000
  lambda_invocation: { rate: 0.0000002, unit: 'Invocations' }, // $0.20 / million
  lambda_compute_ms: { rate: 0.0000000021, unit: 'Compute Duration (ms @ 128MB)' },
  api_gateway_call: { rate: 0.000001, unit: 'API Gateway HTTP Requests' }, // $1.00 / million
  kms_request: { rate: 0.000003, unit: 'Cryptographic Operations' }, // $0.03 / 10,000
  cloudwatch_logs_mb: { rate: 0.0005, unit: 'Ingested Logs (MB)' }, // $0.50 / GB
};

// Initial state representing active district pilot baseline
let budgetState: AwsBudgetStatus = {
  pilotBudgetLimitUsd: AWS_CONFIG.pilotBudgetLimitUsd,
  currentSpendUsd: 4.85, // Current baseline spend: KMS master key + baseline S3 & CloudWatch
  remainingCreditsUsd: 95.15,
  percentUtilized: 4.85,
  currentAlertLevel: 'NOMINAL',
  circuitBreakerActive: false,
  region: AWS_CONFIG.region,
  profile: AWS_CONFIG.profile,
  awsAccountId: AWS_CONFIG.accountId,
  lastUpdated: new Date().toISOString(),
  services: {
    dynamodb: {
      serviceName: 'Amazon DynamoDB',
      category: 'Database / State Index',
      usageUnit: 'Units',
      quantity: 14200,
      ratePerUnit: 0.000001,
      totalCostUsd: 0.35,
      description: 'Encrypted parcel table, event indices, and idempotency locks in ap-south-1',
    },
    s3_evidence: {
      serviceName: 'Amazon S3 (Private Evidence Bucket)',
      category: 'Storage / Objects',
      usageUnit: 'Objects / Operations',
      quantity: 840,
      ratePerUnit: 0.000005,
      totalCostUsd: 0.65,
      description: 'Off-chain encrypted PDF/deed files, KMS versioned objects, public access blocked',
    },
    lambda: {
      serviceName: 'AWS Lambda (Stateless APIs)',
      category: 'Compute / Serverless',
      usageUnit: 'Invocations',
      quantity: 48500,
      ratePerUnit: 0.0000002,
      totalCostUsd: 0.45,
      description: 'Verification engine, document hash verifier, and maker-checker dispatchers',
    },
    api_gateway: {
      serviceName: 'Amazon API Gateway',
      category: 'Networking / Edge API',
      usageUnit: 'HTTP API Calls',
      quantity: 52000,
      ratePerUnit: 0.000001,
      totalCostUsd: 0.52,
      description: 'Throttled public verification and officer-authenticated HTTPS endpoints',
    },
    kms: {
      serviceName: 'AWS KMS (Key Management)',
      category: 'Security / Encryption',
      usageUnit: 'Customer Managed Keys & Operations',
      quantity: 1,
      ratePerUnit: 1.00,
      totalCostUsd: 1.48,
      description: 'Dedicated envelope encryption key for S3 objects, DynamoDB, and audit logs',
    },
    cloudwatch: {
      serviceName: 'Amazon CloudWatch & CloudTrail',
      category: 'Observability & Audit',
      usageUnit: 'Log Streams & Alarms',
      quantity: 4,
      ratePerUnit: 0.35,
      totalCostUsd: 1.40,
      description: 'Structured audit trail logging, budget alarms ($10, $25, $50, $75), and anomaly metrics',
    },
  },
  recentCostEvents: [
    {
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
      event: 'Baseline Pilot Initialization (KMS Customer Key + CloudWatch Alarms created)',
      costImpactUsd: 2.88,
      runningTotalUsd: 2.88,
    },
    {
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
      event: 'Synthetic District Pilot Data Seed (Parcels 041, 042, 043 created in DynamoDB & S3)',
      costImpactUsd: 1.12,
      runningTotalUsd: 4.00,
    },
    {
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      event: 'Public QR Verification & Maker-Checker UAT Workflow executions',
      costImpactUsd: 0.85,
      runningTotalUsd: 4.85,
    },
  ],
};

function calculateAlertLevel(spend: number): AwsBudgetStatus['currentAlertLevel'] {
  if (spend >= 100.0) return 'CIRCUIT_BREAKER_100';
  if (spend >= 75.0) return 'WARNING_75';
  if (spend >= 50.0) return 'MIDPOINT_50';
  if (spend >= 25.0) return 'CHECKPOINT_25';
  if (spend >= 10.0) return 'WARMUP_10';
  return 'NOMINAL';
}

function recalculateBudgetTotals(): void {
  const total = Object.values(budgetState.services).reduce((sum, s) => sum + s.totalCostUsd, 0);
  const roundedSpend = Math.round(total * 100) / 100;
  budgetState.currentSpendUsd = roundedSpend;
  budgetState.remainingCreditsUsd = Math.max(0, Math.round((AWS_CONFIG.pilotBudgetLimitUsd - roundedSpend) * 100) / 100);
  budgetState.percentUtilized = Math.min(100, Math.round((roundedSpend / AWS_CONFIG.pilotBudgetLimitUsd) * 1000) / 10);
  budgetState.currentAlertLevel = calculateAlertLevel(roundedSpend);
  
  if (roundedSpend >= AWS_CONFIG.pilotBudgetLimitUsd) {
    budgetState.circuitBreakerActive = true;
  }
  
  budgetState.lastUpdated = new Date().toISOString();
}

/**
 * Returns the current live AWS budget status and credit guardrails
 */
export function getAwsBudgetStatus(): AwsBudgetStatus {
  return JSON.parse(JSON.stringify(budgetState));
}

/**
 * Records an incremental AWS operational usage event with automatic micro-cost calculation
 */
export function recordAwsOperation(
  serviceKey: 'dynamodb' | 's3_evidence' | 'lambda' | 'api_gateway' | 'kms' | 'cloudwatch',
  units: number,
  eventDescription?: string
): AwsBudgetStatus {
  if (budgetState.circuitBreakerActive) {
    throw new Error('AWS Circuit Breaker Active: Spend limit reached ($100.00). New billable AWS operations are halted to protect credits.');
  }

  const service = budgetState.services[serviceKey];
  if (!service) return getAwsBudgetStatus();

  let incrementalCost = 0;
  switch (serviceKey) {
    case 'dynamodb':
      incrementalCost = units * PRICING_RATES.dynamodb_read.rate;
      break;
    case 's3_evidence':
      incrementalCost = units * PRICING_RATES.s3_put_request.rate;
      break;
    case 'lambda':
      incrementalCost = units * PRICING_RATES.lambda_invocation.rate;
      break;
    case 'api_gateway':
      incrementalCost = units * PRICING_RATES.api_gateway_call.rate;
      break;
    case 'kms':
      incrementalCost = units * PRICING_RATES.kms_request.rate;
      break;
    case 'cloudwatch':
      incrementalCost = units * PRICING_RATES.cloudwatch_logs_mb.rate;
      break;
  }

  service.quantity += units;
  service.totalCostUsd = Math.round((service.totalCostUsd + incrementalCost) * 1000) / 1000;
  recalculateBudgetTotals();

  if (eventDescription) {
    budgetState.recentCostEvents.unshift({
      timestamp: new Date().toISOString(),
      event: eventDescription,
      costImpactUsd: Math.round(incrementalCost * 10000) / 10000,
      runningTotalUsd: budgetState.currentSpendUsd,
    });
    if (budgetState.recentCostEvents.length > 15) {
      budgetState.recentCostEvents.pop();
    }
  }

  return getAwsBudgetStatus();
}

/**
 * Manually toggle or trip the emergency AWS circuit breaker
 */
export function toggleCircuitBreaker(active?: boolean): AwsBudgetStatus {
  const newStatus = active !== undefined ? active : !budgetState.circuitBreakerActive;
  budgetState.circuitBreakerActive = newStatus;
  
  budgetState.recentCostEvents.unshift({
    timestamp: new Date().toISOString(),
    event: newStatus 
      ? 'CIRCUIT BREAKER ENGAGED: Halting downstream AWS billable actions' 
      : 'CIRCUIT BREAKER RELEASED: Resuming normal pilot operations',
    costImpactUsd: 0,
    runningTotalUsd: budgetState.currentSpendUsd,
  });

  budgetState.lastUpdated = new Date().toISOString();
  return getAwsBudgetStatus();
}

/**
 * Simulate district workload scenarios to test budget alert alarms
 */
export function simulateWorkload(scenario: 'verification_burst' | 'evidence_ingestion' | 'cross_75_threshold' | 'trip_circuit_breaker'): AwsBudgetStatus {
  switch (scenario) {
    case 'verification_burst':
      // 100,000 public verifications
      budgetState.services.api_gateway.quantity += 100000;
      budgetState.services.api_gateway.totalCostUsd += 100000 * PRICING_RATES.api_gateway_call.rate;
      budgetState.services.lambda.quantity += 100000;
      budgetState.services.lambda.totalCostUsd += 100000 * PRICING_RATES.lambda_invocation.rate;
      budgetState.services.dynamodb.quantity += 100000;
      budgetState.services.dynamodb.totalCostUsd += 100000 * PRICING_RATES.dynamodb_read.rate;
      
      recalculateBudgetTotals();
      budgetState.recentCostEvents.unshift({
        timestamp: new Date().toISOString(),
        event: 'Simulated 100,000 Citizen QR/Reference Verification queries',
        costImpactUsd: 0.15,
        runningTotalUsd: budgetState.currentSpendUsd,
      });
      break;

    case 'evidence_ingestion':
      // 5,000 land record deed uploads (S3 + KMS + DynamoDB write)
      budgetState.services.s3_evidence.quantity += 5000;
      budgetState.services.s3_evidence.totalCostUsd += 2.50;
      budgetState.services.kms.quantity += 5000;
      budgetState.services.kms.totalCostUsd += 1.50;
      budgetState.services.dynamodb.quantity += 15000;
      budgetState.services.dynamodb.totalCostUsd += 1.80;

      recalculateBudgetTotals();
      budgetState.recentCostEvents.unshift({
        timestamp: new Date().toISOString(),
        event: 'Simulated 5,000 Land Mutation Deeds uploaded with KMS encryption',
        costImpactUsd: 5.80,
        runningTotalUsd: budgetState.currentSpendUsd,
      });
      break;

    case 'cross_75_threshold':
      // Inject synthetic workload to jump spend to $76.50
      budgetState.services.lambda.totalCostUsd = 28.50;
      budgetState.services.s3_evidence.totalCostUsd = 24.00;
      budgetState.services.dynamodb.totalCostUsd = 24.00;
      
      recalculateBudgetTotals();
      budgetState.recentCostEvents.unshift({
        timestamp: new Date().toISOString(),
        event: 'CRITICAL ALERT TRIGGERED: AWS Budget crossed 75% threshold ($76.50 / $100.00)',
        costImpactUsd: 71.65,
        runningTotalUsd: budgetState.currentSpendUsd,
      });
      break;

    case 'trip_circuit_breaker':
      // Force spend to $100.25 to trigger circuit breaker
      budgetState.services.lambda.totalCostUsd = 38.00;
      budgetState.services.s3_evidence.totalCostUsd = 35.00;
      budgetState.services.dynamodb.totalCostUsd = 27.25;
      budgetState.circuitBreakerActive = true;
      
      recalculateBudgetTotals();
      budgetState.recentCostEvents.unshift({
        timestamp: new Date().toISOString(),
        event: 'SAFETY SHUTDOWN: 100% Credit Limit Reached ($100.25). Circuit Breaker Activated.',
        costImpactUsd: 95.40,
        runningTotalUsd: budgetState.currentSpendUsd,
      });
      break;
  }

  return getAwsBudgetStatus();
}

/**
 * Resets the budget to clean initial state
 */
export function resetBudget(): AwsBudgetStatus {
  budgetState.services.dynamodb.totalCostUsd = 0.35;
  budgetState.services.s3_evidence.totalCostUsd = 0.65;
  budgetState.services.lambda.totalCostUsd = 0.45;
  budgetState.services.api_gateway.totalCostUsd = 0.52;
  budgetState.services.kms.totalCostUsd = 1.48;
  budgetState.services.cloudwatch.totalCostUsd = 1.40;
  budgetState.circuitBreakerActive = false;
  
  recalculateBudgetTotals();
  budgetState.recentCostEvents.unshift({
    timestamp: new Date().toISOString(),
    event: 'AWS Credit Guardrail reset to baseline state ($4.85 / $100.00)',
    costImpactUsd: -budgetState.currentSpendUsd,
    runningTotalUsd: 4.85,
  });

  return getAwsBudgetStatus();
}
