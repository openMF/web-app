/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { Dates } from 'app/core/utils/dates';
import { SavingsService } from 'app/savings/savings.service';
import { SettingsService } from 'app/settings/settings.service';
import { SavingsAccountDetailsStepComponent } from './savings-account-details-step.component';

describe('SavingsAccountDetailsStepComponent', () => {
  /** A business date behind the computer clock, as on a tenant whose close of business has not run yet. */
  const businessDate = new Date(2026, 9, 15);

  it('starts a new application on the business date, the latest date the form accepts', () => {
    TestBed.configureTestingModule({
      providers: [
        FormBuilder,
        { provide: SavingsService, useValue: {} },
        { provide: SettingsService, useValue: { businessDate } },
        { provide: Dates, useValue: {} }
      ]
    });
    const component = TestBed.runInInjectionContext(() => new SavingsAccountDetailsStepComponent());
    component.savingsAccountTemplate = { clientId: 2, productOptions: [] };
    jest.spyOn(component, 'buildDependencies').mockImplementation(() => undefined);

    component.ngOnInit();

    expect(component.savingsAccountDetailsForm.value.submittedOnDate).toBe(businessDate);
    expect(component.maxDate).toBe(businessDate);
    expect(component.savingsAccountDetailsForm.controls.submittedOnDate.valid).toBe(true);
  });
});
