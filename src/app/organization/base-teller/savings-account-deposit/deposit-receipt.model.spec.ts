/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { describe, expect, it } from '@jest/globals';
import { SavingsDepositReceipt } from '../base-teller.service';
import {
  buildDepositReceiptViewModel,
  commandTransactionId,
  matchesPendingDeposit,
  depositTransactionId,
  DepositReceiptContext
} from './deposit-receipt.model';

const context: DepositReceiptContext = {
  customer: { id: 10, displayName: 'Alex Test', accountNo: 'CL-10' },
  account: {
    id: 77,
    accountNo: 'SA-77',
    productName: 'Everyday Savings',
    currency: { code: 'USD', decimalPlaces: 2 },
    summary: { accountBalance: 999, availableBalance: 500 }
  },
  accountId: 77,
  amount: 0.2,
  depositType: 'CASH',
  paymentMethod: 'Cash Drawer',
  receiptReference: 'original-request',
  date: [
    2026,
    11,
    10
  ],
  note: ''
};
const receipt: SavingsDepositReceipt = {
  id: 101,
  accountId: 77,
  amount: 0.2,
  runningBalance: 0.3,
  cumulativeBalance: 99999,
  transactionType: { value: 'Deposit', deposit: true },
  entryType: 'CREDIT',
  reversed: false,
  date: [
    2026,
    11,
    11
  ],
  paymentDetailData: { receiptNumber: 'BANK-101', paymentType: { name: 'Recorded Payment' } }
};

