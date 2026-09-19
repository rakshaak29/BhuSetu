import assert from 'node:assert';
import {
  getAwsBudgetStatus,
  recordAwsOperation,
  toggleCircuitBreaker,
  simulateWorkload,
  resetBudget,
  AWS_CONFIG,
} from '../src/lib/aws/cost-guardrails';

console.log('====================================================');
console.log('   BhuSetu AWS Credits & Budget Guardrail Test Suite ');
console.log('====================================================\n');

// Test 1: Initial Baseline Configuration
console.log('Running Test 1: AWS Configuration & Initial Budget Baseline...');
resetBudget();
const initialStatus = getAwsBudgetStatus();
assert.strictEqual(initialStatus.pilotBudgetLimitUsd, 100.0, 'Budget limit must be $100.00 USD');
assert.strictEqual(initialStatus.region, 'ap-south-1', 'Target Region must be ap-south-1 (Mumbai)');
assert.strictEqual(initialStatus.currentAlertLevel, 'NOMINAL', 'Initial alert level must be NOMINAL');
assert.strictEqual(initialStatus.circuitBreakerActive, false, 'Circuit breaker must be inactive initially');
assert(initialStatus.currentSpendUsd < 10.0, 'Baseline spend must be under $10.00');
console.log('✓ Test 1 Passed: AWS Budget initialized with $100 limit in ap-south-1.\n');

// Test 2: Incremental AWS Usage & Micro-cost calculations
console.log('Running Test 2: Micro-Cost Calculations Across Services...');
const updatedAfterDynamo = recordAwsOperation('dynamodb', 20000, 'Test 20k DynamoDB reads');
assert(updatedAfterDynamo.services.dynamodb.quantity >= 20000, 'DynamoDB usage should increase');
assert(updatedAfterDynamo.currentSpendUsd >= initialStatus.currentSpendUsd, 'Spend must increase with usage');

const updatedAfterS3 = recordAwsOperation('s3_evidence', 500, 'Test 500 S3 Evidence uploads');
assert(updatedAfterS3.services.s3_evidence.quantity >= 500, 'S3 evidence uploads recorded');
console.log('✓ Test 2 Passed: DynamoDB and S3 micro-operations tracked accurately.\n');

// Test 3: Threshold Alert Transitions ($10, $25, $50, $75)
console.log('Running Test 3: Budget Alert Threshold Transitions...');
simulateWorkload('cross_75_threshold');
const alertStatus75 = getAwsBudgetStatus();
assert.strictEqual(alertStatus75.currentAlertLevel, 'WARNING_75', 'Alert level must transition to WARNING_75 at $75+');
assert(alertStatus75.currentSpendUsd >= 75.0, 'Spend must reflect crossed threshold');
assert(alertStatus75.percentUtilized >= 75.0, 'Percent utilized must exceed 75%');
console.log(`✓ Test 3 Passed: $75 Threshold Alert triggered at $${alertStatus75.currentSpendUsd} (utilization: ${alertStatus75.percentUtilized}%).\n`);

// Test 4: Circuit Breaker Engagement at $100 Limit
console.log('Running Test 4: Circuit Breaker Trip at 100% Budget Depletion...');
simulateWorkload('trip_circuit_breaker');
const circuitBreakerStatus = getAwsBudgetStatus();
assert.strictEqual(circuitBreakerStatus.currentAlertLevel, 'CIRCUIT_BREAKER_100', 'Alert must be CIRCUIT_BREAKER_100');
assert.strictEqual(circuitBreakerStatus.circuitBreakerActive, true, 'Circuit breaker must be active');
assert.strictEqual(circuitBreakerStatus.remainingCreditsUsd, 0, 'Remaining credits should be $0');

// Verify that further billable operations are blocked
let blockedErrorCaught = false;
try {
  recordAwsOperation('lambda', 1000, 'Should fail due to active circuit breaker');
} catch (err: unknown) {
  blockedErrorCaught = true;
  assert((err as Error).message.includes('Circuit Breaker Active'), 'Error message must specify active circuit breaker');
}
assert.strictEqual(blockedErrorCaught, true, 'Billable operations must throw error when circuit breaker is active');
console.log('✓ Test 4 Passed: Circuit Breaker halts downstream billable operations at $100 limit.\n');

// Test 5: Circuit Breaker Manual Override & Reset
console.log('Running Test 5: Manual Circuit Breaker Override & Reset...');
const overridden = toggleCircuitBreaker(false);
assert.strictEqual(overridden.circuitBreakerActive, false, 'Manual release should deactivate circuit breaker');

const reset = resetBudget();
assert.strictEqual(reset.currentAlertLevel, 'NOMINAL', 'Alert level must return to NOMINAL');
assert(reset.currentSpendUsd < 10.0, 'Spend should return to pilot baseline');
console.log('✓ Test 5 Passed: Circuit breaker released and budget reset to nominal baseline.\n');

console.log('====================================================');
console.log('   ALL 5 AWS BUDGET GUARDRAIL TESTS PASSED!         ');
console.log('====================================================\n');
