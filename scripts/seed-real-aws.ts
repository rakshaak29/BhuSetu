import {
  uploadEvidenceToS3,
  saveParcelToDynamo,
  saveEvidenceToDynamo,
  saveAuditToDynamo,
  getRealAwsStorageStats,
  REAL_AWS_RESOURCES,
} from '../src/lib/aws/aws-client';
import { calculateSha256 } from '../src/lib/crypto/hash';
import { Parcel, EvidenceEvent, AuditEvent } from '../src/lib/types/domain';

async function seedRealAws() {
  console.log('====================================================');
  console.log('   BhuSetu: Seeding Real AWS S3 & DynamoDB Systems   ');
  console.log('====================================================');
  console.log(`Target AWS Region: ${REAL_AWS_RESOURCES.region}`);
  console.log(`Target AWS Account: ${REAL_AWS_RESOURCES.accountId}`);
  console.log(`Target S3 Bucket: ${REAL_AWS_RESOURCES.s3EvidenceBucket}`);
  console.log(`Target DynamoDB Tables: ${JSON.stringify(REAL_AWS_RESOURCES.tables)}\n`);

  // 1. Seed Real Evidence Documents into S3
  console.log('Step 1: Uploading canonical land record evidence files to real Amazon S3...');
  
  const docRor041 = `OFFICIAL RECORD OF RIGHTS (ROR) EXTRACT - TEHSIL TENALI, GUNTUR DISTRICT. PARCEL AP-GNT-SUR-2024-041. AREA: 2.45 ACRES. CLASSIFICATION: WET AGRICULTURAL LAND. ISSUED BY AP REVENUE DEPARTMENT.`;
  const sha041 = calculateSha256(docRor041);
  const s3Upload041 = await uploadEvidenceToS3('evidence/2026/09/doc-ror-041.pdf.enc', docRor041, {
    parcelId: 'PCL-AP-GNT-041',
    sha256: sha041,
    evidenceType: 'ROR_EXTRACT',
  });
  console.log(`✓ S3 Object Uploaded: ${s3Upload041.s3Uri} (SHA-256: ${sha041.substring(0, 16)}...)`);

  const docCourt042 = `CIVIL SUIT OS 442/2025 INJUNCTION ORDER. DISTRICT CIVIL COURT TENALI. PARCEL AP-GNT-SUR-2024-042. RESTRAINING REGISTRATION OR MUTATION PENDING TITLE ADJUDICATION.`;
  const sha042 = calculateSha256(docCourt042);
  const s3Upload042 = await uploadEvidenceToS3('evidence/2026/09/court-order-442.pdf.enc', docCourt042, {
    parcelId: 'PCL-AP-GNT-042',
    sha256: sha042,
    evidenceType: 'COURT_ORDER',
  });
  console.log(`✓ S3 Object Uploaded: ${s3Upload042.s3Uri} (SHA-256: ${sha042.substring(0, 16)}...)`);

  const docMap043 = `CADASTRAL MAP EXTRACT BHUNAKSHA - ULPIN 14829301928471. PARCEL AP-GNT-SUR-2024-043. BOUNDARY SURVEY COMPLETED BY AP SURVEY DEPARTMENT.`;
  const sha043 = calculateSha256(docMap043);
  const s3Upload043 = await uploadEvidenceToS3('evidence/2026/09/cadastral-map-043.pdf.enc', docMap043, {
    parcelId: 'PCL-AP-GNT-043',
    sha256: sha043,
    evidenceType: 'CADASTRAL_MAP',
  });
  console.log(`✓ S3 Object Uploaded: ${s3Upload043.s3Uri} (SHA-256: ${sha043.substring(0, 16)}...)\n`);

  // 2. Seed Real Parcels into DynamoDB
  console.log('Step 2: Writing authoritative parcels to real Amazon DynamoDB (bhusetu-parcels)...');
  const parcels: Parcel[] = [
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

  for (const pcl of parcels) {
    await saveParcelToDynamo(pcl);
    console.log(`✓ DynamoDB Item Saved: ${pcl.parcelId} (${pcl.verificationStatus})`);
  }

  // 3. Seed Real Evidence Events into DynamoDB
  console.log('\nStep 3: Writing evidence events to real Amazon DynamoDB (bhusetu-evidence)...');
  const events: EvidenceEvent[] = [
    {
      eventId: 'evt-041-issue',
      parcelId: 'PCL-AP-GNT-041',
      eventType: 'ISSUE',
      evidenceType: 'ROR_EXTRACT',
      sha256: sha041,
      objectRef: s3Upload041.s3Uri,
      sourceSystem: 'Meeseva / AP Revenue Portal',
      sourceReference: 'AP-REV-2024-99812',
      status: 'APPROVED',
      makerActorId: 'user-reg-maker-01',
      makerRole: 'REGISTRATION_MAKER',
      checkerActorId: 'user-rev-checker-01',
      checkerRole: 'REVENUE_CHECKER',
      approvalReason: 'Initial verified district pilot ingestion',
      verificationReference: 'BHS-2M7D-9KQX',
      createdAt: '2026-09-10T10:00:00Z',
      approvedAt: '2026-09-10T11:30:00Z',
      ledgerTxId: 'tx-fb-041-genesis-commit',
    },
    {
      eventId: 'evt-042-dispute',
      parcelId: 'PCL-AP-GNT-042',
      eventType: 'DISPUTE_HOLD',
      evidenceType: 'COURT_ORDER',
      sha256: sha042,
      objectRef: s3Upload042.s3Uri,
      sourceSystem: 'District Civil Court Tenali',
      sourceReference: 'COURT-OS-442-2025',
      status: 'APPROVED',
      makerActorId: 'user-dispute-01',
      makerRole: 'DISPUTE_LIAISON',
      checkerActorId: 'user-rev-checker-01',
      checkerRole: 'REVENUE_CHECKER',
      approvalReason: 'Active civil injunction order pending title suit',
      verificationReference: 'BHS-88X9-4K2M',
      createdAt: '2026-09-12T09:00:00Z',
      approvedAt: '2026-09-12T09:15:00Z',
      ledgerTxId: 'tx-fb-042-court-hold',
    },
    {
      eventId: 'evt-043-mutation-old',
      parcelId: 'PCL-AP-GNT-043',
      eventType: 'ISSUE',
      evidenceType: 'REGISTERED_DEED',
      sha256: calculateSha256('PRIOR SALE DEED REG 2018'),
      objectRef: 's3://bhusetu-evidence-459532536558-apsouth1/evidence/2018/doc-old.pdf.enc',
      sourceSystem: 'AP Registration Department',
      sourceReference: 'REG-2018-00129',
      status: 'APPROVED',
      makerActorId: 'user-reg-maker-01',
      makerRole: 'REGISTRATION_MAKER',
      checkerActorId: 'user-rev-checker-01',
      checkerRole: 'REVENUE_CHECKER',
      verificationReference: 'BHS-99A1-ZZ01',
      createdAt: '2018-05-10T10:00:00Z',
      approvedAt: '2018-05-10T11:00:00Z',
      ledgerTxId: 'tx-fb-043-old-commit',
    },
    {
      eventId: 'evt-043-mutation-new',
      parcelId: 'PCL-AP-GNT-043',
      eventType: 'MUTATION',
      evidenceType: 'MUTATION_ORDER',
      sha256: sha043,
      objectRef: s3Upload043.s3Uri,
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
      createdAt: '2026-09-15T14:30:00Z',
      approvedAt: '2026-09-15T15:00:00Z',
      ledgerTxId: 'tx-fb-043-new-commit',
    },
  ];

  for (const evt of events) {
    await saveEvidenceToDynamo(evt);
    console.log(`✓ DynamoDB Item Saved: ${evt.eventId} (Ref: ${evt.verificationReference})`);
  }

  // 4. Seed Real Audit Events into DynamoDB
  console.log('\nStep 4: Writing audit records to real Amazon DynamoDB (bhusetu-audit)...');
  const auditLogs: AuditEvent[] = [
    {
      auditEventId: 'audit-001-init',
      correlationId: 'req-sys-init-001',
      actorId: 'system-pilot-admin',
      actorRole: 'ADMIN',
      action: 'INIT_PILOT_DISTRICT',
      resourceType: 'PARCEL',
      resourceId: 'PCL-AP-GNT-041',
      jurisdiction: 'AP/GNT/TNL',
      outcome: 'SUCCESS',
      occurredAt: '2026-09-10T10:00:00Z',
    },
    {
      auditEventId: 'audit-002-court',
      correlationId: 'req-dispute-442',
      actorId: 'user-dispute-01',
      actorRole: 'DISPUTE_LIAISON',
      action: 'FLAG_DISPUTE_HOLD',
      resourceType: 'PARCEL',
      resourceId: 'PCL-AP-GNT-042',
      jurisdiction: 'AP/GNT/TNL',
      outcome: 'SUCCESS',
      occurredAt: '2026-09-12T09:15:00Z',
    },
  ];

  for (const audit of auditLogs) {
    await saveAuditToDynamo(audit);
    console.log(`✓ DynamoDB Audit Saved: ${audit.auditEventId} (${audit.action})`);
  }

  // 5. Query and Display Real Live Storage Metrics
  console.log('\nStep 5: Verifying live storage metrics on real AWS account...');
  const stats = await getRealAwsStorageStats();
  console.log('Live S3 Bucket Status:', stats.s3);
  console.log('Live DynamoDB Tables Status:', stats.dynamodb);
  console.log('\n====================================================');
  console.log('   SUCCESS: Real AWS S3 & DynamoDB Seeded Fully!    ');
  console.log('====================================================');
}

seedRealAws().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
