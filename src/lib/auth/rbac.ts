import { UserRole, Jurisdiction, UserSession } from '../types/domain';

export const MOCK_USERS: Record<string, UserSession> = {
  'user-citizen-01': {
    actorId: 'user-citizen-01',
    name: 'Citizen / Public Verifier',
    role: 'CITIZEN',
    jurisdiction: { stateCode: 'AP', districtCode: 'GNT', tehsilCode: 'TNL' }
  },
  'user-reg-maker-01': {
    actorId: 'user-reg-maker-01',
    name: 'K. Sitaram (Registration Officer - Maker)',
    role: 'REGISTRATION_MAKER',
    jurisdiction: { stateCode: 'AP', districtCode: 'GNT', tehsilCode: 'TNL' }
  },
  'user-rev-checker-01': {
    actorId: 'user-rev-checker-01',
    name: 'M. Venkat (Tahsildar / Revenue Checker)',
    role: 'REVENUE_CHECKER',
    jurisdiction: { stateCode: 'AP', districtCode: 'GNT', tehsilCode: 'TNL' }
  },
  'user-survey-01': {
    actorId: 'user-survey-01',
    name: 'R. Naidu (Survey & Settlement Officer)',
    role: 'SURVEY_OFFICER',
    jurisdiction: { stateCode: 'AP', districtCode: 'GNT', tehsilCode: 'TNL' }
  },
  'user-dispute-01': {
    actorId: 'user-dispute-01',
    name: 'P. Rao (District Court / Revenue Dispute Liaison)',
    role: 'DISPUTE_LIAISON',
    jurisdiction: { stateCode: 'AP', districtCode: 'GNT', tehsilCode: 'TNL' }
  },
  'user-auditor-01': {
    actorId: 'user-auditor-01',
    name: 'S. Verma (State Land Administration Auditor)',
    role: 'AUDITOR',
    jurisdiction: { stateCode: 'AP', districtCode: 'GNT', tehsilCode: 'TNL' }
  }
};

/**
 * Checks if a user role can perform a specific action
 */
export function canPerformAction(role: UserRole, action: string): boolean {
  switch (action) {
    case 'PUBLIC_VERIFY':
      return true; // Everyone can publicly verify reference or file hash
    case 'SUBMIT_EVIDENCE':
      return ['REGISTRATION_MAKER', 'REVENUE_CHECKER', 'SURVEY_OFFICER', 'ADMIN'].includes(role);
    case 'APPROVE_EVIDENCE':
      return ['REVENUE_CHECKER', 'ADMIN'].includes(role);
    case 'FLAG_DISPUTE':
    case 'RELEASE_DISPUTE':
      return ['DISPUTE_LIAISON', 'REVENUE_CHECKER', 'ADMIN'].includes(role);
    case 'VIEW_AUDIT_TRAIL':
      return ['AUDITOR', 'ADMIN'].includes(role);
    case 'EXPORT_AUDIT':
      return ['AUDITOR', 'ADMIN'].includes(role);
    case 'VIEW_FULL_PARCEL_DETAILS':
      return role !== 'CITIZEN';
    default:
      return false;
  }
}

/**
 * Enforces jurisdiction scoping matching target state/district/tehsil
 */
export function matchesJurisdiction(userJur: Jurisdiction, targetJur: Jurisdiction): boolean {
  return (
    userJur.stateCode === targetJur.stateCode &&
    userJur.districtCode === targetJur.districtCode &&
    userJur.tehsilCode === targetJur.tehsilCode
  );
}
