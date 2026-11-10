/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { ClientsService } from 'app/clients/clients.service';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import { ClientPayChargesComponent } from './client-pay-charges.component';

describe('ClientPayChargesComponent', () => {
  /** A business date behind the computer clock, as on a tenant whose close of business has not run yet. */
  const businessDate = new Date(2026, 9, 20);

  it('starts the payment on the business date, the latest date Fineract accepts', () => {
    TestBed.configureTestingModule({
      providers: [
        FormBuilder,
        { provide: ClientsService, useValue: {} },
        { provide: ActivatedRoute, useValue: { data: of({ transactionData: { clientId: 2, id: 1, amount: 5 } }) } },
        { provide: Router, useValue: {} },
        { provide: Dates, useValue: {} },
        { provide: SettingsService, useValue: { businessDate } }
      ]
    });
    const component = TestBed.runInInjectionContext(() => new ClientPayChargesComponent());

    component.ngOnInit();

    expect(component.transactionForm.value.transactionDate).toBe(businessDate);
    expect(component.maxDate).toBe(businessDate);
  });
});
