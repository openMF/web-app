/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { describe, expect, it, jest } from '@jest/globals';

import { Dates } from 'app/core/utils/dates';
import { SavingsService } from 'app/savings/savings.service';
import { SettingsService } from 'app/settings/settings.service';
import { PostInterestAsOnSavingsAccountComponent } from './post-interest-as-on-savings-account.component';

describe('PostInterestAsOnSavingsAccountComponent', () => {
  it('sends the post-interest-as-on flag under the name Fineract accepts', async () => {
    const executeSavingsAccountTransactionsCommand = jest.fn(() => of({}));

    await TestBed.configureTestingModule({
      imports: [PostInterestAsOnSavingsAccountComponent],
      providers: [
        { provide: SavingsService, useValue: { executeSavingsAccountTransactionsCommand } },
        { provide: Dates, useValue: { formatDate: () => '12 October 2026' } },
        {
          provide: SettingsService,
          useValue: { businessDate: new Date(2026, 9, 12), language: { code: 'en' }, dateFormat: 'dd MMMM yyyy' }
        },
        { provide: ActivatedRoute, useValue: { snapshot: { params: { savingAccountId: '7' } } } },
        { provide: Router, useValue: { navigate: jest.fn() } }
      ]
    })
      .overrideComponent(PostInterestAsOnSavingsAccountComponent, { set: { template: '', imports: [] } })
      .compileComponents();

    const component = TestBed.createComponent(PostInterestAsOnSavingsAccountComponent).componentInstance;
    component.ngOnInit();
    component.postInterestSavingsAccountForm.patchValue({ transactionDate: new Date(2026, 9, 12) });

    component.submit();

    expect(executeSavingsAccountTransactionsCommand).toHaveBeenCalledWith('7', 'postInterestAsOn', {
      transactionDate: '12 October 2026',
      isPostInterestAsOn: true,
      dateFormat: 'dd MMMM yyyy',
      locale: 'en'
    });
  });
});
