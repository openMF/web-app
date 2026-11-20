/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DatePipe } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import { SavingsService } from '../savings.service';
import { EditSavingsAccountComponent } from './edit-savings-account.component';

describe('EditSavingsAccountComponent', () => {
  /** Sends the modified application with the given charges and returns the request body. */
  function submittedCharges(charges: any[]): any[] {
    const savingsService = { updateSavingsAccount: jest.fn().mockReturnValue(of({})) };
    TestBed.configureTestingModule({
      providers: [
        { provide: ActivatedRoute, useValue: { data: of({ savingsAccountAndTemplate: { id: 39, clientId: 8 } }) } },
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: SavingsService, useValue: savingsService },
        { provide: SettingsService, useValue: { language: { code: 'en' }, dateFormat: 'dd MMMM yyyy' } },
        DatePipe,
        Dates
      ]
    });
    jest.spyOn(TestBed.inject(Dates), 'language', 'get').mockReturnValue({ name: 'English', code: 'en' } as any);
    const component = TestBed.runInInjectionContext(() => new EditSavingsAccountComponent());
    component.savingsAccountDetailsStep = {
      savingsAccountDetails: { productId: 1, submittedOnDate: new Date(2026, 9, 20) }
    } as any;
    component.savingsAccountTermsStep = { savingsAccountTerms: {} } as any;
    component.savingsAccountChargesStep = { savingsAccountCharges: { charges } } as any;

    component.submit();

    const [
      id,
      body
    ] = savingsService.updateSavingsAccount.mock.calls[0];
    expect(id).toBe(39);
    expect(body.monthDayFormat).toBe('dd MMMM');
    return body.charges;
  }

  it('sends the fee day of an annual fee loaded from the account as day and month', () => {
    // GET /savingsaccounts/{id}?template=true returns the fee day as an ISO month-day
    const [charge] = submittedCharges([
      { id: 4, amount: 10, feeOnMonthDay: '--03-15', dueDate: null }
    ]);

    expect(charge.feeOnMonthDay).toBe('15 March');
  });

  it('keeps a fee day picked again in the charges step', () => {
    const [charge] = submittedCharges([
      { id: 4, amount: 10, feeOnMonthDay: '20 April', dueDate: null }
    ]);

    expect(charge.feeOnMonthDay).toBe('20 April');
  });

  it('leaves charges without a fee day unchanged', () => {
    const [charge] = submittedCharges([
      { id: 9, amount: 15, feeOnMonthDay: null, dueDate: new Date(2026, 9, 25) }
    ]);

    expect(charge.feeOnMonthDay).toBeNull();
    expect(charge.dueDate).toBe('25 October 2026');
  });
});
