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
import { of, Subject } from 'rxjs';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import { RecurringDepositsService } from '../../recurring-deposits.service';
import { PrematureCloseRecurringDepositAccountComponent } from './premature-close-recurring-deposit-account.component';

describe('PrematureCloseRecurringDepositAccountComponent', () => {
  let component: PrematureCloseRecurringDepositAccountComponent;
  let fixture: ComponentFixture<PrematureCloseRecurringDepositAccountComponent>;
  let recurringDepositsService: jest.Mocked<RecurringDepositsService>;
  let router: jest.Mocked<Router>;

  const accountId = '789';
  const closedOnDate = new Date(2026, 8, 1);
  /** What Fineract returns for calculatePrematureAmount on a recurring deposit. */
  const prematureCloseTemplate = {
    maturityAmount: 101.79,
    onAccountClosureOptions: [
      { id: 100, value: 'Withdraw Deposit' },
      { id: 200, value: 'Transfer to Savings' }
    ],
    savingsAccounts: [{ id: 6, accountNo: '000000006' }]
  };

  beforeEach(async () => {
    recurringDepositsService = {
      executeRecurringDepositsAccountCommand: jest.fn((_id: string, command: string) =>
        of(command === 'calculatePrematureAmount' ? prematureCloseTemplate : {})
      )
    } as any;
    router = {
      navigate: jest.fn(() => Promise.resolve(true))
    } as any;

    await TestBed.configureTestingModule({
      imports: [
        PrematureCloseRecurringDepositAccountComponent,
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
          useValue: { businessDate: closedOnDate, language: { code: 'en' }, dateFormat: 'dd MMMM yyyy' }
        },
        { provide: Dates, useValue: { formatDate: jest.fn(() => '01 September 2026') } },
        provideNativeDateAdapter(),
        provideNoopAnimations()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PrematureCloseRecurringDepositAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const confirmButton = (): HTMLButtonElement =>
    fixture.nativeElement.querySelector('mat-card-actions button:last-child');

  it('should disable Confirm when Closed On Date is empty', () => {
    expect(confirmButton().disabled).toBe(true);
  });

  it('should load the maturity amount and closure options for the chosen date', () => {
    component.prematureCloseRecurringDepositsAccountForm.patchValue({ closedOnDate });
    fixture.detectChanges();

    expect(recurringDepositsService.executeRecurringDepositsAccountCommand).toHaveBeenCalledWith(
      accountId,
      'calculatePrematureAmount',
      { closedOnDate: '01 September 2026', dateFormat: 'dd MMMM yyyy', locale: 'en' }
    );
    expect(component.prematureCloseRecurringDepositsAccountForm.get('maturityAmount').value).toBe(101.79);
    expect(component.onAccountClosureOptions).toEqual(prematureCloseTemplate.onAccountClosureOptions);
  });

  it('should keep Confirm disabled until a closure action is chosen', () => {
    component.prematureCloseRecurringDepositsAccountForm.patchValue({ closedOnDate });
    fixture.detectChanges();
    expect(confirmButton().disabled).toBe(true);

    component.prematureCloseRecurringDepositsAccountForm.patchValue({ onAccountClosureId: 100 });
    fixture.detectChanges();
    expect(confirmButton().disabled).toBe(false);
  });

  it('should keep Confirm disabled while the calculation is pending', () => {
    const pending = new Subject<any>();
    recurringDepositsService.executeRecurringDepositsAccountCommand.mockReturnValueOnce(pending as any);

    component.prematureCloseRecurringDepositsAccountForm.patchValue({ closedOnDate });
    fixture.detectChanges();

    expect(component.prematureCloseRecurringDepositsAccountForm.valid).toBe(false);
    expect(confirmButton().disabled).toBe(true);
  });

  it('should only apply the calculation of the latest date and clear the previous choice', () => {
    const first = new Subject<any>();
    const second = new Subject<any>();
    recurringDepositsService.executeRecurringDepositsAccountCommand
      .mockReturnValueOnce(first as any)
      .mockReturnValueOnce(second as any);
    const form = component.prematureCloseRecurringDepositsAccountForm;

    form.patchValue({ closedOnDate });
    form.patchValue({ onAccountClosureId: 100 });
    form.patchValue({ closedOnDate: new Date(2026, 8, 2) });
    expect(form.get('onAccountClosureId').value).toBe('');

    second.next({ ...prematureCloseTemplate, maturityAmount: 102.5 });
    first.next(prematureCloseTemplate);

    expect(form.get('maturityAmount').value).toBe(102.5);
  });

  it('should ignore a pending calculation when the date is cleared', () => {
    const pending = new Subject<any>();
    recurringDepositsService.executeRecurringDepositsAccountCommand.mockReturnValueOnce(pending as any);
    const form = component.prematureCloseRecurringDepositsAccountForm;

    form.patchValue({ closedOnDate });
    form.patchValue({ closedOnDate: null });
    pending.next(prematureCloseTemplate);

    expect(form.get('maturityAmount').value).toBe('');
    expect(component.onAccountClosureOptions).toEqual([]);
  });

  it('should not submit an invalid form', () => {
    component.submit();

    expect(recurringDepositsService.executeRecurringDepositsAccountCommand).not.toHaveBeenCalled();
  });

  it('should submit a withdrawal closure and navigate to the account', () => {
    component.prematureCloseRecurringDepositsAccountForm.patchValue({ closedOnDate });
    component.prematureCloseRecurringDepositsAccountForm.patchValue({ onAccountClosureId: 100 });

    component.submit();

    expect(recurringDepositsService.executeRecurringDepositsAccountCommand).toHaveBeenLastCalledWith(
      accountId,
      'prematureClose',
      {
        closedOnDate: '01 September 2026',
        onAccountClosureId: 100,
        note: '',
        dateFormat: 'dd MMMM yyyy',
        locale: 'en'
      }
    );
    expect(router.navigate).toHaveBeenCalledWith(['../../'], { relativeTo: TestBed.inject(ActivatedRoute) });
  });

  it('should require and send the savings account when transferring to savings', () => {
    const form = component.prematureCloseRecurringDepositsAccountForm;
    form.patchValue({ closedOnDate });
    form.patchValue({ onAccountClosureId: 200 });
    expect(form.valid).toBe(false);

    form.patchValue({ toSavingsAccountId: 6, transferDescription: 'RD closure' });
    component.submit();

    expect(recurringDepositsService.executeRecurringDepositsAccountCommand).toHaveBeenLastCalledWith(
      accountId,
      'prematureClose',
      {
        closedOnDate: '01 September 2026',
        onAccountClosureId: 200,
        note: '',
        toSavingsAccountId: 6,
        transferDescription: 'RD closure',
        dateFormat: 'dd MMMM yyyy',
        locale: 'en'
      }
    );
  });
});
