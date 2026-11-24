/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Membership begins with a share purchase (fineract-dbug ADR 0023), with the rules each cooperative chooses (ADR 0035).
 * Shapes of /nepal/memberships.
 */

import { TranslateService } from '@ngx-translate/core';
import {
  RelationshipOption,
  relationshipLabel,
  relationshipText
} from 'app/shared/relationship-select/relationship-select.component';

export type { RelationshipOption };
export { relationshipLabel };

export type MembershipStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

/** When the money for the shares and charges is taken. */
export type PaymentTaken = 'AT_APPROVAL' | 'AT_APPLICATION';

export interface ChargeOption {
  id: number;
  name: string;
  amount: number;
}

export interface Nominee {
  name: string;
  /** The text typed before the list; on a saved nominee chosen from the list, e.g. "Guardian: uncle" */
  relationship?: string;
  /** The {@link RelationshipOption.code} chosen; absent on a nominee typed before the list */
  relationshipCode?: string;
  /** Only when the chosen entry needs detail, e.g. what kind of guardian */
  relationshipDetail?: string;
  relationshipLabelEn?: string;
  mobileNo?: string;
}

/** A person's nominee as it is now and the ones before (GET /nepal/memberships/nominees/{clientId}, fineract-dbug ADR-0047). */
export interface MemberNominee {
  clientId: number;
  accountNo: string;
  name: string;
  /** null when the person has named nobody */
  nominee: Nominee | null;
  /** False for an organisation and for a client who is neither an applicant nor a member */
  canChange: boolean;
  /** Every change, newest first; a null nominee means there was none before that change */
  previous: { nominee: Nominee | null; replacedOn: string; replacedBy: string; note?: string | null }[];
}

export interface MembershipApplication {
  id: number;
  clientId: number;
  accountNo: string;
  name: string;
  mobileNo?: string;
  officeId: number;
  officeName: string;
  shareProductId: number;
  shareProductName: string;
  kitta: number;
  /** kitta × the share product's unit price */
  shareAmount: number;
  /** The share product's charges, taken with the shares */
  charges: ChargeOption[];
  /** shareAmount plus the charges */
  amountDue: number;
  savingsProductId: number;
  /** The application date (the original date, for an existing application) */
  submittedOn: string;
  submittedById?: number;
  submittedBy?: string;
  /** When it was keyed in */
  enteredOn?: string;
  /** An existing application entered afterwards with its original date */
  enteredLate: boolean;
  status: MembershipStatus;
  decidedOn?: string;
  decidedBy?: string;
  rejectionReason?: string;
  approvalNote?: string;
  savingsAccountId?: number;
  shareAccountId?: number;
  note?: string;
  /** The money was taken when the application was entered */
  paidAtApplication: boolean;
  amountReceived?: number;
  paidOn?: string;
  receiptNumber?: string;
  refundAmount?: number;
  refundReceiptNumber?: string;
  citizenshipNumber?: string;
  citizenshipDistrictCode?: string;
  citizenshipDistrictName?: string;
  nominee?: Nominee;
  /** Only while PENDING */
  daysElapsed?: number;
  /** Only while PENDING and when the cooperative has a decision deadline; negative once overdue */
  daysRemaining?: number;
  overdue: boolean;
  /** An organisation applying (legal form Entity): no citizenship, no nominee */
  organisation?: boolean;
  /** Only while PENDING: how many items the applicant's KYM still lacks */
  kymMissing?: number;
}

export interface MembershipSettings {
  shareFirstEnabled: boolean;
  savingsProductId?: number;
  shareProductId?: number;
  /** null when there is no decision deadline */
  decisionDays: number | null;
  /** The person who entered an application cannot approve or refuse it */
  separateApprover: boolean;
  paymentTaken: PaymentTaken;
  nomineeRequired: boolean;
  /** The nominee's relationship must be chosen from the list; typed text is refused */
  nomineeRelationshipFromList?: boolean;
  /** Approval waits for a complete KYM (on by default, fineract-dbug ADR 0042) */
  kymRequiredForApproval?: boolean;
  /** The most of the share capital one member may hold, 1 to 100; null switches the check off (fineract-dbug #125) */
  shareCeilingPercent?: number | null;
  /** A member's last shares are paid back only when the member owes and guarantees nothing */
  exitOnlyWhenSettled?: boolean;
}

export interface ShareProductOption {
  id: number;
  name: string;
  unitPrice: number;
  minimumShares?: number;
  maximumShares?: number;
  charges: ChargeOption[];
  /** False when share money and fees will not reach the books */
  hasAccounting: boolean;
}

export interface MembershipTemplate {
  shareProducts: ShareProductOption[];
  savingsProducts: { id: number; name: string }[];
  settings: MembershipSettings;
}

export interface MembershipSettingsView {
  settings: MembershipSettings;
  activeMembersWithoutShares: number;
  /** Whether the chosen share product has accounting; null when none is chosen */
  shareProductHasAccounting: boolean | null;
}

