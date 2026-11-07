/**
 * Copyright since 2025 Mifos Initiative
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
import { RecurringDepositsService } from 'app/deposits/recurring-deposits/recurring-deposits.service';
import { SettingsService } from 'app/settings/settings.service';
import { CloseRecurringDepositsAccountComponent } from './close-recurring-deposits-account.component';

describe('CloseRecurringDepositsAccountComponent', () => {
  /** A business date behind the computer clock, as on a tenant whose close of business has not run yet. */
  const businessDate = new Date(2026, 9, 20);

  it('starts the closure on the business date, the latest date the form accepts', () => {
    TestBed.configureTestingModule({
      providers: [
        UntypedFormBuilder,
        { provide: RecurringDepositsService, useValue: {} },
        { provide: SettingsService, useValue: { businessDate } },
        { provide: Dates, useValue: {} },
        { provide: Router, useValue: {} },
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({
              recurringDepositsAccountActionData: {
                savingsAccounts: [],
                maturityAmount: 1200,
                onAccountClosureOptions: [],
                paymentTypeOptions: []
              }
            }),
            parent: { snapshot: { params: { recurringDepositAccountId: '7' } } }
          }
        }
      ]
    });
    const component = TestBed.runInInjectionContext(() => new CloseRecurringDepositsAccountComponent());

    component.ngOnInit();

    expect(component.maxDate).toBe(businessDate);
    expect(component.closeRecurringDepositForm.value.closedOnDate).toBe(businessDate);
    expect(component.closeRecurringDepositForm.controls.closedOnDate.valid).toBe(true);
  });
});
