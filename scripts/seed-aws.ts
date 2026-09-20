/**
 * BhuSetu: Idempotent AWS Seed Script
 * 
 * Populates real DynamoDB tables with seed data.
 * Safe to run multiple times: checks for existing records before writing.
 * 
 * Usage: npx tsx scripts/seed-aws.ts
 */

import { sha256 } from 'js-sha256';

// Set AWS profile before importing SDK
process.env.AWS_PROFILE = process.env.AWS_PROFILE || 'dev';
process.env.AWS_REGION = process.env.AWS_REGION || 'ap-south-1';

import { DynamoDBClient, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

const REGION = 'ap-south-1';
const ACCOUNT_ID = '459532536558';
const BUCKET = `bhusetu-evidence-${ACCOUNT_ID}-apsouth1`;

const TABLES = {
  parcels: 'bhusetu-parcels',
  evidence: 'bhusetu-evidence',
  audit: 'bhusetu-audit',
};

const rawDdb = new DynamoDBClient({ region: REGION });
const ddb = DynamoDBDocumentClient.from(rawDdb, { marshallOptions: { removeUndefinedValues: true } });
const s3 = new S3Client({ region: REGION });

// ───────────────────────────────────────────────
// Synthetic Pilot Evidence Documents
// ───────────────────────────────────────────────

const DEMO_DOCS: Record<string, string> = {
  'doc-ror-041': 'OFFICIAL RECORD OF RIGHTS (ROR) EXTRACT - TEHSIL TENALI, GUNTUR DISTRICT. PARCEL AP-GNT-SUR-2024-041. AREA: 2.45 ACRES. CLASSIFICATION: WET AGRICULTURAL LAND.',
  'doc-deed-042': 'REGISTERED DEED OF CONVEYANCE - REG-2024-883921. TEHSIL TENALI. PARCEL AP-GNT-SUR-2024-042.',
  'doc-map-043': 'CADASTRAL MAP EXTRACT BHUNNAKSHA - ULPIN 14829301928471. PARCEL AP-GNT-SUR-2024-043.',
  'court-order-442': 'CIVIL SUIT OS 442/2025 INJUNCTION ORDER',
  'old-ror-2018': 'OLD ROR 2018 EXTRACT SUPERSEDED BY MUTATION ORDER MUT-2026-44819',
  'mutation-order-043': 'MUTATION ORDER MUT-2026-44819 - SUCCESSION TRANSFER. PARCEL AP-GNT-SUR-2024-043.',
};

function docHash(key: string): string {
  return sha256(DEMO_DOCS[key]);
}

// ───────────────────────────────────────────────
// Seed Data Definitions
// ───────────────────────────────────────────────

const PARCELS = [
  {
    parcelId: 'PCL-AP-GNT-041',
    stateCode: 'AP',
    districtCode: 'GNT',
    tehsilCode: 'TNL',
    stateParcelId: 'AP-GNT-SUR-2024-041',
    ulpin: '14829301928471',
    activeEventId: 'evt-041-issue',
    verificationStatus: 'VERIFIED',
    disputeHold: false,
    updatedAt: '2026-09-10T11:30:00Z',
    version: 1,
  },
  {
    parcelId: 'PCL-AP-GNT-042',
    stateCode: 'AP',
    districtCode: 'GNT',
    tehsilCode: 'TNL',
    stateParcelId: 'AP-GNT-SUR-2024-042',
    ulpin: '14829301928472',
    activeEventId: 'evt-042-dispute',
    verificationStatus: 'DISPUTED',
    disputeHold: true,
    disputeReason: 'Interim injunction order by District Civil Court Tenali',
    disputeReference: 'COURT-OS-442-2025',
    updatedAt: '2026-09-12T09:15:00Z',
    version: 1,
  },
  {
    parcelId: 'PCL-AP-GNT-043',
    stateCode: 'AP',
    districtCode: 'GNT',
    tehsilCode: 'TNL',
    stateParcelId: 'AP-GNT-SUR-2024-043',
    ulpin: '14829301928473',
    activeEventId: 'evt-043-mutation-new',
    verificationStatus: 'VERIFIED',
    disputeHold: false,
    updatedAt: '2026-09-15T15:00:00Z',
    version: 2,
  },
];

const EVIDENCE_EVENTS = [
  {
    eventId: 'evt-041-issue',
    parcelId: 'PCL-AP-GNT-041',
    eventType: 'ISSUE',
    evidenceType: 'ROR_EXTRACT',
    sha256: docHash('doc-ror-041'),
    objectRef: `s3://${BUCKET}/evidence/2026/09/doc-ror-041.pdf.enc`,
    sourceSystem: 'Meeseva / AP Revenue Portal',
    sourceReference: 'AP-REV-2024-99812',
    status: 'APPROVED',
    makerActorId: 'user-reg-maker-01',
    makerRole: 'REGISTRATION_MAKER',
    checkerActorId: 'user-rev-checker-01',
    checkerRole: 'REVENUE_CHECKER',
    approvalReason: 'Initial verified district pilot ingestion',
    verificationReference: 'BHS-2M7D-9KQX',
    ledgerTxId: 'tx-fb-041-genesis-commit',
    createdAt: '2026-09-10T10:00:00Z',
    approvedAt: '2026-09-10T11:30:00Z',
  },
  {
    eventId: 'evt-042-dispute',
    parcelId: 'PCL-AP-GNT-042',
    eventType: 'DISPUTE_HOLD',
    evidenceType: 'COURT_ORDER',
    sha256: docHash('court-order-442'),
    objectRef: `s3://${BUCKET}/evidence/2026/09/court-order-442.pdf.enc`,
    sourceSystem: 'District Civil Court Tenali',
    sourceReference: 'COURT-OS-442-2025',
    status: 'APPROVED',
    makerActorId: 'user-dispute-01',
    makerRole: 'DISPUTE_LIAISON',
    checkerActorId: 'user-rev-checker-01',
    checkerRole: 'REVENUE_CHECKER',
    approvalReason: 'Active civil injunction order pending title suit',
    verificationReference: 'BHS-88X9-4K2M',
    ledgerTxId: 'tx-fb-042-court-hold',
    createdAt: '2026-09-12T09:00:00Z',
    approvedAt: '2026-09-12T09:15:00Z',
  },
  {
    eventId: 'evt-043-mutation-old',
    parcelId: 'PCL-AP-GNT-043',
    eventType: 'ISSUE',
    evidenceType: 'REGISTERED_DEED',
    sha256: docHash('old-ror-2018'),
    objectRef: `s3://${BUCKET}/evidence/2018/doc-old.pdf.enc`,
    sourceSystem: 'AP Registration Department',
    sourceReference: 'REG-2018-00129',
    status: 'APPROVED',
    makerActorId: 'user-reg-maker-01',
    makerRole: 'REGISTRATION_MAKER',
    checkerActorId: 'user-rev-checker-01',
    checkerRole: 'REVENUE_CHECKER',
    verificationReference: 'BHS-99A1-ZZ01',
    ledgerTxId: 'tx-fb-043-old-commit',
    createdAt: '2018-05-10T10:00:00Z',
    approvedAt: '2018-05-10T11:00:00Z',
  },
  {
    eventId: 'evt-043-mutation-new',
    parcelId: 'PCL-AP-GNT-043',
    eventType: 'MUTATION',
    evidenceType: 'MUTATION_ORDER',
    sha256: docHash('mutation-order-043'),
    objectRef: `s3://${BUCKET}/evidence/2026/09/cadastral-map-043.pdf.enc`,
    sourceSystem: 'AP Revenue Portal / Mutation Registry',
    sourceReference: 'MUT-2026-44819',
    previousEventId: 'evt-043-mutation-old',
    status: 'APPROVED',
    makerActorId: 'user-reg-maker-01',
    makerRole: 'REGISTRATION_MAKER',
    checkerActorId: 'user-rev-checker-01',
    checkerRole: 'REVENUE_CHECKER',
    approvalReason: 'Approved succession mutation order',
    verificationReference: 'BHS-33F4-77P9',
    ledgerTxId: 'tx-fb-043-new-commit',
    createdAt: '2026-09-15T14:30:00Z',
    approvedAt: '2026-09-15T15:00:00Z',
  },
];

const S3_EVIDENCE_FILES = [
  { key: 'evidence/2026/09/doc-ror-041.pdf.enc', docKey: 'doc-ror-041' },
  { key: 'evidence/2026/09/court-order-442.pdf.enc', docKey: 'court-order-442' },
  { key: 'evidence/2026/09/cadastral-map-043.pdf.enc', docKey: 'doc-map-043' },
  { key: 'evidence/2018/doc-old.pdf.enc', docKey: 'old-ror-2018' },
  { key: 'evidence/2026/09/mutation-order-043.pdf.enc', docKey: 'mutation-order-043' },
];

// ───────────────────────────────────────────────
// Seed Logic
// ───────────────────────────────────────────────

async function tableExists(tableName: string): Promise<boolean> {
  try {
    await rawDdb.send(new DescribeTableCommand({ TableName: tableName }));
    return true;
  } catch {
    return false;
  }
}

async function itemExists(tableName: string, key: Record<string, string>): Promise<boolean> {
  try {
    const res = await ddb.send(new GetCommand({ TableName: tableName, Key: key }));
    return !!res.Item;
  } catch {
    return false;
  }
}

async function s3ObjectExists(key: string): Promise<boolean> {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║  BhuSetu: Idempotent AWS Seed Script        ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log(`Region: ${REGION} | Profile: ${process.env.AWS_PROFILE}`);
  console.log('');

  // 1. Verify tables exist
  for (const [name, tableName] of Object.entries(TABLES)) {
    const exists = await tableExists(tableName);
    console.log(`  DynamoDB Table ${tableName}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
    if (!exists) {
      console.error(`  ERROR: Table ${tableName} does not exist. Create it first.`);
      process.exit(1);
    }
  }
  console.log('');

  // 2. Seed parcels
  console.log('📦 Seeding Parcels...');
  for (const parcel of PARCELS) {
    const exists = await itemExists(TABLES.parcels, { parcelId: parcel.parcelId });
    if (exists) {
      console.log(`  ⏭️  ${parcel.parcelId} already exists, skipping`);
    } else {
      await ddb.send(new PutCommand({ TableName: TABLES.parcels, Item: parcel }));
      console.log(`  ✅ Created ${parcel.parcelId} (${parcel.verificationStatus})`);
    }
  }
  console.log('');

  // 3. Seed evidence events
  console.log('📄 Seeding Evidence Events...');
  for (const evt of EVIDENCE_EVENTS) {
    const exists = await itemExists(TABLES.evidence, { eventId: evt.eventId });
    if (exists) {
      console.log(`  ⏭️  ${evt.eventId} already exists, skipping`);
    } else {
      await ddb.send(new PutCommand({ TableName: TABLES.evidence, Item: evt }));
      console.log(`  ✅ Created ${evt.eventId} (${evt.eventType} → ${evt.verificationReference})`);
    }
  }
  console.log('');

  // 4. Seed S3 evidence files
  console.log('🗂️  Seeding S3 Evidence Documents...');
  for (const file of S3_EVIDENCE_FILES) {
    const exists = await s3ObjectExists(file.key);
    if (exists) {
      console.log(`  ⏭️  s3://${BUCKET}/${file.key} already exists, skipping`);
    } else {
      const content = DEMO_DOCS[file.docKey] || 'PLACEHOLDER EVIDENCE DOCUMENT';
      await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: file.key,
        Body: Buffer.from(content, 'utf-8'),
        ContentType: 'application/octet-stream',
        ServerSideEncryption: 'AES256',
        Metadata: { sha256: sha256(content) },
      }));
      console.log(`  ✅ Uploaded s3://${BUCKET}/${file.key}`);
    }
  }
  console.log('');

  // 5. Verify counts
  const parcelScan = await ddb.send(new ScanCommand({ TableName: TABLES.parcels, Select: 'COUNT' }));
  const evidenceScan = await ddb.send(new ScanCommand({ TableName: TABLES.evidence, Select: 'COUNT' }));
  const auditScan = await ddb.send(new ScanCommand({ TableName: TABLES.audit, Select: 'COUNT' }));

  console.log('═══════════════════════════════════════════════');
  console.log('  Final Counts:');
  console.log(`    Parcels:  ${parcelScan.Count}`);
  console.log(`    Evidence: ${evidenceScan.Count}`);
  console.log(`    Audit:    ${auditScan.Count}`);
  console.log('═══════════════════════════════════════════════');
  console.log('✅ Seed complete. All pilot data is in real AWS.');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
