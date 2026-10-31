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
import { FixedDepositsService } from 'app/deposits/fixed-deposits/fixed-deposits.service';
import { SavingsService } from 'app/savings/savings.service';
import { SettingsService } from 'app/settings/settings.service';
import { ActivateFixedDepositsAccountComponent } from './activate-fixed-deposits-account.component';

describe('ActivateFixedDepositsAccountComponent', () => {
  it('activates through the fixed deposit endpoint so a linked savings account is debited', () => {
    const fixedDepositsService = {
      executeFixedDepositsAccountCommand: jest.fn().mockReturnValue(of({ resourceId: 7 }))
    };
    const savingsService = { executeSavingsAccountCommand: jest.fn().mockReturnValue(of({})) };
    TestBed.configureTestingModule({
      providers: [
        UntypedFormBuilder,
        { provide: FixedDepositsService, useValue: fixedDepositsService },
        { provide: SavingsService, useValue: savingsService },
        {
          provide: SettingsService,
          useValue: { businessDate: new Date(2026, 9, 1), dateFormat: 'dd MMMM yyyy', language: { code: 'en' } }
        },
        { provide: Dates, useValue: { formatDate: () => '01 October 2026' } },
        { provide: ActivatedRoute, useValue: { parent: { snapshot: { params: { fixedDepositAccountId: '7' } } } } },
        { provide: Router, useValue: { navigate: jest.fn() } }
      ]
    });
    const component = TestBed.runInInjectionContext(() => new ActivateFixedDepositsAccountComponent());
    component.ngOnInit();
    component.activateFixedDepositsAccountForm.patchValue({ activatedOnDate: new Date(2026, 9, 1) });

    component.submit();

    expect(fixedDepositsService.executeFixedDepositsAccountCommand).toHaveBeenCalledWith('7', 'activate', {
      activatedOnDate: '01 October 2026',
      dateFormat: 'dd MMMM yyyy',
      locale: 'en'
    });
    expect(savingsService.executeSavingsAccountCommand).not.toHaveBeenCalled();
  });
});
