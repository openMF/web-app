/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Accounting } from 'app/core/utils/accounting';
import { LoanProductService } from '../../services/loan-product.service';
import { LoanProductSummaryComponent } from './loan-product-summary.component';

/**
 * Item 1 — Simplify the View page.
 *
 * These tests lock in the view/preview gating that drives the simplified View without rendering the
 * large shared summary template: the read-only View (`action === 'view'`) hides internal/defaulted
 * toggle rows and empty sections, while the Classic create/edit Preview (`action === 'preview'`) stays
 * complete so no configured value is ever hidden before submit.
 */
describe('LoanProductSummaryComponent (view simplification)', () => {
  function createComponent(action: string, loanProduct: Record<string, unknown>): LoanProductSummaryComponent {
    // Reset first so a test can build more than one component (e.g. a view and a preview instance).
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: LoanProductService, useValue: { isLoanProduct: true } },
        { provide: Accounting, useValue: { getAccountingRulesForLoans: (): string[] => [] } }
      ]
    });

    const component = TestBed.runInInjectionContext(() => new LoanProductSummaryComponent());
    component.action = action;
    component.loanProduct = loanProduct as never;
    return component;
  }

  describe('isViewAction', () => {
    it('is true only for the read-only View action', () => {
      expect(createComponent('view', {}).isViewAction).toBe(true);
      expect(createComponent('preview', {}).isViewAction).toBe(false);
    });
  });

  describe('hideToggleInView', () => {
    it('hides a falsy internal toggle in the View but never in Preview', () => {
      expect(createComponent('view', {}).hideToggleInView(false)).toBe(true);
      expect(createComponent('view', {}).hideToggleInView(undefined)).toBe(true);
      expect(createComponent('preview', {}).hideToggleInView(false)).toBe(false);
    });

    it('never hides a meaningful (truthy) value, so user-set config is preserved', () => {
      expect(createComponent('view', {}).hideToggleInView(true)).toBe(false);
      expect(createComponent('preview', {}).hideToggleInView(true)).toBe(false);
    });
  });

  describe('optional section visibility', () => {
    const sections: Array<{ getter: keyof LoanProductSummaryComponent; flag: string }> = [
      { getter: 'showDownPaymentsSection', flag: 'enableDownPayment' },
      { getter: 'showInterestRecalculationSection', flag: 'isInterestRecalculationEnabled' },
      { getter: 'showGuaranteeSection', flag: 'holdGuaranteeFunds' },
      { getter: 'showTrancheSection', flag: 'multiDisburseLoan' }
    ];

    sections.forEach(({ getter, flag }) => {
      it(`${String(getter)} is hidden in the View when ${flag} is off, shown when on`, () => {
        expect(createComponent('view', { [flag]: false })[getter]).toBe(false);
        expect(createComponent('view', { [flag]: true })[getter]).toBe(true);
      });

      it(`${String(getter)} always shows in Preview (Classic create/edit stays complete)`, () => {
        expect(createComponent('preview', { [flag]: false })[getter]).toBe(true);
      });
    });
  });
});
