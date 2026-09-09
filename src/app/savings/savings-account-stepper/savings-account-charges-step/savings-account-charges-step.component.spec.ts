/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

import { SavingsAccountChargesStepComponent } from './savings-account-charges-step.component';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';

describe('SavingsAccountChargesStepComponent', () => {
  let component: SavingsAccountChargesStepComponent;
  let dialog: { open: jest.Mock };

  const maxFutureDate = new Date(2100, 0, 1);
  const businessDate = new Date(2026, 0, 15);

  const openedDatepicker = () => (dialog.open.mock.calls[0][1] as any).data.formfields[0];

  beforeEach(async () => {
    dialog = { open: jest.fn(() => ({ afterClosed: () => of(undefined) })) };

    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: MatDialog, useValue: dialog },
        { provide: Dates, useValue: { formatDate: jest.fn(() => '20 March 2100') } },
        { provide: SettingsService, useValue: { maxFutureDate, businessDate } }
      ]
    }).compileComponents();

    component = TestBed.runInInjectionContext(() => new SavingsAccountChargesStepComponent());
  });

  it('allows future due dates when editing a Specified due date charge', () => {
    component.editChargeDate({ chargeTimeType: { value: 'Specified due date' }, dueDate: '15 January 2026' });

    expect(openedDatepicker().maxDate).toBe(maxFutureDate);
  });

  it('allows future dates when editing an Annual Fee charge', () => {
    component.editChargeDate({ chargeTimeType: { value: 'Annual Fee' }, feeOnMonthDay: '15 January' });

    expect(openedDatepicker().maxDate).toBe(maxFutureDate);
  });
});
