/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectorRef, SimpleChange } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import { LoansAccountChargesStepComponent } from './loans-account-charges-step.component';

describe('LoansAccountChargesStepComponent - charges table refresh', () => {
  const charge = {
    chargeId: 1,
    name: 'Fee',
    amount: 12,
    feeInterval: 1,
    chargeTimeType: { value: 'Specified due date' },
    chargeCalculationType: { code: 'chargeCalculationType.flat' }
  };
  let markForCheck: jest.Mock;

  /**
   * Builds the component with a dialog that closes with the given response, without rendering the template.
   * @param dialogResponse Value emitted by `afterClosed()`.
   * @returns The component holding a single charge.
   */
  function createComponent(dialogResponse: unknown): LoansAccountChargesStepComponent {
    markForCheck = jest.fn();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: MatDialog, useValue: { open: jest.fn(() => ({ afterClosed: () => of(dialogResponse) })) } },
        { provide: Dates, useValue: { formatDate: jest.fn(() => '01 January 2026') } },
        { provide: ActivatedRoute, useValue: { snapshot: { params: {} } } },
        { provide: SettingsService, useValue: { dateFormat: 'dd MMMM yyyy', maxFutureDate: new Date() } },
        { provide: TranslateService, useValue: { instant: (key: string) => key } },
        { provide: ChangeDetectorRef, useValue: { markForCheck } }
      ]
    });
    const component = TestBed.runInInjectionContext(() => new LoansAccountChargesStepComponent());
    component.chargesDataSource = [charge];
    return component;
  }

  it('refreshes the table after the charge amount is edited', () => {
    const component = createComponent({ data: { value: { amount: 13 } } });

    component.editChargeAmount(charge);

    expect(component.chargesDataSource).toEqual([{ ...charge, amount: 13 }]);
    expect(markForCheck).toHaveBeenCalled();
  });

  it('refreshes the table after the charge date is edited', () => {
    const component = createComponent({ data: { value: { date: new Date() } } });

    component.editChargeDate(charge);

    expect(component.chargesDataSource).toEqual([{ ...charge, dueDate: '01 January 2026' }]);
    expect(markForCheck).toHaveBeenCalled();
  });

  it('refreshes the table after the fee interval is edited', () => {
    const component = createComponent({ data: { value: { feeInterval: 2 } } });

    component.editChargeFeeInterval(charge);

    expect(component.chargesDataSource).toEqual([{ ...charge, feeInterval: 2 }]);
    expect(markForCheck).toHaveBeenCalled();
  });

  it('refreshes the table after a charge is deleted', () => {
    const component = createComponent({ delete: true });

    component.deleteCharge(charge);

    expect(component.chargesDataSource).toEqual([]);
    expect(markForCheck).toHaveBeenCalled();
  });

  it('leaves the table untouched when the dialog is cancelled', () => {
    const component = createComponent(undefined);

    component.editChargeAmount(charge);

    expect(component.chargesDataSource).toEqual([charge]);
    expect(markForCheck).not.toHaveBeenCalled();
  });
});

describe('LoansAccountChargesStepComponent - down payment fee eligibility', () => {
  const downPaymentFee = { id: 5, name: 'DP fee', chargeTimeType: { id: 17 } };
  const otherFee = { id: 6, name: 'Disbursement fee', chargeTimeType: { id: 1 } };
  const productTemplate = {
    product: { enableDownPayment: true },
    loanScheduleType: { code: 'PROGRESSIVE' },
    chargeOptions: [
      downPaymentFee,
      otherFee
    ],
    charges: [
      downPaymentFee,
      otherFee
    ]
  };
  const firstChanges = {
    loansAccountProductTemplate: new SimpleChange(undefined, productTemplate, true),
    loanEnableDownPayment: new SimpleChange(undefined, undefined, true)
  };

  /**
   * Builds the component without rendering the template, with the product template and loan-level flag set.
   * @param loanEnableDownPayment `enableDownPayment` of the loan from the Terms step.
   * @param loansAccountTemplate The saved account, when modifying an application.
   * @returns The component after its first `ngOnChanges`.
   */
  function createComponent(
    loanEnableDownPayment?: boolean,
    loansAccountTemplate?: any
  ): LoansAccountChargesStepComponent {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: MatDialog, useValue: {} },
        { provide: Dates, useValue: {} },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { params: loansAccountTemplate ? { loanId: '1' } : {} } }
        },
        { provide: SettingsService, useValue: {} },
        { provide: TranslateService, useValue: { instant: (key: string) => key } },
        { provide: ChangeDetectorRef, useValue: { markForCheck: jest.fn() } }
      ]
    });
    const component = TestBed.runInInjectionContext(() => new LoansAccountChargesStepComponent());
    component.loansAccountProductTemplate = productTemplate;
    component.loansSavingsAccountLinked = true;
    component.loanEnableDownPayment = loanEnableDownPayment;
    component.loansAccountTemplate = loansAccountTemplate;
    component.ngOnChanges(firstChanges);
    return component;
  }

  const chargeIds = (charges: {}[]) => charges.map((charge: any) => charge.chargeId ?? charge.id);

  it('offers and pre-fills the down payment fee while the loan keeps down payment enabled', () => {
    const component = createComponent(true);

    expect(chargeIds(component.chargeData)).toEqual([
      5,
      6
    ]);
    expect(chargeIds(component.chargesDataSource)).toEqual([
      5,
      6
    ]);
  });

  it('neither offers nor pre-fills the down payment fee when down payment is turned off for the loan', () => {
    const component = createComponent(false);

    expect(chargeIds(component.chargeData)).toEqual([6]);
    expect(chargeIds(component.chargesDataSource)).toEqual([6]);
  });

  it('removes an added down payment fee and keeps the other charges when down payment is turned off later', () => {
    const component = createComponent(true);
    component.chargesDataSource = component.chargesDataSource.map((charge: any) =>
      charge.id === 6 ? { ...charge, amount: 99 } : charge
    );

    component.loanEnableDownPayment = false;
    component.ngOnChanges({ loanEnableDownPayment: new SimpleChange(true, false, false) });

    expect(component.chargesDataSource).toEqual([{ ...otherFee, chargeId: 6, amount: 99 }]);
    expect(chargeIds(component.chargeData)).toEqual([6]);
    expect(component.pristine).toBe(false);
  });

  const savedAccount = {
    charges: [
      { ...downPaymentFee, chargeId: 5, amount: 10, chargeCalculationType: { code: 'chargeCalculationType.flat' } },
      { ...otherFee, chargeId: 6, amount: 20, chargeCalculationType: { code: 'chargeCalculationType.flat' } }
    ]
  };

  // The parent's form validity follows this step's own `pristine`, so the first edit changes that input.
  it('keeps charge edits on a modified application when only the form validity changes', () => {
    const component = createComponent(true, savedAccount);
    const edited = component.chargesDataSource.map((charge: any) => ({ ...charge, amount: 99 }));
    component.chargesDataSource = edited;

    component.loansAccountFormValid = true;
    component.ngOnChanges({ loansAccountFormValid: new SimpleChange(false, true, false) });

    expect(component.chargesDataSource).toEqual(edited);
  });

  it('does not restore a saved down payment fee from the account when down payment is off for the loan', () => {
    const component = createComponent(false, savedAccount);

    component.ngOnInit();

    expect(chargeIds(component.chargesDataSource)).toEqual([6]);
  });
});
