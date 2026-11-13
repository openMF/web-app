/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectorRef } from '@angular/core';
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
