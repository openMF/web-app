/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DatePipe, registerLocaleData } from '@angular/common';
import localeEN from '@angular/common/locales/en';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';

import { FixedDepositAccountChargesStepComponent } from './fixed-deposit-account-charges-step.component';

registerLocaleData(localeEN);

describe('FixedDepositAccountChargesStepComponent', () => {
  let component: FixedDepositAccountChargesStepComponent;
  let dialog: { open: jest.Mock };

  beforeEach(async () => {
    dialog = { open: jest.fn(() => ({ afterClosed: () => of(undefined) })) };

    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        Dates,
        DatePipe,
        { provide: MatDialog, useValue: dialog },
        {
          provide: SettingsService,
          useValue: {
            dateFormat: 'dd MMMM yyyy'
          }
        }
      ]
    }).compileComponents();

    component = TestBed.runInInjectionContext(() => new FixedDepositAccountChargesStepComponent());
  });

  it('keeps the ISO fee day of a saved account charge when initializing the table', () => {
    component.fixedDepositsAccountTemplate = {
      id: 42,
      charges: [{ chargeId: 7, amount: 10, feeOnMonthDay: '--03-15' }]
    };

    component.ngOnInit();

    expect(component.chargesDataSource).toEqual([
      expect.objectContaining({ id: 7, feeOnMonthDay: '--03-15' })
    ]);
  });

  it('displays the ISO fee day of a saved account charge as a day and month', () => {
    expect(component.formatFeeOnMonthDay('--03-15')).toBe('15 March');
  });

  it('displays the [month, day] of a charge template as a day and month', () => {
    expect(
      component.formatFeeOnMonthDay([
        7,
        22
      ])
    ).toBe('22 July');
  });

  it('displays a fee date picked in the charges step without its year', () => {
    expect(component.formatFeeOnMonthDay('15 March 2027')).toBe('15 March');
  });

  it('leaves the fee day empty when the charge has none', () => {
    expect(component.formatFeeOnMonthDay(undefined)).toBeUndefined();
    expect(component.formatFeeOnMonthDay('')).toBe('');
  });
});
