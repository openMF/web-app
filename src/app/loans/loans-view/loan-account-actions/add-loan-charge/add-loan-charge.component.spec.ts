/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNativeDateAdapter } from '@angular/material/core';
import { TranslateModule } from '@ngx-translate/core';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Dates } from 'app/core/utils/dates';
import { LoansService } from 'app/loans/loans.service';
import { LoanProductService } from 'app/products/loan-products/services/loan-product.service';
import { SettingsService } from 'app/settings/settings.service';
import { AddLoanChargeComponent } from './add-loan-charge.component';

const chargeOptions = [
  {
    id: 1,
    name: 'DP fee',
    amount: 10,
    currency: { name: 'USD' },
    chargeCalculationType: { value: 'Flat' },
    chargeTimeType: { id: 17, value: 'Down Payment' }
  },
  {
    id: 2,
    name: 'Specified due date fee',
    amount: 5,
    currency: { name: 'USD' },
    chargeCalculationType: { value: 'Flat' },
    chargeTimeType: { id: 2, value: 'Specified due date' }
  }
];
const loan = {
  repaymentSchedule: {
    periods: [
      { period: null, dueDate: [
          2026,
          1,
          1
        ] },
      { period: 1, dueDate: [
          2026,
          1,
          1
        ], downPaymentPeriod: true },
      { period: 2, dueDate: [
          2026,
          2,
          1
        ] },
      { period: 3, dueDate: [
          2026,
          3,
          1
        ], downPaymentPeriod: true },
      { period: 4, dueDate: [
          2026,
          4,
          1
        ] }
    ]
  }
};

describe('AddLoanChargeComponent - down payment fee due date', () => {
  let getLoanAccountAssociationDetails: jest.Mock;

  /**
   * Builds the component without rendering the template.
   * @param loanResponse Response of the loan details request.
   * @returns The component after `ngOnInit`.
   */
  function createComponent(loanResponse = of<unknown>(loan)): AddLoanChargeComponent {
    getLoanAccountAssociationDetails = jest.fn(() => loanResponse);
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: { data: of({ actionButtonData: { chargeOptions } }), snapshot: { params: { loanId: '7' } } }
        },
        { provide: Router, useValue: {} },
        { provide: LoanProductService, useValue: { isWorkingCapital: false, isLoanProduct: true } },
        { provide: LoansService, useValue: { getLoanAccountAssociationDetails } },
        { provide: SettingsService, useValue: { maxFutureDate: new Date(2030, 0, 1) } },
        { provide: Dates, useValue: { parseDate: (value: number[]) => new Date(value[0], value[1] - 1, value[2]) } },
        { provide: ChangeDetectorRef, useValue: { markForCheck: jest.fn() } }
      ]
    });
    const component = TestBed.runInInjectionContext(() => new AddLoanChargeComponent());
    component.ngOnInit();
    return component;
  }

  it('pre-fills the latest down payment installment date for a down payment fee', () => {
    const component = createComponent();

    component.loanChargeForm.patchValue({ chargeId: 1 });

    expect(getLoanAccountAssociationDetails).toHaveBeenCalledWith('7');
    expect(component.loanChargeForm.get('dueDate')?.value).toEqual(new Date(2026, 2, 1));
  });

  it('lets the user pick only down payment installment dates for a down payment fee', () => {
    const component = createComponent();

    component.loanChargeForm.patchValue({ chargeId: 1 });

    expect(component.dueDateFilter(new Date(2026, 0, 1))).toBe(true);
    expect(component.dueDateFilter(new Date(2026, 1, 1))).toBe(false);
  });

  it('does not restrict the due date of a specified due date fee', () => {
    const component = createComponent();

    component.loanChargeForm.patchValue({ chargeId: 2 });

    expect(getLoanAccountAssociationDetails).not.toHaveBeenCalled();
    expect(component.loanChargeForm.get('dueDate')?.value).toBe('');
    expect(component.dueDateFilter(new Date(2026, 1, 1))).toBe(true);
  });

  it('replaces a date kept from a specified due date fee that is not a down payment installment date', () => {
    const component = createComponent();
    component.loanChargeForm.patchValue({ chargeId: 2 });
    component.loanChargeForm.get('dueDate')?.setValue(new Date(2026, 1, 1));

    component.loanChargeForm.patchValue({ chargeId: 1 });

    expect(component.loanChargeForm.get('dueDate')?.value).toEqual(new Date(2026, 2, 1));
  });

  it('keeps a chosen down payment installment date when the charge changes', () => {
    const component = createComponent();
    component.loanChargeForm.patchValue({ chargeId: 2 });
    component.loanChargeForm.get('dueDate')?.setValue(new Date(2026, 0, 1));

    component.loanChargeForm.patchValue({ chargeId: 1 });

    expect(component.loanChargeForm.get('dueDate')?.value).toEqual(new Date(2026, 0, 1));
  });

  it('leaves the due date blank and unrestricted when the schedule cannot be loaded', () => {
    const component = createComponent(throwError(() => new Error('500')));

    component.loanChargeForm.patchValue({ chargeId: 1 });

    expect(component.loanChargeForm.get('dueDate')?.value).toBe('');
    expect(component.dueDateFilter(new Date(2026, 1, 1))).toBe(true);
  });
});

describe('AddLoanChargeComponent - rendered due date validation', () => {
  let fixture: ComponentFixture<AddLoanChargeComponent>;
  let component: AddLoanChargeComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AddLoanChargeComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        provideNativeDateAdapter(),
        {
          provide: ActivatedRoute,
          useValue: { data: of({ actionButtonData: { chargeOptions } }), snapshot: { params: { loanId: '7' } } }
        },
        { provide: Router, useValue: {} },
        { provide: LoanProductService, useValue: { isWorkingCapital: false, isLoanProduct: true } },
        { provide: LoansService, useValue: { getLoanAccountAssociationDetails: () => of(loan) } },
        { provide: SettingsService, useValue: { maxFutureDate: new Date(2030, 0, 1) } },
        { provide: Dates, useValue: { parseDate: (value: number[]) => new Date(value[0], value[1] - 1, value[2]) } },
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions: ['ALL_FUNCTIONS'] }) } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(AddLoanChargeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /** Selects a charge and renders, so the due date input binds the datepicker validators to the control. */
  function selectCharge(chargeId: number) {
    component.loanChargeForm.patchValue({ chargeId });
    fixture.detectChanges();
  }

  const dueDate = () => component.loanChargeForm.get('dueDate')!;

  it('rejects a date that is not a down payment installment date for a down payment fee', () => {
    selectCharge(1);

    dueDate().setValue(new Date(2026, 1, 1));

    expect(dueDate().hasError('matDatepickerFilter')).toBe(true);
    expect(component.loanChargeForm.valid).toBe(false);
  });

  it('leaves a valid down payment date after switching from a specified due date fee with an excluded date', () => {
    selectCharge(2);
    dueDate().setValue(new Date(2026, 1, 1));
    expect(dueDate().valid).toBe(true);

    selectCharge(1);

    expect(dueDate().value).toEqual(new Date(2026, 2, 1));
    expect(dueDate().valid).toBe(true);
  });

  it('accepts any date again after switching back to a specified due date fee', () => {
    selectCharge(1);
    selectCharge(2);

    dueDate().setValue(new Date(2026, 1, 1));

    expect(dueDate().valid).toBe(true);
  });
});
