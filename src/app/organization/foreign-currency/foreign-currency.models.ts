/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Exact decimal tokens are preserved by the shared cash-exchange response parser. */
export type Decimal = string | number;
export type FxOperation = 'PURCHASE' | 'SALE';
export interface FxCapabilities {
  publicationEnabled: boolean;
  executionEnabled: boolean;
  checksSupported: boolean;
  vouchersSupported: boolean;
  blockers: string[];
}
export interface FxBranch {
  id: number;
  name: string;
}
export interface FxCurrency {
  code: string;
  name: string;
  decimalPlaces: number;
}
export interface FxRateContext {
  operatorId: number;
  businessDate: string;
  branches: FxBranch[];
  currencies: FxCurrency[];
  nationalCurrency: string | null;
  rateConvention: string;
  pointsConvention: string;
  capabilities: FxCapabilities;
}
export interface FxDraft {
  id: number;
  officeId: number;
  officeName: string;
  effectiveDate: string;
  baseCurrency: string;
  quoteCurrency: string;
  dailyBaseRate: Decimal;
  buyPoints: Decimal;
  sellPoints: Decimal;
  version: number;
  status: 'DRAFT';
  createdBy: number;
  createdAt: string;
}
export interface FxBranchInput {
  officeId: number;
  expectedVersion: number;
  buyPoints: string;
  sellPoints: string;
}
export interface FxRateRequest {
  effectiveDate: string;
  baseCurrency: 'USD';
  quoteCurrency: string;
  dailyBaseRate: string;
  branches: FxBranchInput[];
  previewToken?: string;
}
export interface FxRatePreview {
  operatorId: number;
  effectiveDate: string;
  baseCurrency: string;
  quoteCurrency: string;
  dailyBaseRate: Decimal;
  changes: { branch: FxBranch; previous: FxDraft | null; proposed: FxBranchInput }[];
  previewToken: string;
  status: 'DRAFT_PREVIEW';
  capabilities: FxCapabilities;
}
export interface FxAudit {
  id: number;
  draftId: number;
  previousDraftId: number | null;
  operatorId: number;
  action: 'DRAFT_CONFIRMED';
  recordedAt: string;
  previous: FxDraft | null;
  proposed: FxDraft;
}
export interface FxCashier {
  cashierId: number;
  staffId: number;
  cashierName: string;
  closed: boolean;
  tellerId: number;
  tellerName: string;
  officeId: number;
  officeName: string;
}
export interface FxTellerContext {
  operatorId: number;
  businessDate: string;
  cashier: FxCashier;
  currencies: FxCurrency[];
  nationalCurrency: string | null;
  rateDrafts: FxDraft[];
  permissions: string[];
  capabilities: FxCapabilities;
}
export interface FxCustomer {
  id: number;
  number: string;
  displayName: string;
  officeId: number;
  active: boolean;
}
export interface FxCustomerPage {
  pageItems: FxCustomer[];
  totalFilteredRecords: number;
}
export interface FxDenomination {
  id: string;
  currencyCode: string;
  type: string;
  value: Decimal;
  availableQuantity: number;
}
export interface FxQuantity {
  denominationId: string;
  quantity: number;
}
export interface FxTradeRequest {
  clientId: number;
  identifierId?: number;
  reference: string;
  quoteCurrency: string;
  usdAmount: string;
  rateDraftId: number;
  rateVersion: number;
  usdDenominations: FxQuantity[];
  quoteDenominations: FxQuantity[];
}
export interface FxCashLeg {
  currencyCode: string;
  direction: 'INFLOW' | 'OUTFLOW';
  denominationTotal: Decimal;
  denominations: {
    id: string;
    currencyCode: string;
    type: string;
    value: Decimal;
    quantity: number;
    amount: Decimal;
  }[];
}
export interface FxTradePreview {
  operation: FxOperation;
  status: 'INCOMPLETE_PREVIEW';
  executable: boolean;
  valuationValidated: boolean;
  customer: FxCustomer;
  identifierId: number | null;
  reference: string;
  cashier: FxCashier;
  businessDate: string;
  quotedAt: string;
  usdAmount: Decimal;
  quoteCurrency: string;
  nationalCurrency: string | null;
  appliedRate: Decimal | null;
  calculatedNationalAmount: Decimal | null;
  candidateRateDraft: FxDraft;
  usdCash: FxCashLeg;
  quoteCash: FxCashLeg;
  capabilities: FxCapabilities;
}
/** Storage bounds only; no institutional rate or points formula is inferred. */
export function validFxDecimal(value: string, positive = false, precision = 12): boolean {
  return (
    /^-?(?:0|[1-9][0-9]{0,19})(?:\.[0-9]{1,12})?$/.test(value) &&
    (value.split('.')[1]?.length ?? 0) <= precision &&
    (!positive || (!value.startsWith('-') && /[1-9]/.test(value)))
  );
}
export function fxJson(request: FxRateRequest | FxTradeRequest): string {
  return JSON.stringify(request).replace(
    /"(dailyBaseRate|buyPoints|sellPoints|usdAmount)":"([^"]*)"/g,
    (_match, key: string, value: string) => {
      if (!validFxDecimal(value, key === 'dailyBaseRate' || key === 'usdAmount')) throw new Error('Invalid decimal');
      return '"' + key + '":' + value;
    }
  );
}
