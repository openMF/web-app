/**
 * Copyright since 2026 Mifos Initiative
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
import { SettingsService } from 'app/settings/settings.service';
import { AccountTransfersService } from '../account-transfers.service';
import { EditStandingInstructionsComponent } from './edit-standing-instructions.component';

describe('EditStandingInstructionsComponent', () => {
  let accountTransfersService: { updateStandingInstructionsData: jest.Mock };
  let formatDate: jest.Mock;

  /** What GET /standinginstructions/{id}?associations=template returns, trimmed to the fields the form reads. */
  const standingInstruction = (overrides: any = {}) => ({
    id: 1,
    name: 'Monthly loan repayment',
    fromClient: { id: 2, displayName: 'Client Two' },
    toClient: { id: 2, displayName: 'Client Two' },
    transferType: { value: 'Loan Repayment' },
    priority: { id: 1 },
    status: { id: 1 },
    fromAccountType: { value: 'Savings Account' },
    fromAccount: { productName: 'Savings' },
    toOffice: { name: 'Head Office' },
    toAccountType: { value: 'Loan Account' },
    toAccount: { productName: 'Loan' },
    instructionType: { id: 1 },
    amount: 50,
    validFrom: '2026-07-01',
    validTill: '2026-12-31',
    recurrenceType: { id: 1 },
    recurrenceInterval: 1,
    recurrenceFrequency: { id: 2 },
    recurrenceOnDay: 5,
    recurrenceOnMonth: 7,
    ...overrides
  });

  /**
   * Builds the component for the given standing instruction and runs ngOnInit, without rendering the template.
   * @param data The resolved standing instruction.
   * @returns The initialised component.
   */
  function createComponent(data: any): EditStandingInstructionsComponent {
    accountTransfersService = { updateStandingInstructionsData: jest.fn(() => of({})) };
    formatDate = jest.fn((date: Date, format: string) =>
      date instanceof Date ? `${date.getDate()}/${date.getMonth() + 1} ${format}` : null
    );
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        FormBuilder,
        { provide: ActivatedRoute, useValue: { data: of({ standingInstructionsDataAndTemplate: data }) } },
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: AccountTransfersService, useValue: accountTransfersService },
        { provide: SettingsService, useValue: { dateFormat: 'dd MMMM yyyy', language: { code: 'en' } } },
        { provide: Dates, useValue: { formatDate } }
      ]
    });
    const component = TestBed.runInInjectionContext(() => new EditStandingInstructionsComponent());
    component.ngOnInit();
    return component;
  }

  it('should show the saved day of the month', () => {
    const component = createComponent(standingInstruction());

    const monthDay: Date = component.editStandingInstructionsForm.value.recurrenceOnMonthDay;
    expect(monthDay.getDate()).toBe(5);
    expect(monthDay.getMonth()).toBe(6);
  });

  it('should leave the day of the month empty when none is saved', () => {
    const component = createComponent(standingInstruction({ recurrenceOnDay: 0, recurrenceOnMonth: 0 }));

    expect(component.editStandingInstructionsForm.value.recurrenceOnMonthDay).toBeNull();
  });

  it('should not send the day of the month when it is not changed', () => {
    const component = createComponent(standingInstruction());

    component.submit();

    const data = accountTransfersService.updateStandingInstructionsData.mock.calls[0][1];
    expect(data).not.toHaveProperty('recurrenceOnMonthDay');
    expect(data.monthDayFormat).toBe('dd MMMM');
  });

  it('should send the day of the month when the user changes it', () => {
    const component = createComponent(standingInstruction());
    const control = component.editStandingInstructionsForm.get('recurrenceOnMonthDay');
    control.setValue(new Date(2026, 6, 20));
    control.markAsDirty();

    component.submit();

    const data = accountTransfersService.updateStandingInstructionsData.mock.calls[0][1];
    expect(data.recurrenceOnMonthDay).toBe('20/7 dd MMMM');
  });
});
