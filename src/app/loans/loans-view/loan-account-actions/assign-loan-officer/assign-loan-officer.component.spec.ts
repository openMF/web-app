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
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { Dates } from 'app/core/utils/dates';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { LoansService } from 'app/loans/loans.service';
import { LoanProductService } from 'app/products/loan-products/services/loan-product.service';
import { SettingsService } from 'app/settings/settings.service';
import { environment } from 'environments/environment';
import { AssignLoanOfficerComponent } from './assign-loan-officer.component';

describe('AssignLoanOfficerComponent', () => {
  const businessDate = new Date(2026, 0, 10);
  const template = {
    loanOfficerId: 10,
    loanOfficerOptions: [
      { id: 1, displayName: 'John Doe' },
      { id: 2, displayName: 'Jane Smith' }
    ]
  };

  let loansServiceStub: any;

  function createComponent(): AssignLoanOfficerComponent {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        UntypedFormBuilder,
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
              date instanceof Date ? `${date.getDate()} January ${date.getFullYear()}` : String(date)
          }
        }
      ]
    });

    const component = TestBed.runInInjectionContext(() => new AssignLoanOfficerComponent());
    component.dataObject = template;
    component.ngOnInit();
    return component;
  }

  beforeEach(() => {
    loansServiceStub = {
      loanActionButtons: jest.fn(() => of({}))
    };
  });

  it('creates the form and initializes with officer options', () => {
    const component = createComponent();
    expect(component.assignOfficerForm).toBeDefined();
    expect(component.loanOfficers).toEqual(template.loanOfficerOptions);
    expect(component.assignOfficerForm.valid).toBe(false);
  });

  it('submits valid officer assignment data', () => {
    const component = createComponent();
    jest.spyOn(component, 'gotoLoanDefaultView').mockImplementation(() => undefined);

    component.assignOfficerForm.patchValue({
      toLoanOfficerId: 2,
      assignmentDate: businessDate
    });

    expect(component.assignOfficerForm.valid).toBe(true);
    component.submit();

    expect(loansServiceStub.loanActionButtons).toHaveBeenCalledWith('1', 'assignLoanOfficer', {
      toLoanOfficerId: 2,
      assignmentDate: '10 January 2026',
      fromLoanOfficerId: 10,
      dateFormat: 'dd MMMM yyyy',
      locale: 'en'
    });
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

    it('guards the submit button visibility based on UPDATELOANOFFICER_LOAN permission', async () => {
      let currentPermissions: string[] = ['UPDATELOANOFFICER_LOAN'];
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [
          AssignLoanOfficerComponent,
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
                date instanceof Date ? `${date.getDate()} January ${date.getFullYear()}` : String(date)
            }
          },
          {
            provide: AuthenticationService,
            useValue: { getCredentials: () => ({ permissions: currentPermissions }) }
          }
        ]
      }).compileComponents();

      // 1. With UPDATELOANOFFICER_LOAN -> button is visible
      const fixtureWithPerm = TestBed.createComponent(AssignLoanOfficerComponent);
      fixtureWithPerm.componentInstance.dataObject = template;
      fixtureWithPerm.detectChanges();
      expect(fixtureWithPerm.nativeElement.querySelector('button[color="primary"]')).not.toBeNull();

      // 2. Without UPDATELOANOFFICER_LOAN (e.g. only BULKREASSIGN_LOAN) -> button is hidden
      currentPermissions = ['BULKREASSIGN_LOAN'];
      const fixtureWithoutPerm = TestBed.createComponent(AssignLoanOfficerComponent);
      fixtureWithoutPerm.componentInstance.dataObject = template;
      fixtureWithoutPerm.detectChanges();
      expect(fixtureWithoutPerm.nativeElement.querySelector('button[color="primary"]')).toBeNull();
    });
  });
});
