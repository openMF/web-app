/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DatePipe, registerLocaleData } from '@angular/common';
import localeEN from '@angular/common/locales/en';
import { ChangeDetectorRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';

import { SavingsService } from '../savings.service';
import { CreateSavingsAccountComponent } from './create-savings-account.component';

registerLocaleData(localeEN);

describe('CreateSavingsAccountComponent charges', () => {
  let savingsService: { createSavingsAccount: jest.Mock };

  function createComponent(charges: any[], dateFormat = 'dd MMMM yyyy'): CreateSavingsAccountComponent {
    TestBed.resetTestingModule();
    savingsService = {
      createSavingsAccount: jest.fn(() => of({ resourceId: 77 }))
    };

    TestBed.configureTestingModule({
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ savingsAccountTemplate: { clientId: 11 } }) }
        },
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: SavingsService, useValue: savingsService },
        { provide: ChangeDetectorRef, useValue: { markForCheck: jest.fn() } },
        {
          provide: SettingsService,
          useValue: {
            language: { code: 'en' },
            dateFormat
          }
        },
        Dates,
        DatePipe
      ]
    });

    const component = TestBed.runInInjectionContext(() => new CreateSavingsAccountComponent());
    component.savingsAccountDetailsStep = {
      savingsAccountDetails: {
        productId: 22,
        submittedOnDate: new Date(2026, 0, 1)
      }
    } as any;
    component.savingsAccountTermsStep = {
      savingsAccountTerms: {}
    } as any;
    component.savingsAccountChargesStep = {
      savingsAccountCharges: {
        charges
      }
    } as any;

    return component;
  }

  function submittedCharge(index = 0): any {
    return savingsService.createSavingsAccount.mock.calls[0][0].charges[index];
  }

  it('sends the [month, day] of a charge template as a day and month', () => {
    const feeOnMonthDay = [
      7,
      22
    ];
    const component = createComponent([{ id: 8, amount: 5, feeOnMonthDay, feeInterval: 1 }]);

    component.submit();

    expect(submittedCharge().feeOnMonthDay).toBe('22 July');
  });

  it('drops the year from a manually selected fee date', () => {
    const component = createComponent([{ id: 9, amount: 5, feeOnMonthDay: '15 March 2027', feeInterval: 1 }]);

    component.submit();

    expect(submittedCharge().feeOnMonthDay).toBe('15 March');
  });

  it('leaves a charge without a fee day unchanged', () => {
    const component = createComponent([
      { id: 11, amount: 5, feeInterval: 1 },
      { id: 12, amount: 5, feeOnMonthDay: '', feeInterval: 1 },
      { id: 13, amount: 5, feeOnMonthDay: null, feeInterval: 1 }
    ]);

    component.submit();

    expect(submittedCharge(0).feeOnMonthDay).toBeUndefined();
    expect(submittedCharge(1).feeOnMonthDay).toBe('');
    expect(submittedCharge(2).feeOnMonthDay).toBeNull();
  });
});
