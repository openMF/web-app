/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { ErrorHandlerService } from 'app/core/error-handler/error-handler.service';
import { LoansService } from 'app/loans/loans.service';
import { LoanProductService } from 'app/products/loan-products/services/loan-product.service';
import { SettingsService } from 'app/settings/settings.service';
import { SystemService } from 'app/system/system.service';
import { LoansViewComponent } from './loans-view.component';

describe('LoansViewComponent', () => {
  const loanDetailsData = {
    loanProductName: 'Test loan',
    status: { active: false, value: 'Submitted and pending approval' },
    currency: { code: 'USD' },
    transactions: [] as any[]
  };

  let routeData$: BehaviorSubject<any>;
  let datatables$: Subject<any[]>;
  let arrearsConfiguration$: Subject<any>;
  let loansServiceStub: any;
  let systemServiceStub: any;

  /**
   * Builds the component straight from the injection context, without rendering its template: the action menu is
   * assembled in the constructor, so consuming the seeded route data is enough to assert on it.
   *
   * The TestBed is reset on every call because several tests build a component per product type or per flag value.
   * @param productType Which product the LoanProductService stub reports; defaults to a plain loan product.
   */
  function createComponent(
    productType: { isLoanProduct: boolean; isWorkingCapital: boolean } = {
      isLoanProduct: true,
      isWorkingCapital: false
    }
  ): LoansViewComponent {
    const routeStub = {
      data: routeData$,
      params: new BehaviorSubject({ loanId: '1' }),
      snapshot: {
        params: { loanId: '1' },
        queryParamMap: convertToParamMap({})
      }
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: ActivatedRoute, useValue: routeStub },
        { provide: LoansService, useValue: loansServiceStub },
        { provide: SystemService, useValue: systemServiceStub },
        {
          provide: LoanProductService,
          useValue: {
            isLoanProduct: productType.isLoanProduct,
            isWorkingCapital: productType.isWorkingCapital,
            initialize: jest.fn()
          }
        },
        { provide: Router, useValue: { url: '/clients/1/loans-accounts/1/general', navigate: jest.fn() } },
        { provide: TranslateService, useValue: { instant: (key: string) => key } },
        { provide: SettingsService, useValue: {} },
        { provide: ErrorHandlerService, useValue: { handleError: jest.fn() } },
        { provide: MatDialog, useValue: { open: jest.fn() } }
      ]
    });

    return TestBed.runInInjectionContext(() => new LoansViewComponent());
  }

  /**
   * Seeds the resolved route data with an active loan, which is the only status
   * whose action menu carries Prepay Loan and Add Interest Pause.
   */
  function seedActiveLoan(overrides: Record<string, unknown> = {}): void {
    routeData$.next({
      loanDetailsData: {
        ...loanDetailsData,
        status: { active: true, value: 'Active' },
        ...overrides
      }
    });
  }

  /**
   * Flattens the assembled action menu to the button names, which is all these tests assert on.
   * @param component The component whose button configuration to read.
   * @returns The action names in menu order, or an empty list when no menu was built.
   */
  function buttonNames(component: LoansViewComponent): string[] {
    return (component.buttonConfig?.singleButtons ?? []).map((button: { name: string }) => button.name);
  }

  beforeEach(() => {
    routeData$ = new BehaviorSubject({ loanDetailsData });
    datatables$ = new Subject<any[]>();
    arrearsConfiguration$ = new Subject<any>();
    loansServiceStub = {
      getLoanDataTables: jest.fn(() => datatables$),
      getEntityDataTableChecks: jest.fn(() => of({ pageItems: [] })),
      saveLoanDisbursementDetailsData: jest.fn()
    };
    systemServiceStub = {
      getConfigurationByName: jest.fn(() => arrearsConfiguration$)
    };
  });

  it('does not wait for datatables or the arrears configuration before consuming route-resolved loan details', () => {
    const component = createComponent();

    expect(component.loanDetailsData).toEqual(loanDetailsData);
    expect(component.datatablesReady).toBe(false);
    expect(loansServiceStub.getLoanDataTables).toHaveBeenCalledWith('m_loan');
    expect(systemServiceStub.getConfigurationByName).toHaveBeenCalledWith('loan-arrears-delinquency-display-data');
  });

  it('populates deferred datatables and arrears configuration independently when each request completes', () => {
    const component = createComponent();
    const datatables = [{ registeredTableName: 'loan_extra' }];

    arrearsConfiguration$.next({ value: 2 });

    expect(component.loanDisplayArrearsDelinquency).toBe(2);
    expect(component.datatablesReady).toBe(false);

    datatables$.next(datatables);

    expect(component.loanDatatables).toEqual(datatables);
    expect(component.datatablesReady).toBe(true);
  });

  describe('action menu on an active loan', () => {
    it('offers Prepay Loan whether or not the product recalculates interest', () => {
      seedActiveLoan({ isInterestRecalculationEnabled: false });
      expect(buttonNames(createComponent())).toContain('Prepay Loan');

      seedActiveLoan({ isInterestRecalculationEnabled: true });
      expect(buttonNames(createComponent())).toContain('Prepay Loan');
    });

    it('offers Add Interest Pause only when the loan recalculates interest', () => {
      seedActiveLoan({ isInterestRecalculationEnabled: true });
      expect(buttonNames(createComponent())).toContain('Add Interest Pause');

      seedActiveLoan({ isInterestRecalculationEnabled: false });
      expect(buttonNames(createComponent())).not.toContain('Add Interest Pause');
    });

    it('withholds Add Interest Pause when the loan details omit the interest recalculation flag', () => {
      seedActiveLoan();

      expect(buttonNames(createComponent())).not.toContain('Add Interest Pause');
    });

    it('leaves the Working Capital action menu to its own configuration', () => {
      seedActiveLoan({ isInterestRecalculationEnabled: false });

      const names = buttonNames(createComponent({ isLoanProduct: false, isWorkingCapital: true }));

      // Working Capital declares Prepay Loan itself, so it appears exactly once
      // and never picks up the loan-product entry or Add Interest Pause.
      expect(names.filter((name) => name === 'Prepay Loan')).toHaveLength(1);
      expect(names).not.toContain('Add Interest Pause');
    });
  });
});
