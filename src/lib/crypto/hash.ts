import { sha256 } from 'js-sha256';

/**
 * Calculates SHA-256 hash of text or binary buffer string canonically
 */
export function calculateSha256(content: string | ArrayBuffer): string {
  if (typeof content === 'string') {
    return sha256(content);
  }
  return sha256(new Uint8Array(content));
}

/**
 * Generates high-entropy verification reference in BHS-XXXX-XXXX format
 */
export function generateVerificationReference(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // exclude ambiguous characters 0,1,O,I
  let result = 'BHS-';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  result += '-';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Masks parcel reference for privacy in public outputs
 * e.g. "AP-GNT-SUR-2024-041" -> "AP-XX-***-041"
 */
export function maskParcelReference(stateParcelId: string): string {
  if (!stateParcelId) return 'XX-***-XXX';
  const parts = stateParcelId.split('-');
  if (parts.length >= 4) {
    const first = parts[0];
    const last = parts[parts.length - 1];
    return `${first}-XX-***-${last}`;
  }
  return `${stateParcelId.substring(0, 2)}-***-${stateParcelId.slice(-3)}`;
}
