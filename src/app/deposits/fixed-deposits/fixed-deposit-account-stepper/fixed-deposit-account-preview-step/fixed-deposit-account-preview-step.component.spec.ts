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

import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';

import { FixedDepositAccountPreviewStepComponent } from './fixed-deposit-account-preview-step.component';

registerLocaleData(localeEN);

describe('FixedDepositAccountPreviewStepComponent', () => {
  function createComponent(dateFormat = 'dd MMMM yyyy'): FixedDepositAccountPreviewStepComponent {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        Dates,
        DatePipe,
        {
          provide: SettingsService,
          useValue: { dateFormat }
        }
      ]
    });

    return TestBed.runInInjectionContext(() => new FixedDepositAccountPreviewStepComponent());
  }

  it('displays a manually selected 15 March without its year', () => {
    expect(createComponent().formatFeeOnMonthDay('15 March 2027')).toBe('15 March');
  });

  it('reads a dd/MM/yyyy fee date as the chosen day and month', () => {
    const component = createComponent('dd/MM/yyyy');

    expect(component.formatFeeOnMonthDay('05/11/2027')).toBe('05 November');
  });

  it('displays the ISO month-day of a saved account charge', () => {
    expect(createComponent().formatFeeOnMonthDay('--03-15')).toBe('15 March');
  });

  it('displays the [month, day] of a charge template', () => {
    expect(
      createComponent().formatFeeOnMonthDay([
        7,
        22
      ])
    ).toBe('22 July');
  });

  it('leaves a charge without a fee day empty', () => {
    const component = createComponent();

    expect(component.formatFeeOnMonthDay(undefined)).toBeUndefined();
    expect(component.formatFeeOnMonthDay(null)).toBeNull();
    expect(component.formatFeeOnMonthDay('')).toBe('');
  });
});
