/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faArrowRight, faCheck, faPencilAlt, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { of, Subject, throwError } from 'rxjs';
import { describe, expect, it, beforeEach, jest } from '@jest/globals';

import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import { BaseTellerService } from '../base-teller.service';
import { SavingsAccountDepositComponent } from './savings-account-deposit.component';

describe('SavingsAccountDepositComponent', () => {
  let component: SavingsAccountDepositComponent;
  let fixture: ComponentFixture<SavingsAccountDepositComponent>;
  let baseTellerService: jest.Mocked<BaseTellerService>;

  const businessDate = new Date(2026, 8, 16);
  const activeSavingsAccount = {
    id: 77,
    accountNo: 'SA-77',
    productName: 'Voluntary Savings',
    currency: { code: 'USD' },
    status: { active: true, value: 'Active' },
    summary: { accountBalance: 120 }
  };

  beforeEach(async () => {
    baseTellerService = {
      searchDepositCustomersAndAccounts: jest.fn(() => of([])),
      getDepositClient: jest.fn(() => of({ id: 10, displayName: 'Amina Doe', accountNo: 'CL-10' })),
      getDepositClientAccounts: jest.fn(() => of({ savingsAccounts: [activeSavingsAccount] })),
      getDepositSavingsAccount: jest.fn(() => of(activeSavingsAccount)),
      getSavingsDepositTemplate: jest.fn(() =>
        of({
          paymentTypeOptions: [
            { id: 1, name: 'Cash Drawer', isCashPayment: true },
            { id: 2, name: 'Bank Check', isCashPayment: false }
          ]
        })
      ),
      depositToSavingsAccount: jest.fn(() => of({ resourceId: 101, savingsId: 77, changes: { paymentTypeId: 1 } })),
      getSavingsDepositReceipt: jest.fn(() =>
        of({
          id: 101,
          accountNo: 'SA-77',
          amount: 50,
          runningBalance: 170,
          paymentDetailData: { receiptNumber: 'RC-101' },
          transactionType: { value: 'Deposit' }
        })
      )
    } as unknown as jest.Mocked<BaseTellerService>;

    await TestBed.configureTestingModule({
      imports: [
        SavingsAccountDepositComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: BaseTellerService, useValue: baseTellerService },
        {
          provide: AuthenticationService,
          useValue: { getCredentials: jest.fn(() => ({ permissions: ['ALL_FUNCTIONS'] })) }
        },
        { provide: SettingsService, useValue: { businessDate, dateFormat: 'dd MMMM yyyy', language: { code: 'en' } } },
        { provide: Dates, useValue: { formatDate: jest.fn(() => '16 September 2026') } },
        provideNativeDateAdapter(),
        provideAnimationsAsync()
      ]
    }).compileComponents();

    TestBed.inject(FaIconLibrary).addIcons(faArrowLeft, faArrowRight, faCheck, faPencilAlt, faPlus, faTrash);
    fixture = TestBed.createComponent(SavingsAccountDepositComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function makeFormsValid(paymentTypeId: number = 1): void {
    component.selectedSavingsAccount = activeSavingsAccount;
    component.paymentTypeOptions = [
      { id: 1, name: 'Cash Drawer', isCashPayment: true },
      { id: 2, name: 'Bank Check', isCashPayment: false }
    ];
    component.lookupForm.patchValue({
      search: { entityId: 10, entityName: 'Amina Doe' },
      savingsAccount: activeSavingsAccount
    });
    component.depositForm.patchValue({
      depositType: 'CASH',
      transactionDate: businessDate,
      transactionAmount: 50,
      paymentTypeId
    });
    component.denominations.at(0).patchValue({ denomination: 25, quantity: 2 });
  }

  it('filters payment types by CASH and CHECK metadata', () => {
    component.paymentTypeOptions = [
      { id: 1, name: 'Cash Drawer', isCashPayment: true },
      { id: 2, name: 'Bank Check', isCashPayment: false }
    ];

    expect(component.filteredPaymentTypeOptions.map((paymentType) => paymentType.id)).toEqual([1]);

    component.depositForm.patchValue({ depositType: 'CHECK' });

    expect(component.filteredPaymentTypeOptions.map((paymentType) => paymentType.id)).toEqual([2]);
  });

  it('clears an invalid selected payment type when switching deposit type', () => {
    component.paymentTypeOptions = [
      { id: 1, name: 'Cash Drawer', isCashPayment: true },
      { id: 2, name: 'Bank Check', isCashPayment: false }
    ];
    component.depositForm.patchValue({ paymentTypeId: 1 });

    component.depositForm.patchValue({ depositType: 'CHECK' });

    expect(component.depositForm.value.paymentTypeId).toBe('');
  });

  it('calculates denomination totals and blocks mismatched cash totals', () => {
    makeFormsValid();
    component.depositForm.patchValue({ transactionAmount: 70 });
    component.denominations.at(0).patchValue({ denomination: 20, quantity: 3 });

    expect(component.denominationTotal).toBe(60);
    expect(component.cashDenominationsReconcile).toBe(false);
    expect(component.proceedToPreview()).toBe(false);
    expect(component.errorMessage).toBe('labels.text.Cash denomination total must equal the transaction amount');
  });

  it('requires integer denomination quantities', () => {
    component.denominations.at(0).patchValue({ denomination: 20, quantity: 1.5 });

    expect(component.denominations.at(0).get('quantity')?.hasError('integer')).toBe(true);
    expect(component.depositForm.valid).toBe(false);
  });

  it('clears selected account state when lookup text changes', () => {
    makeFormsValid();

    component.lookupForm.controls.search.setValue('Amina changed');

    expect(component.selectedSavingsAccount).toBeNull();
    expect(component.paymentTypeOptions).toEqual([]);
    expect(component.lookupForm.value.savingsAccount).toBe('');
    expect(component.depositForm.value.paymentTypeId).toBe('');
  });

  it('ignores stale savings account selection responses', () => {
    const firstAccountResponse = new Subject<typeof activeSavingsAccount>();
    const secondAccountResponse = new Subject<typeof activeSavingsAccount>();
    baseTellerService.getDepositSavingsAccount
      .mockReturnValueOnce(firstAccountResponse.asObservable())
      .mockReturnValueOnce(secondAccountResponse.asObservable());

    component.loadSavingsAccount(77);
    component.loadSavingsAccount(88);
    firstAccountResponse.next({ ...activeSavingsAccount, id: 77, accountNo: 'SA-77' });
    secondAccountResponse.next({ ...activeSavingsAccount, id: 88, accountNo: 'SA-88' });

    expect(component.selectedSavingsAccount?.id).toBe(88);
    expect(component.lookupForm.value.savingsAccount).toEqual(expect.objectContaining({ id: 88 }));
  });

  it('requires backend check payment detail fields for CHECK deposits', () => {
    component.depositForm.patchValue({ depositType: 'CHECK' });

    expect(component.depositForm.get('accountNumber')?.hasError('required')).toBe(true);
    expect(component.depositForm.get('checkNumber')?.hasError('required')).toBe(true);
    expect(component.depositForm.get('routingCode')?.hasError('required')).toBe(true);
    expect(component.depositForm.get('bankNumber')?.hasError('required')).toBe(true);
  });

  it('keeps submit disabled while the form is invalid', () => {
    fixture.detectChanges();

    const submitButton = Array.from(fixture.nativeElement.querySelectorAll('button')).find(
      (button: HTMLButtonElement) => button.textContent?.includes('labels.buttons.Submit')
    ) as HTMLButtonElement;

    expect(submitButton.disabled).toBe(true);
  });

  it('builds a cash request payload without unsupported denomination fields', () => {
    makeFormsValid();

    expect(component.buildPayload()).toEqual({
      transactionDate: '16 September 2026',
      transactionAmount: 50,
      paymentTypeId: 1,
      dateFormat: 'dd MMMM yyyy',
      locale: 'en'
    });
  });

  it('builds a check request payload with backend payment detail fields', () => {
    makeFormsValid(2);
    component.depositForm.patchValue({
      depositType: 'CHECK',
      accountNumber: 'CHK-ACCOUNT',
      checkNumber: 'CHK-9',
      routingCode: 'RT-1',
      receiptNumber: 'RC-9',
      bankNumber: 'BANK-1'
    });

    expect(component.buildPayload()).toEqual({
      transactionDate: '16 September 2026',
      transactionAmount: 50,
      paymentTypeId: 2,
      accountNumber: 'CHK-ACCOUNT',
      checkNumber: 'CHK-9',
      routingCode: 'RT-1',
      receiptNumber: 'RC-9',
      bankNumber: 'BANK-1',
      dateFormat: 'dd MMMM yyyy',
      locale: 'en'
    });
  });

  it('stores the success response and retrieves the authoritative transaction receipt', () => {
    makeFormsValid();

    component.submit();

    expect(baseTellerService.depositToSavingsAccount).toHaveBeenCalledWith(
      77,
      expect.objectContaining({ paymentTypeId: 1 })
    );
    expect(baseTellerService.getSavingsDepositReceipt).toHaveBeenCalledWith(77, 101);
    expect(component.commandResult).toEqual({ resourceId: 101, savingsId: 77, changes: { paymentTypeId: 1 } });
    expect(component.receipt).toEqual(expect.objectContaining({ id: 101, runningBalance: 170 }));
  });

  it('preserves backend error messages on failed submission', () => {
    makeFormsValid();
    baseTellerService.depositToSavingsAccount.mockReturnValueOnce(
      throwError(() => ({ error: { defaultUserMessage: 'paymentTypeId is required' } }))
    );

    component.submit();

    expect(component.errorMessage).toBe('paymentTypeId is required');
    expect(component.commandResult).toBeUndefined();
  });
});
