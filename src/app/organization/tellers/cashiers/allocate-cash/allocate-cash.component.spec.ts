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
import { Dates } from 'app/core/utils/dates';
import { OrganizationService } from 'app/organization/organization.service';
import { SettingsService } from 'app/settings/settings.service';
import { AllocateCashComponent } from './allocate-cash.component';

describe('AllocateCashComponent', () => {
  /** A business date behind the computer clock, as on a tenant whose close of business has not run yet. */
  const businessDate = new Date(2026, 9, 15);

  it('starts on the business date and does not accept a later date', () => {
    TestBed.configureTestingModule({
      providers: [
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({
              cashierTemplate: {
                officeName: 'Head Office',
                tellerName: 'Teller 1',
                cashierName: 'Cashier 1',
                startDate: [
                  2026,
                  1,
                  1
                ],
                endDate: [
                  2027,
                  12,
                  31
                ],
                currencyOptions: []
              }
            })
          }
        },
        { provide: Router, useValue: {} },
        { provide: OrganizationService, useValue: {} },
        { provide: SettingsService, useValue: { businessDate, maxFutureDate: new Date(2100, 0, 1) } },
        { provide: Dates, useValue: { formatDate: (): string => '' } }
      ]
    });
    const component = TestBed.runInInjectionContext(() => new AllocateCashComponent());

    component.ngOnInit();

    expect(component.allocateCashForm.value.txnDate).toBe(businessDate);
    expect(component.maxDate).toBe(businessDate);
  });
});
