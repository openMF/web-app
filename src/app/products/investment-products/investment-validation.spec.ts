/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { matrixIssues, policyIssues } from './investment-validation';
import {
  nativeFixture,
  policyFixture,
  policyTemplateFixture,
  rateTemplateFixture,
  rateWriteFixture
} from './investment-product.fixtures';
describe('investment policy restrictions', () => {
  const validate = (policy = policyFixture) => policyIssues(policy, nativeFixture, policyTemplateFixture);
  it('accepts a policy within native restrictions', () => expect(validate()).toEqual([]));
  it('keeps Promissory Note and CEDE term rules independent', () => {
    expect(validate({ ...policyFixture, investmentType: 'CEDE' })).toContain('Investment.termRules');
    expect(
      validate({
        ...policyFixture,
        investmentType: 'CEDE',
        minimumTermDays: 60,
        maximumTermDays: 1800,
        termMultipleDays: 30
      })
    ).toEqual([]);
  });
  it('rejects weakened native terms and unverified calendar units', () => {
    expect(
      policyIssues(
        policyFixture,
        { ...nativeFixture, terms: { ...nativeFixture.terms, minimum: 60 } },
        policyTemplateFixture
      )
    ).toContain('Investment.nativeTerms');
    expect(
      policyIssues(
        policyFixture,
        { ...nativeFixture, terms: { ...nativeFixture.terms, minimumUnit: 2 } },
        policyTemplateFixture
      )
    ).toContain('Investment.nativeTerms');
  });
  test.each([
    { minimumInvestmentAmount: '99.99' },
    { maximumInvestmentAmount: '100000.01' },
    { minimumInvestmentAmount: '100.001' },
    { minimumInvestmentAmount: '0' }
  ])('rejects invalid amounts %o', (change) =>
    expect(validate({ ...policyFixture, ...change })).toContain('Investment.amountRules')
  );
  it('requires limits for automatic reinvestment', () =>
    expect(
      validate({ ...policyFixture, automaticReinvestmentEnabled: true, renewalRatePolicy: 'RATE_EFFECTIVE_AT_RENEWAL' })
    ).toContain('Investment.renewalRules'));
  it('validates unique eligible term-specific limits', () =>
    expect(
      validate({
        ...policyFixture,
        automaticReinvestmentEnabled: true,
        maximumReinvestmentsByTerm: [
          { termDays: 30, maximumReinvestments: 2 },
          { termDays: 30, maximumReinvestments: 1 }
        ]
      })
    ).toContain('Investment.renewalRules'));
  it('requires coherent capitalization settings', () =>
    expect(validate({ ...policyFixture, capitalizationEnabled: true })).toContain('Investment.capitalizationRules'));
  it('requires native monthly posting for monthly intent', () =>
    expect(
      policyIssues(
        { ...policyFixture, interestPayoutMode: 'MONTHLY' },
        { ...nativeFixture, interestPostingPeriod: 7 },
        policyTemplateFixture
      )
    ).toContain('Investment.monthlyRules'));
  it('validates cancellation references without executing penalties', () =>
    expect(
      validate({ ...policyFixture, earlyCancellationAllowed: true, penaltyMode: 'VERSIONED_REFERENCE' })
    ).toContain('Investment.referenceRules'));
});
describe('investment matrix boundaries', () => {
  const validate = (matrix = rateWriteFixture.matrix) =>
    matrixIssues(matrix, rateTemplateFixture, policyFixture, nativeFixture);
  it('accepts complete two-dimensional coverage', () => expect(validate()).toEqual([]));
  it('rejects gaps and overlapping amount bands', () =>
    expect(
      validate({ ...rateWriteFixture.matrix, amountBands: [{ lower: '101', upper: '100000', upperInclusive: true }] })
    ).toContain('Investment.amountCoverage'));
  it('requires an inclusive final capped maximum', () =>
    expect(
      validate({ ...rateWriteFixture.matrix, amountBands: [{ lower: '100', upper: '100000', upperInclusive: false }] })
    ).toContain('Investment.amountCoverage'));
  it('supports an unbounded final amount only for uncapped products', () =>
    expect(
      matrixIssues(
        { ...rateWriteFixture.matrix, amountBands: [{ lower: '100', upper: null, upperInclusive: false }] },
        rateTemplateFixture,
        { ...policyFixture, maximumInvestmentAmount: null },
        { ...nativeFixture, maximumDepositAmount: null }
      )
    ).toEqual([]));
  it('requires full term coverage and policy increments', () =>
    expect(validate({ ...rateWriteFixture.matrix, termBands: [{ minimumDays: 1, maximumDays: 1800 }] })).toContain(
      'Investment.termCoverage'
    ));
  it('rejects missing cells and excess precision', () => {
    expect(validate({ ...rateWriteFixture.matrix, cells: [] })).toContain('Investment.matrixSize');
    expect(
      validate({ ...rateWriteFixture.matrix, cells: [{ amountBand: 0, termBand: 0, annualRatePercent: '14.0000001' }] })
    ).toContain('Investment.cellRules');
  });
  it('uses limits from the backend template', () =>
    expect(
      matrixIssues(rateWriteFixture.matrix, { ...rateTemplateFixture, maximumCells: 0 }, policyFixture, nativeFixture)
    ).toContain('Investment.matrixSize'));
});
