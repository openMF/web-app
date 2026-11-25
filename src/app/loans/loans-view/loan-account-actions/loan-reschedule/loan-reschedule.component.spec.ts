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
import { PenaltyManagementService } from 'app/loans/services/penalty-management.service';
import { LoanProductService } from 'app/products/loan-products/services/loan-product.service';
import { SettingsService } from 'app/settings/settings.service';
import { environment } from 'environments/environment';
import { LoanRescheduleComponent } from './loan-reschedule.component';

describe('LoanRescheduleComponent', () => {
  const businessDate = new Date(2026, 0, 10);
  const template = {
    rescheduleReasons: [
      { id: 1, name: 'Illness' },
      { id: 2, name: 'Economic shock' }
    ]
  };

  let loansServiceStub: any;
  let penaltyServiceStub: any;

  function createComponent(): LoanRescheduleComponent {
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
        { provide: PenaltyManagementService, useValue: penaltyServiceStub },
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

    const component = TestBed.runInInjectionContext(() => new LoanRescheduleComponent());
    component.dataObject = template;
    component.ngOnInit();
    return component;
  }

  beforeEach(() => {
    loansServiceStub = {
      getLoanAccountAssociationDetails: jest.fn(() => of({ repaymentSchedule: { periods: [] } }))
    };
    penaltyServiceStub = {
      loadPenalties: jest.fn(() => of([]))
    };
  });

  it('initializes the reschedule form and loads reasons', () => {
    const component = createComponent();
    expect(component.rescheduleLoanForm).toBeDefined();
    expect(component.codes).toEqual(template.rescheduleReasons);
    expect(component.rescheduleLoanForm.valid).toBe(false);
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

    it('guards the submit button visibility based on CREATE_RESCHEDULELOAN permission', async () => {
      let currentPermissions: string[] = ['CREATE_RESCHEDULELOAN'];
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [
          LoanRescheduleComponent,
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
          { provide: PenaltyManagementService, useValue: penaltyServiceStub },
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

      // 1. With CREATE_RESCHEDULELOAN -> button is visible
      const fixtureWithPerm = TestBed.createComponent(LoanRescheduleComponent);
      fixtureWithPerm.componentInstance.dataObject = template;
      fixtureWithPerm.detectChanges();
      expect(fixtureWithPerm.nativeElement.querySelector('button[color="primary"]')).not.toBeNull();

      // 2. Without CREATE_RESCHEDULELOAN (e.g. only APPROVE_RESCHEDULELOAN) -> button is hidden
      currentPermissions = ['APPROVE_RESCHEDULELOAN'];
      const fixtureWithoutPerm = TestBed.createComponent(LoanRescheduleComponent);
      fixtureWithoutPerm.componentInstance.dataObject = template;
      fixtureWithoutPerm.detectChanges();
      expect(fixtureWithoutPerm.nativeElement.querySelector('button[color="primary"]')).toBeNull();
    });
  });
});
