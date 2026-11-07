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
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import { RecurringDepositsService } from '../../recurring-deposits.service';
import { DepositRecurringDepositsAccountComponent } from './deposit-recurring-deposits-account.component';

describe('DepositRecurringDepositsAccountComponent', () => {
  const businessDate = new Date(2026, 9, 18);
  let recurringDepositsService: { executeRecurringDepositsAccountCommand: jest.Mock };

  /**
   * Builds the component for an action with the given transaction template, without rendering the template.
   * @param action Route action name (Deposit or Withdrawal).
   * @param template What GET /recurringdepositaccounts/{id}/transactions/template returns.
   * @returns The initialised component.
   */
  function createComponent(action: string, template: any): DepositRecurringDepositsAccountComponent {
    recurringDepositsService = { executeRecurringDepositsAccountCommand: jest.fn(() => of({})) };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        UntypedFormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({ recurringDepositsAccountActionData: template }),
            snapshot: { params: { name: action } },
            parent: { snapshot: { params: { recurringDepositAccountId: '5' } } }
          }
        },
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: RecurringDepositsService, useValue: recurringDepositsService },
        {
          provide: SettingsService,
          useValue: { businessDate, dateFormat: 'dd MMMM yyyy', language: { code: 'en' } }
        },
        { provide: Dates, useValue: { formatDate: () => '18 October 2026' } }
      ]
    });
    const component = TestBed.runInInjectionContext(() => new DepositRecurringDepositsAccountComponent());
    component.ngOnInit();
    return component;
  }

  it('should start a deposit with the amount due and the business date', () => {
    const component = createComponent('Deposit', { amount: 100, paymentTypeOptions: [] });

    expect(component.depositRecurringDepositForm.value.transactionAmount).toBe(100);
    expect(component.depositRecurringDepositForm.value.transactionDate).toBe(businessDate);
  });

  it('should add outstanding charges to the deposit amount', () => {
    const component = createComponent('Deposit', { amount: 100, outstandingChargeAmount: 15, paymentTypeOptions: [] });

    expect(component.depositRecurringDepositForm.value.transactionAmount).toBe(115);
  });

  it('should not prefill a withdrawal with the deposit amount', () => {
    const component = createComponent('Withdrawal', { amount: 100, paymentTypeOptions: [] });

    expect(component.depositRecurringDepositForm.value.transactionAmount).toBe(0);
  });

  it('should submit the prefilled deposit amount', () => {
    const component = createComponent('Deposit', { amount: 100, paymentTypeOptions: [] });
    component.depositRecurringDepositForm.patchValue({ paymentTypeId: 1 });

    component.submit();

    expect(recurringDepositsService.executeRecurringDepositsAccountCommand).toHaveBeenCalledWith(
      '5',
      'deposit',
      expect.objectContaining({ transactionAmount: 100, transactionDate: '18 October 2026', paymentTypeId: 1 })
    );
  });
});
