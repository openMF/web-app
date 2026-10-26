/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectorRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, config, of, throwError } from 'rxjs';
import { Dates } from 'app/core/utils/dates';
import { LoanProductService } from 'app/products/loan-products/services/loan-product.service';
import { ProductsService } from 'app/products/products.service';
import { SettingsService } from 'app/settings/settings.service';
import { LoansService } from 'app/loans/loans.service';
import { DelinquencyRangeSchedule } from 'app/loans/models/loan-account.model';
import { LoanDelinquencyTagsTabComponent } from './loan-delinquency-tags-tab.component';

describe('LoanDelinquencyTagsTabComponent', () => {
  const LOAN_ID = '42';

  const staleRangeSchedule: DelinquencyRangeSchedule[] = [
    rangeSchedulePeriod(1, '2026-07-01', '2026-07-31', 1000),
    rangeSchedulePeriod(2, '2026-08-01', '2026-08-31', 1000),
    rangeSchedulePeriod(3, '2026-09-01', '2026-09-30', 1000)
  ];

  // A reschedule can change amounts per period, move period boundaries, renumber
  // periods and change the row count — including a null expectedAmount (reset period).
  const recomputedRangeSchedule: DelinquencyRangeSchedule[] = [
    rangeSchedulePeriod(1, '2026-07-01', '2026-07-31', 1000),
    rangeSchedulePeriod(2, '2026-08-01', '2026-08-14', null),
    rangeSchedulePeriod(3, '2026-08-15', '2026-09-14', 1500),
    rangeSchedulePeriod(4, '2026-09-15', '2026-10-14', 750)
  ];

  function rangeSchedulePeriod(
    periodNumber: number,
    fromDate: string,
    toDate: string,
    expectedAmount: number | null
  ): DelinquencyRangeSchedule {
    return {
      id: periodNumber,
      loanId: +LOAN_ID,
      periodNumber,
      fromDate,
      toDate,
      expectedAmount,
      paidAmount: 0,
      outstandingAmount: expectedAmount ?? 0,
      minPaymentCriteriaMet: false,
      delinquentDays: 0,
      delinquentAmount: 0
    };
  }

  let loansServiceStub: {
    createDelinquencyActions: jest.Mock;
    getDelinquencyActions: jest.Mock;
    getWorkingCapitalLoanDelinquencyRangeSchedule: jest.Mock;
  };
  let loanProductServiceStub: { isWorkingCapital: boolean; isLoanProduct: boolean; loanAccountPath: string };
  let cdrStub: { markForCheck: jest.Mock };

  function createComponent(): LoanDelinquencyTagsTabComponent {
    const activatedRouteStub = {
      parent: {
        data: new BehaviorSubject({
          loanDelinquencyTagsData: [],
          loanDelinquencyData: null,
          loanDelinquencyActions: [],
          wcLoanDelinquencyRangeSchedule: staleRangeSchedule
        }),
        parent: { snapshot: { params: { loanId: LOAN_ID } } }
      }
    };

    const datesStub = {
      monthLabels: [] as string[],
      parseDate: (value: any) => new Date(value),
      formatDate: () => null as string,
      isBefore: () => false,
      isAfter: () => false
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: LoansService, useValue: loansServiceStub },
        { provide: LoanProductService, useValue: loanProductServiceStub },
        { provide: ProductsService, useValue: { getLoanProductsTemplate: jest.fn(() => of({})) } },
        { provide: Dates, useValue: datesStub },
        {
          provide: SettingsService,
          useValue: { businessDate: null, language: { code: 'en' }, dateFormat: 'dd MMMM yyyy' }
        },
        { provide: TranslateService, useValue: { instant: (key: string) => key } },
        { provide: ChangeDetectorRef, useValue: cdrStub },
        { provide: MatDialog, useValue: { open: jest.fn() } },
        { provide: Router, useValue: { navigate: jest.fn() } }
      ]
    });

    return TestBed.runInInjectionContext(() => new LoanDelinquencyTagsTabComponent());
  }

  beforeEach(() => {
    loansServiceStub = {
      createDelinquencyActions: jest.fn(() => of({})),
      getDelinquencyActions: jest.fn(() => of([])),
      getWorkingCapitalLoanDelinquencyRangeSchedule: jest.fn(() => of(recomputedRangeSchedule))
    };
    loanProductServiceStub = {
      isWorkingCapital: true,
      isLoanProduct: false,
      loanAccountPath: 'working-capital-loans'
    };
    cdrStub = { markForCheck: jest.fn() };
  });

  it('re-fetches the range schedule after a successful reschedule and replaces the whole table data', () => {
    const component = createComponent();
    expect(component.wcLoanDelinquencyRangeSchedule).toEqual(staleRangeSchedule);

    component.sendDelinquencyAction('reschedule', null, null, 1500, 'FIXED_AMOUNT', 1, 'MONTHS', null);

    expect(loansServiceStub.createDelinquencyActions).toHaveBeenCalledWith(
      'working-capital-loans',
      LOAN_ID,
      expect.objectContaining({ action: 'reschedule', minimumPayment: 1500, frequency: 1 })
    );
    expect(loansServiceStub.getWorkingCapitalLoanDelinquencyRangeSchedule).toHaveBeenCalledWith(LOAN_ID);
    // The full array is replaced (new boundaries, new row count, null expectedAmount kept as null).
    expect(component.wcLoanDelinquencyRangeSchedule).toEqual(recomputedRangeSchedule);
    expect(component.wcLoanDelinquencyRangeSchedule.length).toBe(4);
    expect(component.wcLoanDelinquencyRangeSchedule[1].expectedAmount).toBeNull();
    // The actions list is recomputed by the same backend command, so it is re-read too.
    expect(loansServiceStub.getDelinquencyActions).toHaveBeenCalledWith('working-capital-loans', LOAN_ID);
    // OnPush: the refreshed plain-array state must be flagged for change detection.
    expect(cdrStub.markForCheck).toHaveBeenCalled();
  });

  it('does not re-fetch the range schedule when the delinquency action fails', () => {
    // The component subscribes without an error callback; swallow the unhandled
    // error rxjs reports asynchronously so it does not fail an unrelated test.
    const previousOnUnhandledError = config.onUnhandledError;
    config.onUnhandledError = () => {};
    try {
      loansServiceStub.createDelinquencyActions.mockReturnValue(throwError(() => ({ status: 400 })));
      const component = createComponent();

      component.sendDelinquencyAction('reschedule', null, null, 1500, 'FIXED_AMOUNT', 1, 'MONTHS', null);

      expect(loansServiceStub.getWorkingCapitalLoanDelinquencyRangeSchedule).not.toHaveBeenCalled();
      expect(loansServiceStub.getDelinquencyActions).not.toHaveBeenCalled();
      expect(component.wcLoanDelinquencyRangeSchedule).toEqual(staleRangeSchedule);
    } finally {
      config.onUnhandledError = previousOnUnhandledError;
    }
  });

  it('does not call the working capital range schedule endpoint for regular loan products', () => {
    loanProductServiceStub.isWorkingCapital = false;
    loanProductServiceStub.isLoanProduct = true;
    loanProductServiceStub.loanAccountPath = 'loans';
    const component = createComponent();

    component.sendDelinquencyAction(
      'pause',
      new Date('2026-08-01'),
      new Date('2026-08-15'),
      null,
      null,
      null,
      null,
      null
    );

    expect(loansServiceStub.getWorkingCapitalLoanDelinquencyRangeSchedule).not.toHaveBeenCalled();
    expect(loansServiceStub.getDelinquencyActions).toHaveBeenCalledWith('loans', LOAN_ID);
  });
});
