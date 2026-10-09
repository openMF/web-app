/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { LoanProducts } from './loan-products';
import { LoanProductService } from './services/loan-product.service';
import { SettingsService } from 'app/settings/settings.service';

describe('LoanProducts.buildPayload', () => {
  function buildPayload(loanProductData: Record<string, unknown>): Record<string, any> {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        LoanProducts,
        { provide: LoanProductService, useValue: { isLoanProduct: true } },
        { provide: SettingsService, useValue: { dateFormat: 'dd MMMM yyyy', language: { code: 'en' } } }
      ]
    });
    return TestBed.inject(LoanProducts).buildPayload(loanProductData, []);
  }

  describe('allowPartialPeriodInterestCalculation', () => {
    // This field has been broken in both directions, so both are pinned here.
    //
    // Fineract fixed its long-standing typo in FINERACT-2206 (ab9f4fd4, 2026-01-02): the create/update
    // endpoints now accept ONLY the correctly-spelled `allowPartialPeriodInterestCalculation`. The
    // constant is still NAMED `ALLOW_PARTIAL_PERIOD_INTEREST_CALCUALTION_PARAM_NAME`, which is what
    // keeps luring people into "fixing" it back — but its value is the correct spelling, and
    // `allowPartialPeriodInterestCalcualtion` appears nowhere in the Fineract codebase.
    //
    // So: send it through untouched.
    //   - Re-keying to the misspelled name  -> 400 "[allowPartialPeriodInterestCalcualtion] ...
    //     unsupported parameter" (what a pre-FINERACT-2206 rename does to a current backend).
    //   - Dropping the field altogether     -> Fineract defaults it to false and rejects
    //     `isInterestRecalculationEnabled` on a "Same as repayment period" product with
    //     "not.supported.for.selected.interest.calculation.type" (what #2993's `x = x; delete x` did).

    it('sends the correctly-spelled parameter, unchanged', () => {
      const payload = buildPayload({ allowPartialPeriodInterestCalculation: true });

      expect(payload.allowPartialPeriodInterestCalculation).toBe(true);
      // The misspelled name is rejected as an unsupported parameter by current Fineract.
      expect('allowPartialPeriodInterestCalcualtion' in payload).toBe(false);
    });

    it('preserves false rather than dropping the flag', () => {
      const payload = buildPayload({ allowPartialPeriodInterestCalculation: false });

      expect(payload.allowPartialPeriodInterestCalculation).toBe(false);
      expect('allowPartialPeriodInterestCalcualtion' in payload).toBe(false);
    });

    it('does not invent the key when the form never carried it', () => {
      const payload = buildPayload({ name: 'Product' });

      expect('allowPartialPeriodInterestCalculation' in payload).toBe(false);
      expect('allowPartialPeriodInterestCalcualtion' in payload).toBe(false);
    });

    it('keeps a recalculation-enabled product internally consistent for the backend rule', () => {
      // Fineract accepts isInterestRecalculationEnabled only with daily interest calculation (0) OR
      // allowPartialPeriodInterestCalculation = true. This is the second branch, which is the one
      // BNPL relies on (its interest calculation period is "Same as repayment period").
      const payload = buildPayload({
        isInterestRecalculationEnabled: true,
        interestCalculationPeriodType: 1,
        allowPartialPeriodInterestCalculation: true
      });

      expect(payload.isInterestRecalculationEnabled).toBe(true);
      expect(payload.interestCalculationPeriodType).toBe(1);
      expect(payload.allowPartialPeriodInterestCalculation).toBe(true);
    });
  });
});
