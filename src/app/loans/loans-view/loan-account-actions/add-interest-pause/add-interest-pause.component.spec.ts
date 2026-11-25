/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectorRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { Dates } from 'app/core/utils/dates';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { LoansService } from 'app/loans/loans.service';
import { LoanProductService } from 'app/products/loan-products/services/loan-product.service';
import { SettingsService } from 'app/settings/settings.service';
import { environment } from 'environments/environment';
import { AddInterestPauseComponent } from './add-interest-pause.component';

describe('AddInterestPauseComponent', () => {
  const businessDate = new Date(2026, 0, 10);
  const maturityDate = new Date(2027, 0, 10);

  const template = {
    timeline: {
      expectedMaturityDate: '10 January 2027'
    }
  };

  let loansServiceStub: any;
  let cdr: { markForCheck: jest.Mock };

  function createComponent(): AddInterestPauseComponent {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        UntypedFormBuilder,
        { provide: ChangeDetectorRef, useValue: cdr },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: { loanId: '1' } },
            data: of({}),
            pathFromRoot: []
          }
        },
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: LoansService, useValue: loansServiceStub },
        {
          provide: LoanProductService,
          useValue: {
            isLoanProduct: true,
            isWorkingCapital: false,
            loanAccountPath: 'loans',
            productType: { value: 'loan' }
          }
        },
        {
          provide: SettingsService,
          useValue: {
            businessDate,
            dateFormat: 'dd MMMM yyyy',
            language: { code: 'en' }
          }
        },
        {
          provide: Dates,
          useValue: {
            formatDate: (date: Date) =>
              date instanceof Date ? `${date.getDate()} January ${date.getFullYear()}` : String(date),
            parseDate: (val: any) => (val === '10 January 2027' ? maturityDate : null),
            angularToMomentFormat: (val: string) => val,
            getMomentLocale: () => 'en'
          }
        }
      ]
    });

    const component = TestBed.runInInjectionContext(() => new AddInterestPauseComponent());
    component.dataObject = template;
    component.ngOnInit();
    return component;
  }

  beforeEach(() => {
    loansServiceStub = {
      addInterestPauseToLoan: jest.fn(() => of({}))
    };
    cdr = { markForCheck: jest.fn() };
  });

  it('submits the formatted dates and navigates to the term variations tab', () => {
    const component = createComponent();
    const gotoSpy = jest.spyOn(component, 'gotoLoanView').mockImplementation(() => undefined);

    component.submit();

    expect(loansServiceStub.addInterestPauseToLoan).toHaveBeenCalledWith('1', {
      startDate: '10 January 2026',
      endDate: '10 January 2026',
      dateFormat: 'dd MMMM yyyy',
      locale: 'en'
    });
    expect(gotoSpy).toHaveBeenCalledWith('term-variations');
    expect(component.isSubmitting).toBe(false);
  });

  it('keeps the submit state active while the request is pending and blocks duplicates', () => {
    const component = createComponent();
    const inFlight = new Subject<any>();
    loansServiceStub.addInterestPauseToLoan.mockReturnValue(inFlight.asObservable());

    component.submit();

    expect(component.isSubmitting).toBe(true);
    component.submit();
    expect(loansServiceStub.addInterestPauseToLoan).toHaveBeenCalledTimes(1);

    inFlight.next({});
    inFlight.complete();

    expect(component.isSubmitting).toBe(false);
  });

  it('resets the submit state for the global notification after a failed request without navigating', () => {
    const component = createComponent();
    const gotoSpy = jest.spyOn(component, 'gotoLoanView').mockImplementation(() => undefined);
    loansServiceStub.addInterestPauseToLoan.mockReturnValue(throwError(() => new Error('boom')));

    component.submit();

    expect(component.isSubmitting).toBe(false);
    expect(cdr.markForCheck).toHaveBeenCalledTimes(2);
    expect(gotoSpy).not.toHaveBeenCalled();
  });

  it('allows retrying after a failed request', () => {
    const component = createComponent();
    const gotoSpy = jest.spyOn(component, 'gotoLoanView').mockImplementation(() => undefined);
    loansServiceStub.addInterestPauseToLoan
      .mockReturnValueOnce(throwError(() => new Error('boom')))
      .mockReturnValueOnce(of({}));

    component.submit();
    expect(component.isSubmitting).toBe(false);

    component.submit();

    expect(loansServiceStub.addInterestPauseToLoan).toHaveBeenCalledTimes(2);
    expect(gotoSpy).toHaveBeenCalledWith('term-variations');
    expect(component.isSubmitting).toBe(false);
  });

  it('does not call the API when the form is invalid', () => {
    const component = createComponent();
    component.interestPauseLoanForm.controls['endDate'].setValue(null);

    component.submit();

    expect(loansServiceStub.addInterestPauseToLoan).not.toHaveBeenCalled();
    expect(component.isSubmitting).toBe(false);
  });

  describe('Submit button permission guard (WEB-1478)', () => {
    let rbacWasEnabled: boolean;

    beforeEach(() => {
      rbacWasEnabled = environment.productionModeEnableRBAC;
      environment.productionModeEnableRBAC = true;
    });

    afterEach(() => {
      environment.productionModeEnableRBAC = rbacWasEnabled;
    });

    it('guards the submit button visibility based on CREATE_INTEREST_PAUSE permission', async () => {
      let currentPermissions: string[] = ['CREATE_INTEREST_PAUSE'];
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [
          AddInterestPauseComponent,
          TranslateModule.forRoot()
        ],
        providers: [
          provideNativeDateAdapter(),
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: { params: { loanId: '1' } },
              data: of({}),
              pathFromRoot: []
            }
          },
          { provide: Router, useValue: { navigate: jest.fn() } },
          { provide: LoansService, useValue: loansServiceStub },
          {
            provide: LoanProductService,
            useValue: {
              isLoanProduct: true,
              isWorkingCapital: false,
              loanAccountPath: 'loans',
              productType: { value: 'loan' }
            }
          },
          {
            provide: SettingsService,
            useValue: {
              businessDate,
              dateFormat: 'dd MMMM yyyy',
              language: { code: 'en' }
            }
          },
          {
            provide: Dates,
            useValue: {
              formatDate: (date: Date) =>
                date instanceof Date ? `${date.getDate()} January ${date.getFullYear()}` : String(date),
              parseDate: (val: any) => (val === '10 January 2027' ? maturityDate : null),
              angularToMomentFormat: (val: string) => val,
              getMomentLocale: () => 'en'
            }
          },
          {
            provide: AuthenticationService,
            useValue: { getCredentials: () => ({ permissions: currentPermissions }) }
          }
        ]
      }).compileComponents();

      // 1. With CREATE_INTEREST_PAUSE -> button is visible
      const fixtureWithPerm = TestBed.createComponent(AddInterestPauseComponent);
      fixtureWithPerm.componentInstance.dataObject = template;
      fixtureWithPerm.detectChanges();
      expect(fixtureWithPerm.nativeElement.querySelector('button[color="primary"]')).not.toBeNull();

      // 2. Without CREATE_INTEREST_PAUSE (e.g. only DISBURSE_LOAN) -> button is hidden
      currentPermissions = ['DISBURSE_LOAN'];
      const fixtureWithoutPerm = TestBed.createComponent(AddInterestPauseComponent);
      fixtureWithoutPerm.componentInstance.dataObject = template;
      fixtureWithoutPerm.detectChanges();
      expect(fixtureWithoutPerm.nativeElement.querySelector('button[color="primary"]')).toBeNull();
    });
  });
});
