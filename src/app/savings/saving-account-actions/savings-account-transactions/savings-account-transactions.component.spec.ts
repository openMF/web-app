/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideNativeDateAdapter } from '@angular/material/core';
import { TranslateModule } from '@ngx-translate/core';
import { of, Subject, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { describe, it, expect, jest } from '@jest/globals';

import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import { SavingsService } from 'app/savings/savings.service';
import { SavingsAccountTransactionsComponent } from './savings-account-transactions.component';

describe('SavingsAccountTransactionsComponent', () => {
  let component: SavingsAccountTransactionsComponent;
  let fixture: ComponentFixture<SavingsAccountTransactionsComponent>;

  const businessDate = new Date(2026, 0, 15);

  const setup = async (actionName: 'Deposit' | 'Withdrawal' = 'Deposit', decimalPlaces = 6) => {
    await TestBed.configureTestingModule({
      imports: [
        SavingsAccountTransactionsComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({
              savingsAccountActionData: {
                currency: {
                  code: 'USD',
                  name: 'US Dollar',
                  displaySymbol: '$',
                  decimalPlaces
                },
                paymentTypeOptions: [
                  {
                    id: 1,
                    name: 'Cash'
                  }
                ]
              }
            }),
            snapshot: {
              params: {
                name: actionName,
                savingAccountId: '42'
              }
            }
          }
        },
        {
          provide: SettingsService,
          useValue: {
            businessDate,
            dateFormat: 'dd MMMM yyyy',
            language: { code: 'en' }
          }
        },
        {
          provide: SavingsService,
          useValue: {
            executeSavingsAccountTransactionsCommand: jest.fn(() => of({ resourceId: 1 }))
          }
        },
        {
          provide: Dates,
          useValue: {
            formatDate: jest.fn(() => '15 January 2026')
          }
        },
        provideNativeDateAdapter(),
        provideAnimationsAsync()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SavingsAccountTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  const setAmount = (amount: number | string | null) => {
    component.savingAccountTransactionForm.patchValue({
      transactionDate: businessDate,
      transactionAmount: amount,
      paymentTypeId: 1
    });
    component.savingAccountTransactionForm.controls.transactionAmount.updateValueAndValidity();
  };

  it.each([
    'Deposit',
    'Withdrawal'
  ] as const)('uses the same positive amount validation for %s', async (actionName) => {
    await setup(actionName);

    setAmount(0);

    expect(component.transactionCommand).toBe(actionName.toLowerCase());
    expect(component.savingAccountTransactionForm.controls.transactionAmount.hasError('min')).toBe(true);
    expect(component.savingAccountTransactionForm.valid).toBe(false);
  });

  it('is invalid when transaction amount is zero', async () => {
    await setup();

    setAmount(0);

    expect(component.savingAccountTransactionForm.controls.transactionAmount.hasError('min')).toBe(true);
    expect(component.savingAccountTransactionForm.valid).toBe(false);
  });

  it('is invalid when transaction amount is zero after decimal input processing', async () => {
    await setup();

    setAmount('0.00');

    expect(component.savingAccountTransactionForm.controls.transactionAmount.hasError('min')).toBe(true);
    expect(component.savingAccountTransactionForm.valid).toBe(false);
  });

  it('is invalid when transaction amount is negative', async () => {
    await setup();

    setAmount(-1);

    expect(component.savingAccountTransactionForm.controls.transactionAmount.hasError('min')).toBe(true);
    expect(component.savingAccountTransactionForm.valid).toBe(false);
  });

  it('is invalid when transaction amount is empty', async () => {
    await setup();

    setAmount('');

    expect(component.savingAccountTransactionForm.controls.transactionAmount.hasError('required')).toBe(true);
    expect(component.savingAccountTransactionForm.valid).toBe(false);
  });

  it('accepts the smallest supported positive amount', async () => {
    await setup();

    setAmount(component.minimumTransactionAmount);

    expect(component.savingAccountTransactionForm.controls.transactionAmount.valid).toBe(true);
    expect(component.savingAccountTransactionForm.valid).toBe(true);
  });

  it('uses account currency precision when selecting the minimum positive amount', async () => {
    await setup('Deposit', 3);

    expect(component.minimumTransactionAmount).toBe(0.001);

    setAmount(0.000001);
    expect(component.savingAccountTransactionForm.controls.transactionAmount.hasError('min')).toBe(true);

    setAmount(0.001);
    expect(component.savingAccountTransactionForm.valid).toBe(true);
  });

  it('does not proceed to confirmation when the amount is invalid', async () => {
    await setup();
    const next = jest.spyOn(component.stepper, 'next');

    setAmount(0);
    component.proceedToConfirmation();

    expect(next).not.toHaveBeenCalled();
  });

  it('keeps the existing amount format validation', async () => {
    await setup();

    setAmount('1.1234567');

    expect(component.savingAccountTransactionForm.controls.transactionAmount.hasError('highAmountValue')).toBe(true);
    expect(component.savingAccountTransactionForm.valid).toBe(false);
  });
  it('retains a known backend restriction inline, clears pending state and does not advance or retry', async () => {
    await setup();
    setAmount(1);
    const execute = jest
      .spyOn(TestBed.inject(SavingsService), 'executeSavingsAccountTransactionsCommand')
      .mockReturnValue(
        throwError(
          () =>
            new HttpErrorResponse({
              status: 400,
              error: {
                errors: [{ userMessageGlobalisationCode: 'error.msg.savings.product.transaction.purpose.unsupported' }]
              }
            })
        )
      );
    const next = jest.spyOn(component.stepper, 'next');
    component.confirmTransaction();
    fixture.detectChanges();
    expect(component.financialError).toBe('FinancialControls.Errors.purpose.unsupported');
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'FinancialControls.Errors.purpose.unsupported'
    );
    expect(component.isSubmitting).toBe(false);
    expect(execute).toHaveBeenCalledTimes(1);
    expect(next).not.toHaveBeenCalled();
    expect(component.transactionResponse).toBeNull();
  });
  it('preserves successful native submission and guards overlapping clicks', async () => {
    await setup();
    setAmount(1);
    const pending = new Subject<{ resourceId: number }>();
    const execute = jest
      .spyOn(TestBed.inject(SavingsService), 'executeSavingsAccountTransactionsCommand')
      .mockReturnValue(pending);
    const next = jest.spyOn(component.stepper, 'next');
    component.confirmTransaction();
    component.confirmTransaction();
    expect(execute).toHaveBeenCalledTimes(1);
    pending.next({ resourceId: 123 });
    pending.complete();
    expect(component.transactionResponse).toEqual({ resourceId: 123 });
    expect(next).toHaveBeenCalledTimes(1);
    expect(component.isSubmitting).toBe(false);
  });
  it('does not turn unknown backend errors into an invented restriction or receipt', async () => {
    await setup();
    setAmount(1);
    jest
      .spyOn(TestBed.inject(SavingsService), 'executeSavingsAccountTransactionsCommand')
      .mockReturnValue(throwError(() => new HttpErrorResponse({ status: 403, error: {} })));
    const next = jest.spyOn(component.stepper, 'next');
    component.confirmTransaction();
    expect(component.financialError).toBeNull();
    expect(next).not.toHaveBeenCalled();
    expect(component.isSubmitting).toBe(false);
  });
});
