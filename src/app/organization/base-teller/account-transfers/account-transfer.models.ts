/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export type TransferOperation = 'BETWEEN_MY_ACCOUNTS' | 'TO_THIRD_PARTY';
export type AccountType = 'SAVINGS' | 'LOAN';
export interface TransferClient {
  clientId: number;
  clientNumber: string;
  displayName: string;
  clientType: string | null;
  status: string;
  officeId: number;
  officeName: string;
  active: boolean;
}
export interface TransferAccount {
  accountId: number;
  accountNo: string;
  accountType: AccountType;
  owner: TransferClient;
  productId: number;
  productName: string;
  currencyCode: string;
  decimalPlaces: number;
  status: string;
  withdrawableBalance: string | number | null;
  canDebit: boolean;
  canCredit: boolean;
}
export interface TransferContext {
  businessDate: string;
  officeId: number;
  officeName: string;
  cashier: { tellerId: number; cashierId: number } | null;
  operationTypes: TransferOperation[];
  sourceAccountTypes: AccountType[];
  destinationAccountTypes: AccountType[];
  currencies: string[];
  permissions: string[];
  sameCurrencyOnly: boolean;
  physicalCashMovement: boolean;
}
export interface TransferRequest {
  operationType: TransferOperation;
  orderingClientId: number;
  sourceAccountId: number;
  targetAccountType: AccountType;
  targetAccountId: number;
  amount: string;
  idempotencyKey?: string;
}
export interface TransferPreview {
  operationType: TransferOperation;
  businessDate: string;
  orderingClient: TransferClient;
  beneficiaryClient: TransferClient;
  source: TransferAccount;
  destination: TransferAccount;
  amount: string | number;
  withdrawalFee: string | number;
  outflowsByCurrency: Record<string, string | number>;
  inflowsByCurrency: Record<string, string | number>;
  balanced: boolean;
  warnings: string[];
}
export interface TransferReceipt {
  transferId: number;
  transferDetailId: number;
  reference: string;
  businessDate: string;
  completedAt: string;
  status: string;
  operationType: TransferOperation;
  orderingClient: TransferClient;
  beneficiaryClient: TransferClient;
  source: TransferAccount;
  destination: TransferAccount;
  amount: string | number;
  currencyCode: string;
  sourceTransactionId: number;
  destinationTransactionId: number;
  operatorId: number;
  operatorName: string;
  tellerId: number | null;
  cashierId: number | null;
}
export interface ClientPage {
  pageItems: TransferClient[];
  totalFilteredRecords: number;
}