describe('Deposit receipt provenance', () => {
  it('maps actual customer, destination, product, transaction and distinct payment data without mutating sources', () => {
    const original = JSON.stringify({ context, receipt });
    const view = buildDepositReceiptViewModel(context, { resourceId: 101 }, receipt);
    expect(view).toMatchObject({
      transactionId: '101',
      customer: 'Alex Test',
      customerNumber: 'CL-10',
      accountNumber: 'SA-77',
      product: 'Everyday Savings',
      amount: 0.2,
      currency: 'USD',
      precision: 2,
      paymentMethod: 'Recorded Payment',
      depositType: 'CASH',
      transactionType: 'labels.inputs.Deposit',
      receiptNumber: 'BANK-101',
      receiptConfirmed: true,
      date: [
        2026,
        11,
        11
      ],
      dateFromReceipt: true
    });
    expect(JSON.stringify({ context, receipt })).toBe(original);
  });

  it('uses exact scaled subtraction for the immediately preceding ledger balance', () => {
    expect(buildDepositReceiptViewModel(context, { resourceId: 101 }, receipt)).toMatchObject({
      previousBalance: 0.1,
      resultingBalance: 0.3
    });
  });

  it.each([
    { reversed: true },
    { isReversal: true },
    { entryType: 'DEBIT' },
    { transactionType: { value: 'Fee' } },
    { reversed: undefined },
    { transfer: { id: 4 } },
    { lienTransaction: true },
    { amount: undefined },
    { runningBalance: undefined }
  ])('does not derive an equation for unsupported posting semantics %j', (changes) => {
    expect(
      buildDepositReceiptViewModel(context, { resourceId: 101 }, { ...receipt, ...changes }).previousBalance
    ).toBeNull();
  });

  it('never substitutes selected/available/cumulative balances for the transaction ledger', () => {
    const view = buildDepositReceiptViewModel(context, { resourceId: 101 }, { id: 101, cumulativeBalance: 777 });
    expect(view.previousBalance).toBeNull();
    expect(view.resultingBalance).toBeNull();
    expect(view.amountFromReceipt).toBe(false);
  });

  it('keeps the original reference unconfirmed, without fabricating a timestamp, operator or ID', () => {
    const view = buildDepositReceiptViewModel(context);
    expect(view).toMatchObject({
      receiptNumber: 'original-request',
      receiptConfirmed: false,
      transactionId: null,
      time: null,
      operator: null,
      dateFromReceipt: false
    });
  });

  it('preserves command receipt precedence and unfamiliar transaction types', () => {
    const command: SavingsDepositReceipt = { resourceId: 101, paymentDetailData: { receiptNumber: 'COMMAND-101' } };
    expect(
      buildDepositReceiptViewModel(context, command, { id: 101, transactionType: { value: 'Unfamiliar credit' } })
    ).toMatchObject({ receiptNumber: 'COMMAND-101', receiptConfirmed: true, transactionType: 'Unfamiliar credit' });
  });

  it.each([
    'resourceId',
    'entityId',
    'transactionId'
  ])('resolves supported command identifier %s', (key) => {
    expect(commandTransactionId({ [key]: '9223372036854775807' })).toBe('9223372036854775807');
  });

  it.each([
    undefined,
    '',
    0,
    -1,
    NaN,
    Infinity,
    Number.MAX_SAFE_INTEGER + 1,
    'bad/id',
    '1.5'
  ])('does not invent a valid transaction identifier from %s', (value) => {
    expect(depositTransactionId(value)).toBeNull();
  });

  it.each([
    { code: 'JPY', decimalPlaces: 0, amount: 100, balance: 300, previous: 200 },
    { code: 'KWD', decimalPlaces: 3, amount: 0.002, balance: 0.003, previous: 0.001 }
  ])('honours currency precision $code', ({ code, decimalPlaces, amount, balance, previous }) => {
    const view = buildDepositReceiptViewModel(
      context,
      { resourceId: 101 },
      { ...receipt, currency: { code, decimalPlaces }, amount, runningBalance: balance }
    );
    expect(view).toMatchObject({
      currency: code,
      precision: decimalPlaces,
      amount,
      resultingBalance: balance,
      previousBalance: previous
    });
  });

  it.each([
    { code: 'US' },
    { code: 'US', decimalPlaces: 0 },
    { code: 'US', decimalPlaces: 2 },
    { code: 'USDD' },
    { code: 'U$D' }
  ])('ignores malformed receipt currency metadata %j and retains account formatting', (currency) => {
    const view = buildDepositReceiptViewModel(context, undefined, { ...receipt, currency });
    expect(view).toMatchObject({ currency: 'USD', precision: 2, amount: 0.2, resultingBalance: 0.3 });
  });

  it('uses currency defaults safely when neither source provides a scale', () => {
    const view = buildDepositReceiptViewModel(
      { ...context, account: { ...context.account, currency: { code: 'USD' } } },
      undefined,
      { ...receipt, currency: { code: 'US' } }
    );
    expect(view).toMatchObject({ currency: 'USD', precision: 2 });
  });

  it.each([
    undefined,
    { code: 'USD' },
    { code: 'USD', decimalPlaces: 2 },
    { code: 'usd', decimalPlaces: 2 }
  ])('preserves valid receipt currencies and omitted-currency account fallback %j', (currency) => {
    const view = buildDepositReceiptViewModel(context, undefined, { ...receipt, currency });
    expect(view).toMatchObject({ currency: currency?.code || 'USD', precision: 2, amount: 0.2 });
  });

  it('does not pass malformed legacy account currency to Intl when no valid code is available', () => {
    const view = buildDepositReceiptViewModel(
      { ...context, account: { ...context.account, currency: { code: 'US' }, currencyCode: 'U$D' } },
      undefined,
      { ...receipt, currency: { code: 'US' } }
    );
    expect(view).toMatchObject({ currency: '', precision: 6, amount: 0.2 });
  });

  it.each([
    -1,
    NaN,
    Infinity,
    0,
    0.001
  ])('does not display invalid deposit amounts %s', (amount) => {
    expect(buildDepositReceiptViewModel(context, { resourceId: 101 }, { ...receipt, amount }).amount).toBeNull();
  });

  it('supports an overdrawn ledger without floating-point subtraction', () => {
    expect(
      buildDepositReceiptViewModel(context, { resourceId: 101 }, { ...receipt, runningBalance: -0.1 }).previousBalance
    ).toBe(-0.3);
  });
  it('omits a previous balance if Number division would lose a minor unit at a large magnitude', () => {
    const view = buildDepositReceiptViewModel(
      { ...context, amount: 0.01 },
      { resourceId: 101 },
      { ...receipt, amount: 0.01, runningBalance: 80000000000000 }
    );
    expect(view.resultingBalance).toBe(80000000000000);
    expect(view.previousBalance).toBeNull();
  });

  it('reconciles only an authoritative deposit with the original reference and request identity', () => {
    const confirmed = {
      ...receipt,
      date: context.date!,
      currency: { code: 'USD', decimalPlaces: 2 },
      paymentDetailData: { receiptNumber: context.receiptReference }
    };
    expect(matchesPendingDeposit(context, '101', confirmed)).toBe(true);
    for (const changes of [
      { id: 102 },
      { accountId: 78 },
      { amount: 0.3 },
      { reversed: true },
      { paymentDetailData: { receiptNumber: 'different-reference' } },
      { paymentDetailData: undefined },
      { date: [
          2026,
          11,
          12
        ] },
      { currency: { code: 'EUR', decimalPlaces: 2 } },
      { transactionType: { deposit: false } }
    ]) expect(matchesPendingDeposit(context, '101', { ...confirmed, ...changes })).toBe(false);
  });
});
