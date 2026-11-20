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
import { of, Subject, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import { FixedDepositsService } from '../../fixed-deposits.service';
import { PrematureCloseFixedDepositsAccountComponent } from './premature-close-fixed-deposits-account.component';

describe('PrematureCloseFixedDepositsAccountComponent', () => {
  let component: PrematureCloseFixedDepositsAccountComponent;
  let fixture: ComponentFixture<PrematureCloseFixedDepositsAccountComponent>;
  let fixedDepositsService: jest.Mocked<FixedDepositsService>;
  let router: jest.Mocked<Router>;

  const accountId = '789';
  const closedOnDate = new Date(2026, 8, 1);
  /** What Fineract returns for calculatePrematureAmount on a fixed deposit. */
  const prematureCloseTemplate = {
    maturityAmount: 101.79,
    onAccountClosureOptions: [
      { id: 100, value: 'Withdraw Deposit' },
      { id: 200, value: 'Transfer to Savings' }
    ],
    savingsAccounts: [{ id: 6, accountNo: '000000006' }]
  };

  beforeEach(async () => {
    fixedDepositsService = {
      executeFixedDepositsAccountCommand: jest.fn((_id: string, command: string) =>
        of(command === 'calculatePrematureAmount' ? prematureCloseTemplate : {})
      )
    } as any;
    router = {
      navigate: jest.fn(() => Promise.resolve(true))
    } as any;

    await TestBed.configureTestingModule({
      imports: [
        PrematureCloseFixedDepositsAccountComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { parent: { snapshot: { params: { fixedDepositAccountId: accountId } } } }
        },
        { provide: Router, useValue: router },
        { provide: FixedDepositsService, useValue: fixedDepositsService },
        {
          provide: SettingsService,
          useValue: { businessDate: closedOnDate, language: { code: 'en' }, dateFormat: 'dd MMMM yyyy' }
        },
        { provide: Dates, useValue: { formatDate: jest.fn(() => '01 September 2026') } },
        provideNativeDateAdapter(),
        provideNoopAnimations()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PrematureCloseFixedDepositsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const confirmButton = (): HTMLButtonElement =>
    fixture.nativeElement.querySelector('mat-card-actions button:last-child');

  const prematureCloseRequests = () =>
    fixedDepositsService.executeFixedDepositsAccountCommand.mock.calls.filter((call) => call[1] === 'prematureClose');

  it('should disable Confirm when Premature Close Date is empty', () => {
    expect(confirmButton().disabled).toBe(true);
  });

  it('should load the maturity amount and closure options for the chosen date', () => {
    component.prematureCloseAccountForm.patchValue({ closedOnDate });
    fixture.detectChanges();

    expect(fixedDepositsService.executeFixedDepositsAccountCommand).toHaveBeenCalledWith(
      accountId,
      'calculatePrematureAmount',
      { closedOnDate: '01 September 2026', dateFormat: 'dd MMMM yyyy', locale: 'en' }
    );
    expect(component.prematureCloseAccountForm.get('maturityAmount').value).toBe(101.79);
    expect(component.onAccountClosureOptions).toEqual(prematureCloseTemplate.onAccountClosureOptions);
  });

  it('should keep Confirm disabled until a closure action is chosen', () => {
    component.prematureCloseAccountForm.patchValue({ closedOnDate });
    fixture.detectChanges();
    expect(confirmButton().disabled).toBe(true);

    component.prematureCloseAccountForm.patchValue({ onAccountClosureId: 100 });
    fixture.detectChanges();
    expect(confirmButton().disabled).toBe(false);
  });

  it('should keep Confirm disabled and refuse to submit while the calculation is pending', () => {
    const pending = new Subject<any>();
    fixedDepositsService.executeFixedDepositsAccountCommand.mockReturnValueOnce(pending as any);
    const form = component.prematureCloseAccountForm;

    form.patchValue({ closedOnDate });
    fixture.detectChanges();

    expect(form.valid).toBe(false);
    expect(confirmButton().disabled).toBe(true);

    component.submit();

    expect(prematureCloseRequests()).toHaveLength(0);
  });

  it('should keep the form invalid and Confirm disabled when the calculation fails', () => {
    fixedDepositsService.executeFixedDepositsAccountCommand.mockReturnValueOnce(
      throwError(() => new Error('calculation failed'))
    );
    const form = component.prematureCloseAccountForm;

    form.patchValue({ closedOnDate });
    fixture.detectChanges();

    expect(form.valid).toBe(false);
    expect(confirmButton().disabled).toBe(true);

    component.submit();

    expect(prematureCloseRequests()).toHaveLength(0);
  });

  it('should only apply the calculation of the latest date and clear the previous choice', () => {
    const first = new Subject<any>();
    const second = new Subject<any>();
    fixedDepositsService.executeFixedDepositsAccountCommand
      .mockReturnValueOnce(first as any)
      .mockReturnValueOnce(second as any);
    const form = component.prematureCloseAccountForm;

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
    fixedDepositsService.executeFixedDepositsAccountCommand.mockReturnValueOnce(pending as any);
    const form = component.prematureCloseAccountForm;

    form.patchValue({ closedOnDate });
    form.patchValue({ closedOnDate: null });
    pending.next(prematureCloseTemplate);

    expect(form.get('maturityAmount').value).toBe('');
    expect(component.onAccountClosureOptions).toEqual([]);
  });

  it('should not submit an invalid form', () => {
    component.submit();

    expect(prematureCloseRequests()).toHaveLength(0);
  });

  it('should submit a withdrawal closure with the chosen closure id and navigate to the account', () => {
    component.prematureCloseAccountForm.patchValue({ closedOnDate });
    component.prematureCloseAccountForm.patchValue({ onAccountClosureId: 100 });

    component.submit();

    expect(prematureCloseRequests()).toEqual([
      [
        accountId,
        'prematureClose',
        {
          closedOnDate: '01 September 2026',
          onAccountClosureId: 100,
          note: '',
          dateFormat: 'dd MMMM yyyy',
          locale: 'en'
        }
      ]
    ]);
    expect(router.navigate).toHaveBeenCalledWith(['../../'], { relativeTo: TestBed.inject(ActivatedRoute) });
  });

  it('should require and send the savings account when transferring to savings', () => {
    const form = component.prematureCloseAccountForm;
    form.patchValue({ closedOnDate });
    form.patchValue({ onAccountClosureId: 200 });
    expect(form.valid).toBe(false);

    form.patchValue({ toSavingsAccountId: 6, transferDescription: 'FD closure' });
    component.submit();

    expect(prematureCloseRequests()).toEqual([
      [
        accountId,
        'prematureClose',
        {
          closedOnDate: '01 September 2026',
          onAccountClosureId: 200,
          note: '',
          toSavingsAccountId: 6,
          transferDescription: 'FD closure',
          dateFormat: 'dd MMMM yyyy',
          locale: 'en'
        }
      ]
    ]);
  });

  it('should not submit again while the first request is in flight', () => {
    const form = component.prematureCloseAccountForm;
    form.patchValue({ closedOnDate });
    form.patchValue({ onAccountClosureId: 100 });
    const pending = new Subject<any>();
    fixedDepositsService.executeFixedDepositsAccountCommand.mockReturnValueOnce(pending as any);

    component.submit();
    component.submit();

    expect(prematureCloseRequests()).toHaveLength(1);
    expect(component.isSubmitting).toBe(true);

    fixture.detectChanges();
    expect(confirmButton().disabled).toBe(true);

    pending.next({});
    pending.complete();
    fixture.detectChanges();

    expect(component.isSubmitting).toBe(false);
    expect(confirmButton().disabled).toBe(false);
  });

  it('should handle a failed submission, then allow a successful retry', () => {
    const form = component.prematureCloseAccountForm;
    form.patchValue({ closedOnDate });
    form.patchValue({ onAccountClosureId: 100 });
    fixedDepositsService.executeFixedDepositsAccountCommand.mockReturnValueOnce(
      throwError(() => new Error('premature close failed'))
    );

    // The component subscription handles the error, so rxjs does not report it
    // asynchronously as an unhandled error.
    component.submit();
    fixture.detectChanges();

    expect(prematureCloseRequests()).toHaveLength(1);
    expect(component.isSubmitting).toBe(false);
    expect(router.navigate).not.toHaveBeenCalled();
    expect(confirmButton().disabled).toBe(false);

    component.submit();
    fixture.detectChanges();

    expect(prematureCloseRequests()).toHaveLength(2);
    expect(router.navigate).toHaveBeenCalledWith(['../../'], { relativeTo: TestBed.inject(ActivatedRoute) });
  });
});
