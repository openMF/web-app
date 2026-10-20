/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import { RecurringDepositsAccountSettingsStepComponent } from './recurring-deposits-account-settings-step.component';

describe('RecurringDepositsAccountSettingsStepComponent', () => {
  /** Product limits shared by the product template and the account template. */
  const productTerms = {
    minDepositTerm: 1,
    minDepositTermType: { id: 2, value: 'Months' },
    maxDepositTerm: 60,
    maxDepositTermType: { id: 2, value: 'Months' },
    currency: { code: 'USD', displaySymbol: '$' }
  };

  /** A pending 2-year recurring deposit as GET /recurringdepositaccounts/{id}?template=true returns it. */
  const accountTemplate = {
    ...productTerms,
    // A frequency different from the product minimum, so a mix-up between the two can't pass.
    depositPeriod: 2,
    depositPeriodFrequency: { id: 3, value: 'Years' },
    recurringFrequency: 1,
    recurringFrequencyType: { id: 2, value: 'Months' }
  };

  function createComponent(isNew: boolean): RecurringDepositsAccountSettingsStepComponent {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        UntypedFormBuilder,
        { provide: SettingsService, useValue: { businessDate: new Date(2026, 9, 1) } },
        { provide: Dates, useValue: { parseDate: (value: number[]) => new Date(value[0], value[1] - 1, value[2]) } }
      ]
    });
    const component = TestBed.runInInjectionContext(() => new RecurringDepositsAccountSettingsStepComponent());
    component.isNew = isNew;
    if (isNew) {
      component.recurringDepositsAccountProductTemplate = productTerms;
    } else {
      component.recurringDepositsAccountTemplate = accountTemplate;
    }
    component.ngOnChanges();
    return component;
  }

  it('keeps the account deposit period when modifying an existing application', () => {
    const form = createComponent(false).recurringDepositAccountSettingsForm;

    expect(form.get('depositPeriod')!.value).toBe(2);
    expect(form.get('depositPeriodFrequencyId')!.value).toBe(3);
  });

  it('starts a new application at the product minimum term', () => {
    const form = createComponent(true).recurringDepositAccountSettingsForm;

    expect(form.get('depositPeriod')!.value).toBe(1);
    expect(form.get('depositPeriodFrequencyId')!.value).toBe(2);
  });
});
