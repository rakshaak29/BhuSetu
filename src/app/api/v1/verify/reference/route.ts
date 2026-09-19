import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';
import { maskParcelReference } from '@/lib/crypto/hash';
import { PublicVerificationResponse, LEGAL_DISCLAIMER } from '@/lib/types/domain';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reference } = body;

    if (!reference || typeof reference !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request: Verification reference is required' },
        { status: 400 }
      );
    }

    const cleanRef = reference.trim().toUpperCase();
    const evidence = await repository.getEvidenceByReference(cleanRef);

    // Audit trace for public verification check
    await repository.logAudit({
      correlationId: `req-${Math.random().toString(36).substring(2, 9)}`,
      actorId: 'public-verifier',
      actorRole: 'CITIZEN',
      action: 'PUBLIC_VERIFY_REF',
      resourceType: 'VERIFICATION_REF',
      resourceId: cleanRef,
      jurisdiction: 'AP/GNT/TNL',
      outcome: evidence ? 'SUCCESS' : 'DENIED'
    });

    if (!evidence) {
      const response: PublicVerificationResponse = {
        verificationReference: cleanRef,
        status: 'UNAVAILABLE',
        statusMessage: 'No verifiable record is available for this reference. Check the reference or contact the competent authority.',
        issuingAuthority: 'State Revenue Department',
        issuedAt: new Date().toISOString(),
        parcelReferenceMasked: 'XX-***-XXX',
        nextStep: 'Contact the issuing Revenue/Registration authority with your document details.',
        legalDisclaimer: LEGAL_DISCLAIMER
      };
      return NextResponse.json(response);
    }

    const parcel = await repository.getParcelById(evidence.parcelId);
    const maskedParcelRef = parcel ? maskParcelReference(parcel.stateParcelId) : 'XX-***-XXX';

    // Status evaluation rules (Dispute overrides verified; Superseded overrides verified)
    if (parcel?.disputeHold || evidence.eventType === 'DISPUTE_HOLD') {
      const response: PublicVerificationResponse = {
        verificationReference: evidence.verificationReference,
        status: 'DISPUTED',
        statusMessage: `This record is subject to an authorized dispute or legal hold (${parcel?.disputeReference || evidence.sourceReference}). Seek the competent authority.`,
        issuingAuthority: evidence.sourceSystem,
        issuedAt: evidence.approvedAt || evidence.createdAt,
        parcelReferenceMasked: maskedParcelRef,
        evidenceType: evidence.evidenceType,
        nextStep: 'Contact the District Civil Court or Tehsildar Office for official status regarding this dispute hold.',
        legalDisclaimer: LEGAL_DISCLAIMER
      };
      return NextResponse.json(response);
    }

    if (evidence.status === 'PENDING') {
      const response: PublicVerificationResponse = {
        verificationReference: evidence.verificationReference,
        status: 'PENDING_REVIEW',
        statusMessage: 'Verification is pending official review by an authorized Revenue checker.',
        issuingAuthority: evidence.sourceSystem,
        issuedAt: evidence.createdAt,
        parcelReferenceMasked: maskedParcelRef,
        evidenceType: evidence.evidenceType,
        nextStep: 'Please check back after official review is completed.',
        legalDisclaimer: LEGAL_DISCLAIMER
      };
      return NextResponse.json(response);
    }

    if (parcel && parcel.activeEventId !== evidence.eventId) {
      const response: PublicVerificationResponse = {
        verificationReference: evidence.verificationReference,
        status: 'SUPERSEDED',
        statusMessage: 'This version of evidence has been replaced by a newer authorized mutation or correction event.',
        issuingAuthority: evidence.sourceSystem,
        issuedAt: evidence.approvedAt || evidence.createdAt,
        parcelReferenceMasked: maskedParcelRef,
        evidenceType: evidence.evidenceType,
        nextStep: 'View the latest authorized reference or request an updated extract from the competent authority.',
        legalDisclaimer: LEGAL_DISCLAIMER
      };
      return NextResponse.json(response);
    }

    // Default Verified state
    const response: PublicVerificationResponse = {
      verificationReference: evidence.verificationReference,
      status: 'VERIFIED',
      statusMessage: `Evidence matches an authorized record issued on ${new Date(evidence.approvedAt || evidence.createdAt).toLocaleDateString('en-IN')}.`,
      issuingAuthority: evidence.sourceSystem,
      issuedAt: evidence.approvedAt || evidence.createdAt,
      parcelReferenceMasked: maskedParcelRef,
      evidenceType: evidence.evidenceType,
      nextStep: 'For official certified extracts or encumbrance queries, contact the competent Revenue/Registration authority.',
      legalDisclaimer: LEGAL_DISCLAIMER
    };

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Verification failure' }, { status: 500 });
  }
}
