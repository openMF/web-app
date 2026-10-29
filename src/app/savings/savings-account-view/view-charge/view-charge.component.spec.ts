/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { Dates } from 'app/core/utils/dates';
import { SavingsService } from 'app/savings/savings.service';
import { SettingsService } from 'app/settings/settings.service';
import { ViewChargeComponent } from './view-charge.component';

describe('Savings ViewChargeComponent', () => {
  /** A specified due date fee as GET /savingsaccounts/{id}/charges/{chargeId} returns it. */
  const charge = { id: 1, accountId: 12, amount: 15, amountOutstanding: 15 };

  function createComponent(dialogResult: any) {
    const savingsService = { executeSavingsAccountChargesCommand: jest.fn().mockReturnValue(of({})) };
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ savingsAccountCharge: charge, savingsAccountData: { status: { value: 'Active' } } }) }
        },
        {
          provide: Router,
          useValue: {
            navigateByUrl: jest.fn().mockResolvedValue(true),
            navigate: jest.fn(),
            url: '/clients/8/savings-accounts/12/charges/1'
          }
        },
        { provide: MatDialog, useValue: { open: jest.fn().mockReturnValue({ afterClosed: () => of(dialogResult) }) } },
        { provide: SavingsService, useValue: savingsService },
        { provide: SettingsService, useValue: { dateFormat: 'dd MMMM yyyy', language: { code: 'en' } } },
        { provide: Dates, useValue: { formatDate: () => '20 October 2026' } }
      ]
    });
    const component = TestBed.runInInjectionContext(() => new ViewChargeComponent());
    return { component, savingsService };
  }

  it('pays the charge with the paycharge command Fineract accepts', () => {
    const { component, savingsService } = createComponent({
      data: { value: { amount: 15, dueDate: new Date(2026, 9, 20) } }
    });

    component.payCharge();

    expect(savingsService.executeSavingsAccountChargesCommand).toHaveBeenCalledWith(
      12,
      'paycharge',
      { amount: 15, dueDate: '20 October 2026', dateFormat: 'dd MMMM yyyy', locale: 'en' },
      1
    );
  });

  it('sends nothing when the pay dialog is cancelled', () => {
    const { component, savingsService } = createComponent(undefined);

    component.payCharge();

    expect(savingsService.executeSavingsAccountChargesCommand).not.toHaveBeenCalled();
  });
});