/** An organisation type (Fineract's Constitution) and whether organisations of it may be members (fineract-dbug #127). */
export interface OrganisationCategory {
  /** The id in clientNonPersonConstitutionOptions, sent as clientNonPersonDetails.constitutionId */
  codeValueId: number;
  /** Absent on a type the cooperative added itself under Manage Codes */
  code?: string;
  name: string;
  mayBeMember: boolean;
}

/** The type in the user's language: organisationCategory.<CODE>, else the server's name. */
export function organisationCategoryLabel(translate: TranslateService, category: OrganisationCategory): string {
  if (!category.code) {
    return category.name;
  }
  const key = `organisationCategory.${category.code}`;
  const label = translate.instant(key);
  return label && label !== key ? label : category.name;
}

export interface MembersWithoutShares {
  count: number;
  members: { clientId: number; accountNo: string; name: string; officeName: string; activatedOn?: string }[];
}

export interface MembershipApplyRequest {
  /** A new person: the same object the Create Member stepper sends to POST /clients */
  client?: any;
  /** A person already entered: refused (applying again), or pending (an existing application) */
  clientId?: number;
  kitta: number;
  shareProductId?: number;
  note?: string;
  citizenshipNumber?: string;
  citizenshipDistrictCode?: string;
  nominee?: Nominee;
  /** Only when the money is taken at application */
  amountReceived?: number;
  receiptNumber?: string;
  /** yyyy-MM-dd: an existing application with its original date (ENTER_MEMBERSHIP) */
  submittedOn?: string;
}

export interface MembershipApproveRequest {
  /** yyyy-MM-dd; today when left out */
  date?: string;
  approvalNote?: string;
  receiptNumber?: string;
}

export interface MembershipRejectRequest {
  reason: string;
  /** yyyy-MM-dd; today when left out */
  date?: string;
  refundAmount?: number;
  refundReceiptNumber?: string;
}

/**
 * The nominee's relationship as shown: the label with any detail ("Guardian: uncle"), or, for a nominee typed before
 * the list, the text as it was typed.
 */
export function nomineeRelationshipText(nominee: Nominee, translate: TranslateService): string {
  return relationshipText(
    translate,
    nominee.relationshipCode,
    nominee.relationshipDetail,
    nominee.relationship,
    nominee.relationshipLabelEn
  );
}

/** The days-left chip: green with time to spare, amber in the last week, red once overdue. */
export type DeadlineTone = 'ok' | 'soon' | 'overdue';

/** Null when the application is decided, or the cooperative has no decision deadline. */
export function deadlineTone(application: MembershipApplication): DeadlineTone | null {
  if (application.status !== 'PENDING' || application.daysRemaining == null) {
    return null;
  }
  if (application.overdue) {
    return 'overdue';
  }
  return application.daysRemaining <= 7 ? 'soon' : 'ok';
}

export type LiabilityKind = 'LOAN' | 'GUARANTEE' | 'CHARGE' | 'OVERDRAWN_SAVINGS';
export type CeilingNote = 'OFF' | 'EXEMPT' | 'TOO_FEW_MEMBERS';
export type ExitStatus = 'REQUESTED' | 'SETTLED' | 'REFUNDED' | 'CANCELLED';

export interface ExitLiability {
  kind: LiabilityKind;
  reference?: string;
  otherParty?: string;
  amount?: number;
  description?: string;
}

/** A request to leave (fineract-dbug #125, docs/share-rules-and-leaving.md) */
export interface MembershipExit {
  id: number;
  clientId: number;
  accountNo: string;
  name: string;
  officeName?: string;
  status: ExitStatus;
  requestedOn: string;
  reason?: string;
  requestedBy?: string;
  /** What is true now; only while the request is open */
  kitta?: number;
  shareAmount?: number;
  liabilities?: ExitLiability[];
  settledOn?: string;
  settledBy?: string;
  refundDueOn?: string;
  daysLeft?: number;
  overdue?: boolean;
  refundedOn?: string;
  refundAmount?: number;
  refundReceiptNumber?: string;
  refundedBy?: string;
  cancelledOn?: string;
  cancelledBy?: string;
  cancelReason?: string;
}

/** A member's share position and what stands in the way of leaving */
export interface MemberShares {
  clientId: number;
  kitta: number;
  pendingKitta: number;
  shareAmount: number;
  shareCapital: number;
  percentOfCapital: number;
  ceilingPercent?: number | null;
  ceilingApplies: boolean;
  ceilingNote?: CeilingNote | null;
  /** Rupees of shares still to buy; null when the ceiling does not apply */
  roomAmount?: number | null;
  liabilities: ExitLiability[];
  canLeave: boolean;
  exit: MembershipExit | null;
}

export interface ShareCeiling {
  ceilingPercent?: number | null;
  shareCapital: number;
  ceilingAmount: number;
  membersWithShares: number;
  checked: boolean;
  membersAbove: {
    clientId: number;
    name: string;
    accountNo: string;
    officeName?: string;
    kitta: number;
    amount: number;
    percent: number;
    exempt?: boolean;
  }[];
}

export type ExitFilter = 'open' | 'requested' | 'settled' | 'refunded' | 'cancelled';
