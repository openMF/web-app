/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** What the signed-in user may see in Compliance (GET /nepal/aml/access). */
export interface ComplianceAccess {
  permissions: string[];
  showMenu: boolean;
  holders?: ComplianceHolder[] | null;
}

export interface ComplianceHolder {
  userId: number;
  username: string;
  name: string;
  office: string;
  roles: string[];
  permissions: string[];
}

export type Grade = 'HIGH' | 'MEDIUM' | 'NORMAL';

/** The cooperative's AML settings (fineract-dbug issue #196). */
export interface AmlSettings {
  riskLine: number;
  atLineCountsAs: Grade;
  lineMeasured: 'PER_PRODUCT' | 'COMBINED';
  unusualYearlyLine: number;
  yearBasis: 'FISCAL_YEAR' | 'ROLLING_12_MONTHS';
  eddMonitoringLine: number;
  sourceOfFundsLine: number;
  sourceOfFundsDayTotal: boolean;
  secondApproverAbove?: number | null;
  ttrLine: number;
  ttrDays: number;
  strTargetDays: number;
  reviewYearsHigh: number;
  reviewYearsMedium: number;
  reviewYearsNormal: number;
  fullKymBelowLineGrade: Grade;
  kymGateEnabled: boolean;
  kymGateAllFrom?: string | null;
  changeNoticeDays: number;
  retentionYears: number;
  pepRetentionYears: number;
  structuringWindowDays: number;
  structuringBandPercent: number;
  remittanceService: boolean;
  sharesCountAsCash: boolean;
  unknownPaymentCountsAsCash: boolean;
  goamlEntityId?: string | null;
  goamlBranchCode?: string | null;
  screeningPossibleScore: number;
  screeningLikelyScore: number;
  unListUrl: string;
  /** Relationships on the source-of-funds, KYM, beneficial owner and PEP screens only from the list (ADR-0046) */
  relationshipsFromList?: boolean;
}

export type CashClass = 'CASH' | 'COOP_BANK_CASH' | 'NON_CASH';

export interface PaymentTypeClass {
  id: number;
  name: string;
  fineractCashPayment: boolean;
  /** Absent when nobody has classified the payment type yet. */
  cashClass?: CashClass | null;
}

export interface AmlSettingsView {
  settings: AmlSettings;
  policyDefaults: AmlSettings;
  paymentTypes: PaymentTypeClass[];
  unclassified: number;
  lastChange?: { at: string; username: string; name: string } | null;
}

/** Counts for the Compliance home (GET /nepal/aml/ttr/summary). */
export interface TtrSummary {
  toReport: number;
  overdue: number;
  dueSoon: number;
  historical: number;
  needsCorrection: number;
  nextDue?: string | null;
}

export type TtrStatus = 'NEW' | 'HISTORICAL' | 'EXEMPT' | 'IN_REPORT' | 'REPORTED' | 'WITHDRAWN';

/** A threshold transaction to report to FIU-Nepal (fineract-dbug issue #131). */
export interface TtrItem {
  id: number;
  subjectType: 'CLIENT' | 'GROUP';
  subjectId: number;
  clientId?: number | null;
  name: string;
  accountNo: string;
  office: string;
  transactionDate: string | number[];
  direction: 'IN' | 'OUT';
  basis: 'COUNTER' | 'COOP_BANK';
  totalAmount: number;
  movementCount: number;
  thresholdUsed: number;
  dueOn: string | number[];
  daysLeft?: number | null;
  status: TtrStatus;
  statusReason?: string | null;
  needsCorrection: boolean;
  reportId?: number | null;
}

export interface Movement {
  id: number;
  clientId: number;
  transactionDate: string | number[];
  product: 'SAVINGS' | 'LOAN' | 'SHARE';
  kind: string;
  direction: 'IN' | 'OUT';
  paymentType?: string | null;
  cashClass: string;
  amount: number;
  sourceTable: string;
  sourceId: number;
  counted: boolean;
}

export interface TtrItemDetail {
  item: TtrItem;
  movements: Movement[];
}

/**
 * One of our rows of FIU-Nepal's codes (fineract-dbug #288; docs/goaml-reports.md, "Codes"): what Fineract calls
 * this value (`ourValue`) in a group of values of this `type` (for example `gender`), its human label
 * (`description`, read-only - filled in from the schema), and the FIU-Nepal `code` an officer picks for it.
 * `institution`'s two rows (`NAME`, `CODE`) have no list - free text instead of a select.
 */
export interface GoamlLookup {
  type: string;
  ourValue: string;
  code?: string | null;
  description?: string | null;
}

/** Keyed by lookup `type`, each a FIU-Nepal code the schema in use allows for it (GET /nepal/aml/goaml/code-lists);
 * `institution` is absent, since it has no list. */
export type GoamlCodeLists = Record<string, string[]>;

export type GoamlStatus = 'DRAFT' | 'READY' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED' | 'CORRECTED' | 'DISCARDED';

/** A goAML report (fineract-dbug issue #134). */
export interface GoamlReport {
  id: number;
  reference: string;
  type: 'TTR' | 'STR' | 'SAR';
  status: GoamlStatus;
  clientId?: number | null;
  clientName?: string | null;
  dueOn?: string | null;
  problems: string[];
  createdAt?: string;
  submittedOn?: string | null;
  fiuReference?: string | null;
  outcomeNote?: string | null;
  replacesReportId?: number | null;
}

export interface LedgerStatus {
  movements: number;
  counted: number;
  firstDate?: string | null;
  lastDate?: string | null;
  lastRefreshed?: string | null;
  lastReconciled?: string | null;
}

/** Dates from Fineract come as yyyy-MM-dd or as [y, m, d]; always yyyy-MM-dd here. */
export function isoDate(value: string | number[] | null | undefined): string {
  if (!value) {
    return '';
  }
  if (Array.isArray(value)) {
    const [
      y,
      m,
      d
    ] = value;
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  return value.length > 10 ? value.slice(0, 10) : value;
}
