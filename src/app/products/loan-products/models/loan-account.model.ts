/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { LoanTransactionType } from 'app/loans/models/loan-transaction-type.model';
import { Currency } from 'app/shared/models/general.model';

export interface LoanTransaction {
  id: number;
  loanId: number;
  officeId: number;
  officeName: string;
  type: LoanTransactionType;
  date: number[];
  currency: Currency;
  amount: number;
  netDisbursalAmount: number;
  principalPortion: number;
  interestPortion: number;
  feeChargesPortion: number;
  penaltyChargesPortion: number;
  overpaymentPortion: number;
  unrecognizedIncomePortion: number;
  externalId: string;
  outstandingLoanBalance: number;
  submittedOnDate: number[];
  manuallyReversed: boolean;
  loanChargePaidByList: any[];
  numberOfRepayments: number;
  transactionRelations: any[];
}
