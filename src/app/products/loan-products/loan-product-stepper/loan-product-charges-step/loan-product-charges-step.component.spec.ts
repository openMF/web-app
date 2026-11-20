/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectorRef, SimpleChange } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { LoanProductService } from '../../services/loan-product.service';
import { LoanProductChargesStepComponent } from './loan-product-charges-step.component';

describe('LoanProductChargesStepComponent - charges table refresh', () => {
  const charge = { id: 1, name: 'Fee' };
  let markForCheck: jest.Mock;

  /**
   * Builds an initialised component holding a single charge, without rendering the template.
   * @returns The component.
   */
  function createComponent(): LoanProductChargesStepComponent {
    markForCheck = jest.fn();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: MatDialog, useValue: { open: jest.fn(() => ({ afterClosed: () => of({ delete: true }) })) } },
        { provide: TranslateService, useValue: { instant: (key: string) => key } },
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: LoanProductService, useValue: { isLoanProduct: true } },
        { provide: ChangeDetectorRef, useValue: { markForCheck } }
      ]
    });
    const component = TestBed.runInInjectionContext(() => new LoanProductChargesStepComponent());
    component.loanProductsTemplate = { chargeOptions: [], charges: [charge] };
    component.currencyCode = new UntypedFormControl('USD');
    component.multiDisburseLoan = new UntypedFormControl(false);
    component.ngOnInit();
    return component;
  }

  it('refreshes the table when the currency change clears the charges', () => {
    const component = createComponent();

    component.currencyCode.setValue('EUR');

    expect(component.chargesDataSource).toEqual([]);
    expect(markForCheck).toHaveBeenCalled();
  });

  it('refreshes the table when the multi-disbursement change clears the charges', () => {
    const component = createComponent();

    component.multiDisburseLoan.setValue(true);

    expect(component.chargesDataSource).toEqual([]);
    expect(markForCheck).toHaveBeenCalled();
  });

  it('refreshes the table after a charge is deleted', () => {
    const component = createComponent();

    component.deleteCharge(charge);

    expect(component.chargesDataSource).toEqual([]);
    expect(markForCheck).toHaveBeenCalled();
  });
});

describe('LoanProductChargesStepComponent - down payment fee eligibility', () => {
  const regularFee = { id: 1, name: 'Fee', chargeTimeType: { id: 2 } };
  const downPaymentFee = { id: 2, name: 'DP fee', chargeTimeType: { id: 17 } };

  /**
   * Builds an initialised component holding a regular and a down payment fee, watching the given settings form.
   * @param settingsForm Form holding `enableDownPayment` and `loanScheduleType`.
   * @returns The component.
   */
  function createComponent(settingsForm: UntypedFormGroup): LoanProductChargesStepComponent {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: MatDialog, useValue: { open: jest.fn() } },
        { provide: TranslateService, useValue: { instant: (key: string) => key } },
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: LoanProductService, useValue: { isLoanProduct: true } },
        { provide: ChangeDetectorRef, useValue: { markForCheck: jest.fn() } }
      ]
    });
    const component = TestBed.runInInjectionContext(() => new LoanProductChargesStepComponent());
    component.loanProductsTemplate = { chargeOptions: [], charges: [
        regularFee,
        downPaymentFee
      ] };
    component.currencyCode = new UntypedFormControl('USD');
    component.multiDisburseLoan = null;
    component.loanProductSettingsForm = settingsForm;
    component.ngOnChanges({ loanProductSettingsForm: new SimpleChange(null, settingsForm, true) });
    component.ngOnInit();
    return component;
  }

  /**
   * Settings of a progressive product with down payment enabled.
   * @returns The settings form.
   */
  function settingsForm(): UntypedFormGroup {
    return new UntypedFormGroup({
      enableDownPayment: new UntypedFormControl(true),
      loanScheduleType: new UntypedFormControl('PROGRESSIVE')
    });
  }

  it('removes selected down payment fees when down payment is disabled', () => {
    const form = settingsForm();
    const component = createComponent(form);

    form.patchValue({ enableDownPayment: false });

    expect(component.chargesDataSource).toEqual([regularFee]);
  });

  it('removes selected down payment fees when the schedule type is no longer progressive', () => {
    const form = settingsForm();
    const component = createComponent(form);

    form.patchValue({ loanScheduleType: 'CUMULATIVE' });

    expect(component.chargesDataSource).toEqual([regularFee]);
  });

  it('keeps every fee while down payment fees stay supported', () => {
    const form = settingsForm();
    const component = createComponent(form);

    form.patchValue({ loanScheduleType: 'progressive' });

    expect(component.chargesDataSource).toEqual([
      regularFee,
      downPaymentFee
    ]);
  });

  it('resets a pending down payment fee selection when it becomes unsupported', () => {
    const form = settingsForm();
    const component = createComponent(form);
    component.chargeSelect = { value: downPaymentFee } as unknown as MatSelect;

    form.patchValue({ enableDownPayment: false });

    expect(component.chargeSelect.value).toBe('');
  });

  it('keeps a pending regular fee selection', () => {
    const form = settingsForm();
    const component = createComponent(form);
    component.chargeSelect = { value: regularFee } as unknown as MatSelect;

    form.patchValue({ enableDownPayment: false });

    expect(component.chargeSelect.value).toBe(regularFee);
  });
});
