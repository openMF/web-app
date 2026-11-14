/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NEVER, of } from 'rxjs';
import { Dates } from 'app/core/utils/dates';
import { LoansService } from 'app/loans/loans.service';
import { LoanProductService } from 'app/products/loan-products/services/loan-product.service';
import { SettingsService } from 'app/settings/settings.service';
import { DisburseComponent } from './disburse.component';

describe('DisburseComponent', () => {
  let loansServiceStub: {
    loanActionButtons: jest.Mock;
    applyWorkingCapitalLoanAccountCommand: jest.Mock;
    hasOutstandingDownPaymentFee: jest.Mock;
  };

  /**
   * Builds the component against stubbed collaborators and runs ngOnInit, without rendering the template.
   * @param isWorkingCapital Whether the loan is a Working Capital loan.
   * @returns The initialised component.
   */
  function createComponent(isWorkingCapital = false, outstandingDownPaymentFee$ = of(true)): DisburseComponent {
    loansServiceStub = {
      loanActionButtons: jest.fn(() => of({})),
      applyWorkingCapitalLoanAccountCommand: jest.fn(() => of({})),
      hasOutstandingDownPaymentFee: jest.fn(() => outstandingDownPaymentFee$)
    };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        UntypedFormBuilder,
        { provide: ActivatedRoute, useValue: { snapshot: { params: { loanId: '1' } }, pathFromRoot: [] } },
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: LoansService, useValue: loansServiceStub },
        {
          provide: LoanProductService,
          useValue: { isLoanProduct: !isWorkingCapital, isWorkingCapital, productType: { value: 'loan' } }
        },
        {
          provide: SettingsService,
          useValue: {
            businessDate: new Date(2026, 9, 17),
            maxFutureDate: new Date(2027, 0, 1),
            dateFormat: 'dd MMMM yyyy',
            language: { code: 'en' }
          }
        },
        { provide: Dates, useValue: { formatDate: () => '17 October 2026' } }
      ]
    });
    const component = TestBed.runInInjectionContext(() => new DisburseComponent());
    component.dataObject = { amount: 1000, discountAmount: null };
    component.ngOnInit();
    return component;
  }

  it('does not send skipDownPaymentFee unless it is checked', () => {
    const component = createComponent();

    component.submit();

    expect(loansServiceStub.loanActionButtons.mock.calls[0][2]).not.toHaveProperty('skipDownPaymentFee');
  });

  it('sends skipDownPaymentFee when it is checked', () => {
    const component = createComponent();
    component.disbursementLoanForm.patchValue({ skipDownPaymentFee: true });

    component.submit();

    expect(loansServiceStub.loanActionButtons.mock.calls[0][2].skipDownPaymentFee).toBe(true);
  });

  it('reports the down payment fee lookup as pending until it completes', () => {
    const component = createComponent(false, NEVER);
    let shown: boolean | null | undefined;

    component.showSkipDownPaymentFee$.subscribe((value) => (shown = value));

    expect(shown).toBeNull();
  });

  it('offers the skip option only when the loan has an outstanding down payment fee', () => {
    const component = createComponent();
    let shown: boolean | null | undefined;

    component.showSkipDownPaymentFee$.subscribe((value) => (shown = value));

    expect(loansServiceStub.hasOutstandingDownPaymentFee).toHaveBeenCalledWith('1');
    expect(shown).toBe(true);
  });

  it('never offers the skip option for a Working Capital loan', () => {
    const component = createComponent(true);
    let shown: boolean | null | undefined;

    component.showSkipDownPaymentFee$.subscribe((value) => (shown = value));

    expect(loansServiceStub.hasOutstandingDownPaymentFee).not.toHaveBeenCalled();
    expect(shown).toBe(false);
  });
});
