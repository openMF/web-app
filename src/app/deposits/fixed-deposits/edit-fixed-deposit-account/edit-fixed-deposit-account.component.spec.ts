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
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';

import { FixedDepositsService } from '../fixed-deposits.service';
import { EditFixedDepositAccountComponent } from './edit-fixed-deposit-account.component';

registerLocaleData(localeEN);

describe('EditFixedDepositAccountComponent', () => {
  let fixedDepositsService: { updateFixedDepositAccount: jest.Mock };
  let router: { navigate: jest.Mock };

  function createComponent(charges: any[], dateFormat = 'dd MMMM yyyy'): EditFixedDepositAccountComponent {
    TestBed.resetTestingModule();
    fixedDepositsService = {
      updateFixedDepositAccount: jest.fn(() => of({}))
    };
    router = { navigate: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        Dates,
        DatePipe,
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({
              fixedDepositsAccountAndTemplate: {
                id: 42,
                clientId: 11,
                currency: { code: 'USD' }
              }
            })
          }
        },
        { provide: Router, useValue: router },
        { provide: FixedDepositsService, useValue: fixedDepositsService },
        {
          provide: SettingsService,
          useValue: {
            language: { code: 'en' },
            dateFormat
          }
        }
      ]
    });

    const component = TestBed.runInInjectionContext(() => new EditFixedDepositAccountComponent());
    component.fixedDepositsAccountProductTemplate = { accountChart: { chartSlabs: [] } };
    component.fixedDepositsAccountDetailsStep = {
      fixedDepositAccountDetails: {
        submittedOnDate: new Date(2026, 0, 1)
      }
    } as any;
    component.fixedDepositAccountTermsStep = { fixedDepositAccountTerms: {} } as any;
    component.fixedDepositAccountSettingsStep = { fixedDepositAccountSettings: {} } as any;
    component.fixedDepositAccountChargesStep = {
      fixedDepositAccountCharges: { charges },
      pristine: true
    } as any;

    return component;
  }

  function submittedAccount(): any {
    return fixedDepositsService.updateFixedDepositAccount.mock.calls[0][1];
  }

  function submittedCharge(index = 0): any {
    return submittedAccount().charges[index];
  }

  it('sends the ISO fee day of a saved account charge as a day and month', () => {
    const component = createComponent([
      { id: 7, amount: 10, feeOnMonthDay: '--03-15', feeInterval: 1 }
    ]);

    component.submit();

    expect(submittedCharge().feeOnMonthDay).toBe('15 March');
    expect(submittedAccount().monthDayFormat).toBe('dd MMMM');
    expect(submittedAccount().dateFormat).toBe('dd MMMM yyyy');
  });

  it('keeps 29 February of an ISO month-day year independent', () => {
    const component = createComponent([
      { id: 7, amount: 10, feeOnMonthDay: '--02-29', feeInterval: 1 }
    ]);

    component.submit();

    expect(submittedCharge().feeOnMonthDay).toBe('29 February');
  });

  it('sends the [month, day] of a charge template as a day and month', () => {
    const component = createComponent([
      {
        id: 8,
        amount: 5,
        feeOnMonthDay: [
          7,
          22
        ],
        feeInterval: 1
      }
    ]);

    component.submit();

    expect(submittedCharge().feeOnMonthDay).toBe('22 July');
  });

  it('drops the year of a fee date picked in the charges step', () => {
    const component = createComponent([
      { id: 9, amount: 5, feeOnMonthDay: '15 March 2027', feeInterval: 1 }
    ]);

    component.submit();

    expect(submittedCharge().feeOnMonthDay).toBe('15 March');
  });

  it('reads a picked fee date with the configured date format', () => {
    const component = createComponent(
      [
        { id: 10, amount: 5, feeOnMonthDay: '05/11/2027', feeInterval: 1 }
      ],
      'dd/MM/yyyy'
    );

    component.submit();

    expect(submittedCharge().feeOnMonthDay).toBe('05 November');
  });

  it('leaves a charge without a fee day unchanged', () => {
    const component = createComponent([
      { id: 11, amount: 5, feeInterval: 1 },
      { id: 12, amount: 5, feeOnMonthDay: '', feeInterval: 1 }
    ]);

    component.submit();

    expect(submittedCharge(0).feeOnMonthDay).toBeUndefined();
    expect(submittedCharge(1).feeOnMonthDay).toBe('');
  });

  it('submits the updated account and navigates back', () => {
    const component = createComponent([
      { id: 7, amount: 10, feeOnMonthDay: '--03-15', feeInterval: 1 }
    ]);

    component.submit();

    expect(fixedDepositsService.updateFixedDepositAccount).toHaveBeenCalledWith(
      42,
      expect.objectContaining({ clientId: 11 })
    );
    expect(router.navigate).toHaveBeenCalledWith(['../'], expect.objectContaining({ relativeTo: expect.anything() }));
  });
});
