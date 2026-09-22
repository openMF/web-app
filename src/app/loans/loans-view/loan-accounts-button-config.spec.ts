/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { LoansAccountButtonConfiguration } from './loan-accounts-button-config';

/**
 * The menu must offer exactly what the Working Capital backend accepts for each status. Repayment,
 * Goodwill Credit, Payout Refund and Add Loan Charge share one rule there
 * (`REPAYMENT_LIKE_TXN_ALLOWED_LOAN_STATUSES` plus the charge validator): Active, Closed
 * (obligations met) and Overpaid. Everything else is narrower, and offering it would surface a
 * button that the backend rejects.
 */
describe('LoansAccountButtonConfiguration - Working Capital', () => {
  function namesFor(status: string): string[] {
    return new LoansAccountButtonConfiguration(true, status, null).singleButtons.map((button) => button.name);
  }

  function optionNamesFor(status: string): string[] {
    return new LoansAccountButtonConfiguration(true, status, null).options.map((option) => option.name);
  }

  const sharedActions = [
    'Add Loan Charge',
    'Make Repayment',
    'Goodwill Credit',
    'Payout Refund'
  ];

  it('offers every action the backend accepts on a closed loan', () => {
    expect(namesFor('Closed (obligations met)')).toEqual(sharedActions);
  });

  it('offers the same actions plus the credit balance refund on an overpaid loan', () => {
    expect(namesFor('Overpaid')).toEqual([
      ...sharedActions,
      'Credit Balance Refund'
    ]);
  });

  it('keeps the credit balance refund out of a closed loan, which carries no credit balance', () => {
    expect(namesFor('Closed (obligations met)')).not.toContain('Credit Balance Refund');
  });

  it.each([
    'Closed (obligations met)',
    'Overpaid'
  ])('does not offer an action the backend restricts to an active loan on %s', (status) => {
    const offered = [
      ...namesFor(status),
      ...optionNamesFor(status)
    ];
    [
      'Write Off',
      'Charge-Off',
      'Discount Fee',
      'Disburse',
      'Undo Disbursal'
    ].forEach((action) => expect(offered).not.toContain(action));
  });

  it.each([
    'Closed (obligations met)',
    'Overpaid'
  ])('does not offer a written-off only action on %s', (status) => {
    const offered = [
      ...namesFor(status),
      ...optionNamesFor(status)
    ];
    expect(offered).not.toContain('Recovery Payment');
    expect(offered).not.toContain('Undo Write-off');
  });

  it('still offers the recovery actions on a written off loan', () => {
    expect(namesFor('Closed (written off)')).toEqual([
      'Recovery Payment',
      'Undo Write-off'
    ]);
  });

  it('gates the shared actions with the Working Capital permissions', () => {
    const config = new LoansAccountButtonConfiguration(true, 'Closed (obligations met)', null);
    const permissionOf = (name: string) =>
      config.singleButtons.find((button) => button.name === name)?.taskPermissionName;

    expect(permissionOf('Make Repayment')).toBe('REPAYMENT_WORKINGCAPITALLOAN');
    expect(permissionOf('Add Loan Charge')).toBe('CREATE_WORKINGCAPITALLOANCHARGE');
    expect(permissionOf('Payout Refund')).toBe('PAYOUTREFUND_WORKINGCAPITALLOAN');
    expect(permissionOf('Goodwill Credit')).toBe('CREATE_GOODWILL_TRANSACTION');
  });

  it('leaves the term loan menu untouched, with its own refund actions and permissions', () => {
    const termLoan = new LoansAccountButtonConfiguration(false, 'Closed (obligations met)', null);

    expect(termLoan.singleButtons.map((button) => button.name)).toEqual([
      'Goodwill Credit',
      'Interest Payment Waiver',
      'Payout Refund',
      'Merchant Issued Refund'
    ]);
    // The term loan uses its own permission for the refund, not the Working Capital one.
    expect(termLoan.singleButtons.find((button) => button.name === 'Payout Refund')?.taskPermissionName).toBe(
      'CREATE_PAYOUT_REFUND'
    );
  });
});
