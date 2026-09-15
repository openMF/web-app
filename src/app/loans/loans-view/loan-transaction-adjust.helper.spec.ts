/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { LoanTransactionType } from 'app/loans/models/loan-transaction-type.model';
import {
  adjustmentReopensLoan,
  canAdjustLoanTransaction,
  canReverseLoanTransaction,
  isReverseOnlyLoanTransaction
} from './loan-transaction-adjust.helper';

/** Only the id is read by the gates, so the rest of the type is irrelevant here. */
function transactionType(id: number): LoanTransactionType {
  return { id } as LoanTransactionType;
}

describe('LoanTransactionAdjustHelper', () => {
  const bothModes = [
    [
      'REPAYMENT',
      2
    ],
    [
      'WAIVE_INTEREST',
      4
    ],
    [
      'WAIVE_CHARGES',
      9
    ],
    [
      'ACCRUAL',
      10
    ],
    [
      'CREDIT_BALANCE_REFUND',
      20
    ],
    [
      'CHARGE_REFUND',
      24
    ],
    [
      'CHARGE_ADJUSTMENT',
      26
    ],
    [
      'DOWN_PAYMENT',
      28
    ],
    [
      'INTEREST_PAYMENT_WAIVER',
      31
    ],
    [
      'ACCRUAL_ACTIVITY',
      32
    ],
    [
      'ACCRUAL_ADJUSTMENT',
      34
    ]
  ];

  const reverseOnly = [
    [
      'MERCHANT_ISSUED_REFUND',
      21
    ],
    [
      'PAYOUT_REFUND',
      22
    ],
    [
      'GOODWILL_CREDIT',
      23
    ],
    [
      'CAPITALIZED_INCOME',
      35
    ],
    [
      'CAPITALIZED_INCOME_ADJUSTMENT',
      37
    ],
    [
      'BUY_DOWN_FEE',
      40
    ],
    [
      'BUY_DOWN_FEE_ADJUSTMENT',
      41
    ]
  ];

  const noAction = [
    [
      'DISBURSEMENT',
      1
    ],
    [
      'WRITEOFF',
      6
    ],
    [
      'RECOVERY_REPAYMENT',
      8
    ],
    [
      'REFUND',
      16
    ],
    [
      'CHARGE_PAYMENT',
      17
    ],
    [
      'INCOME_POSTING',
      19
    ],
    [
      'CHARGEBACK',
      25
    ],
    [
      'CHARGE_OFF',
      27
    ],
    [
      'REAGE',
      29
    ],
    [
      'REAMORTIZE',
      30
    ],
    [
      'INTEREST_REFUND',
      33
    ],
    [
      'CAPITALIZED_INCOME_AMORTIZATION',
      36
    ],
    [
      'CONTRACT_TERMINATION',
      38
    ],
    [
      'BUY_DOWN_FEE_AMORTIZATION',
      42
    ],
    [
      'DISCOUNT_FEE',
      44
    ],
    [
      'DISCOUNT_FEE_ADJUSTMENT',
      46
    ]
  ];

  describe.each(bothModes)('%s', (_name, id: number) => {
    it('can be reversed and adjusted', () => {
      expect(canReverseLoanTransaction(transactionType(id), false)).toBe(true);
      expect(canAdjustLoanTransaction(transactionType(id), false)).toBe(true);
      expect(isReverseOnlyLoanTransaction(transactionType(id))).toBe(false);
    });

    it('offers no action once reversed', () => {
      expect(canReverseLoanTransaction(transactionType(id), true)).toBe(false);
      expect(canAdjustLoanTransaction(transactionType(id), true)).toBe(false);
    });
  });

  describe.each(reverseOnly)('%s', (_name, id: number) => {
    it('can be reversed but not adjusted', () => {
      expect(canReverseLoanTransaction(transactionType(id), false)).toBe(true);
      expect(canAdjustLoanTransaction(transactionType(id), false)).toBe(false);
      expect(isReverseOnlyLoanTransaction(transactionType(id))).toBe(true);
    });

    it('offers no action once reversed', () => {
      expect(canReverseLoanTransaction(transactionType(id), true)).toBe(false);
    });
  });

  describe.each(noAction)('%s', (_name, id: number) => {
    it('offers neither action', () => {
      expect(canReverseLoanTransaction(transactionType(id), false)).toBe(false);
      expect(canAdjustLoanTransaction(transactionType(id), false)).toBe(false);
    });
  });

  describe('adjustmentReopensLoan', () => {
    it('warns on a loan closed with its obligations met', () => {
      expect(adjustmentReopensLoan({ code: 'loanStatusType.closed.obligations.met' })).toBe(true);
    });

    it('warns on an overpaid loan', () => {
      expect(adjustmentReopensLoan({ code: 'loanStatusType.overpaid' })).toBe(true);
    });

    it('stays quiet on a loan that is still open', () => {
      expect(adjustmentReopensLoan({ code: 'loanStatusType.active' })).toBe(false);
    });

    it('stays quiet when the status is missing', () => {
      expect(adjustmentReopensLoan(null)).toBe(false);
      expect(adjustmentReopensLoan(undefined)).toBe(false);
      expect(adjustmentReopensLoan({})).toBe(false);
    });
  });
});
