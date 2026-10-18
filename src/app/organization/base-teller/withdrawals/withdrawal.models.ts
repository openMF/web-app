/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export type Decimal = number | string;
export interface WithdrawalCustomer {
  clientId: number;
  clientNumber: string;
  displayName: string;
  clientType: string;
  status: string;
  officeId: number;
  officeName: string;
  eligible: boolean;
}
export interface WithdrawalAccount {
  accountId: number;
  accountNumber: string;
  productId: number;
  productName: string;
  currencyCode: string;
  decimalPlaces: number;
  status: string;
  availableAmount: Decimal | null;
  withdrawalEligible: boolean;
  restrictions: string[];
}
export interface WithdrawalOption {
  id: number;
  name: string;
}
export interface WithdrawalDenomination {
  denominationId: string;
  currencyCode: string;
  denominationType: string;
  denominationValue: Decimal;
  availableQuantity: number;
}
export interface WithdrawalContext {
  businessDate: string;
  cashier: {
    cashierId: number;
    cashierName: string;
    tellerId: number;
    tellerName: string;
    officeId: number;
    officeName: string;
    staffId: number;
  };
  supportedMethods: string[];
  supportedCurrencies: string[];
  permissions: string[];
  identificationTypes: WithdrawalOption[];
  cashPaymentTypes: WithdrawalOption[];
  checkCapabilities: { supported: boolean; reason: string };
  denominations: WithdrawalDenomination[];
  accountOwnerOnly: boolean;
}
export interface WithdrawalRequest {
  clientId: number;
  accountId: number;
  method: 'CASH';
  amount: string;
  paymentTypeId: number;
  identificationTypeId: number;
  identificationReference: string;
  denominations: { denominationId: string; quantity: number }[];
  idempotencyKey?: string;
}
export interface WithdrawalRecord {
  id: number | null;
  reference: string | null;
  status: string;
  businessDate: string;
  completedAt: string | null;
  customer: WithdrawalCustomer;
  account: WithdrawalAccount;
  cashier: WithdrawalContext['cashier'];
  operatorId: number;
  operatorName: string;
  method: string;
  amount: Decimal;
  currencyCode: string;
  denominations: {
    denominationId: string;
    currencyCode: string;
    denominationType: string;
    denominationValue: Decimal;
    quantity: number;
    lineAmount: Decimal;
  }[];
  recipient: {
    identifierId: number;
    identificationTypeId: number;
    identificationType: string;
    maskedReference: string;
  };
  accountDebit: Decimal;
  physicalCashOutflow: Decimal;
  inflowsByCurrency: Record<string, Decimal>;
  outflowsByCurrency: Record<string, Decimal>;
  savingsTransactionId: number | null;
  cashierTransactionId: number | null;
  reversible: boolean;
}
/** Only non-secret recovery inputs and an identity digest survive reload. */
export interface PendingWithdrawal {
  request: Omit<WithdrawalRequest, 'identificationReference'>;
  identityDigest: string;
}
export function validWithdrawalAmount(value: string, precision: number): boolean {
  return (
    /^(?:0|[1-9]\d{0,12})(?:\.\d{1,6})?$/.test(value) &&
    /[1-9]/.test(value) &&
    (value.split('.')[1]?.length ?? 0) <= precision
  );
}
