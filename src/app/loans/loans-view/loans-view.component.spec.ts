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

  function createComponent(): LoansViewComponent {
    const routeStub = {
      data: routeData$,
      params: new BehaviorSubject({ loanId: '1' }),
      snapshot: {
        params: { loanId: '1' },
        queryParamMap: convertToParamMap({})
      }
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: ActivatedRoute, useValue: routeStub },
        { provide: LoansService, useValue: loansServiceStub },
        { provide: SystemService, useValue: systemServiceStub },
        {
          provide: LoanProductService,
          useValue: {
            isLoanProduct: true,
            isWorkingCapital: false,
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
});
