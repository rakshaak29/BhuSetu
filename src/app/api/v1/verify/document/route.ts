import { NextRequest, NextResponse } from 'next/server';
import { calculateSha256, maskParcelReference } from '@/lib/crypto/hash';
import { repository } from '@/lib/db/repository';
import { PublicVerificationResponse, LEGAL_DISCLAIMER } from '@/lib/types/domain';

export async function POST(req: NextRequest) {
  try {
    let fileContent = '';
    let fileName = 'uploaded_document.pdf';

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      if (!file) {
        return NextResponse.json({ error: 'No document file uploaded' }, { status: 400 });
      }
      fileName = file.name;
      const buffer = await file.arrayBuffer();
      fileContent = new TextDecoder().decode(buffer);
    } else {
      const body = await req.json();
      fileContent = body.fileContent || body.content || '';
      fileName = body.fileName || fileName;
    }

    if (!fileContent) {
      return NextResponse.json({ error: 'Empty file content provided' }, { status: 400 });
    }

    const sha256Hash = calculateSha256(fileContent);
    const evidence = repository.getEvidenceByHash(sha256Hash);

    repository.logAudit({
      correlationId: `req-${Math.random().toString(36).substring(2, 9)}`,
      actorId: 'public-verifier',
      actorRole: 'CITIZEN',
      action: 'PUBLIC_VERIFY_FILE',
      resourceType: 'FILE_HASH',
      resourceId: sha256Hash,
      jurisdiction: 'AP/GNT/TNL',
      outcome: evidence ? 'SUCCESS' : 'DENIED',
      details: { fileName }
    });

    if (!evidence) {
      // Deterministic Mismatch Response (Agent Rules & UI Rules strictly enforced)
      const response: PublicVerificationResponse = {
        verificationReference: 'N/A',
        status: 'MISMATCH',
        statusMessage: 'The submitted evidence does not match any approved, authorized land record in the verification database. Do not rely on this document.',
        issuingAuthority: 'State Revenue Department',
        issuedAt: new Date().toISOString(),
        parcelReferenceMasked: 'XX-***-XXX',
        nextStep: 'Please verify that you have uploaded the official original document or contact the issuing Revenue/Registration office.',
        legalDisclaimer: LEGAL_DISCLAIMER
      };
      return NextResponse.json(response);
    }

    const parcel = repository.getParcelById(evidence.parcelId);
    const maskedParcelRef = parcel ? maskParcelReference(parcel.stateParcelId) : 'XX-***-XXX';

    if (parcel?.disputeHold) {
      const response: PublicVerificationResponse = {
        verificationReference: evidence.verificationReference,
        status: 'DISPUTED',
        statusMessage: `The document hash matches a record, but this parcel is currently subject to an authorized dispute/hold (${parcel.disputeReference || 'Court Order'}).`,
        issuingAuthority: evidence.sourceSystem,
        issuedAt: evidence.approvedAt || evidence.createdAt,
        parcelReferenceMasked: maskedParcelRef,
        evidenceType: evidence.evidenceType,
        nextStep: 'Contact the Tehsildar office or Civil Court regarding this dispute hold.',
        legalDisclaimer: LEGAL_DISCLAIMER
      };
      return NextResponse.json(response);
    }

    const response: PublicVerificationResponse = {
      verificationReference: evidence.verificationReference,
      status: 'VERIFIED',
      statusMessage: `Document hash matched! Fingerprint (SHA-256: ${sha256Hash.substring(0, 12)}...) matches an authorized record issued on ${new Date(evidence.approvedAt || evidence.createdAt).toLocaleDateString('en-IN')}.`,
      issuingAuthority: evidence.sourceSystem,
      issuedAt: evidence.approvedAt || evidence.createdAt,
      parcelReferenceMasked: maskedParcelRef,
      evidenceType: evidence.evidenceType,
      nextStep: 'For legal encumbrance certificates or certified copies, contact the Sub-Registrar office.',
      legalDisclaimer: LEGAL_DISCLAIMER
    };

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'File verification error' }, { status: 500 });
  }
}
