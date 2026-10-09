/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import { RecurringDepositsService } from '../../recurring-deposits.service';
import { RejectRecurringDepositsAccountComponent } from './reject-recurring-deposits-account.component';

describe('RejectRecurringDepositsAccountComponent', () => {
  let component: RejectRecurringDepositsAccountComponent;
  let fixture: ComponentFixture<RejectRecurringDepositsAccountComponent>;
  let recurringDepositsService: jest.Mocked<RecurringDepositsService>;
  let router: jest.Mocked<Router>;

  const accountId = '456';
  const rejectedOnDate = new Date(2026, 8, 1);

  beforeEach(async () => {
    recurringDepositsService = {
      executeRecurringDepositsAccountCommand: jest.fn(() => of({}))
    } as any;
    router = {
      navigate: jest.fn(() => Promise.resolve(true))
    } as any;

    await TestBed.configureTestingModule({
      imports: [
        RejectRecurringDepositsAccountComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { parent: { snapshot: { params: { recurringDepositAccountId: accountId } } } }
        },
        { provide: Router, useValue: router },
        { provide: RecurringDepositsService, useValue: recurringDepositsService },
        {
          provide: SettingsService,
          useValue: { businessDate: rejectedOnDate, language: { code: 'en' }, dateFormat: 'dd MMMM yyyy' }
        },
        { provide: Dates, useValue: { formatDate: jest.fn(() => '01 September 2026') } },
        provideNativeDateAdapter(),
        provideNoopAnimations()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RejectRecurringDepositsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const confirmButton = (): HTMLButtonElement =>
    fixture.nativeElement.querySelector('mat-card-actions button:last-child');

  it('should disable Confirm when Rejected On Date is empty', () => {
    expect(confirmButton().disabled).toBe(true);
  });

  it('should enable Confirm when the form is valid', () => {
    component.rejectRecurringDepositsAccountForm.patchValue({ rejectedOnDate });
    fixture.detectChanges();

    expect(confirmButton().disabled).toBe(false);
  });

  it('should not submit an invalid form', () => {
    component.submit();

    expect(recurringDepositsService.executeRecurringDepositsAccountCommand).not.toHaveBeenCalled();
  });

  it('should submit a valid form and navigate to the account', () => {
    component.rejectRecurringDepositsAccountForm.patchValue({ rejectedOnDate, note: 'Rejected' });

    component.submit();

    expect(recurringDepositsService.executeRecurringDepositsAccountCommand).toHaveBeenCalledWith(accountId, 'reject', {
      rejectedOnDate: '01 September 2026',
      note: 'Rejected',
      dateFormat: 'dd MMMM yyyy',
      locale: 'en'
    });
    expect(router.navigate).toHaveBeenCalledWith(['../../'], { relativeTo: TestBed.inject(ActivatedRoute) });
  });
});
