/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatStepper } from '@angular/material/stepper';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faArrowRight, faCheck, faPencilAlt, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { of, Subject, throwError } from 'rxjs';
import { describe, expect, it, beforeEach, jest } from '@jest/globals';

import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import { BaseTellerService, SavingsDepositCommandResult, SavingsDepositReceipt } from '../base-teller.service';
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

  it('displays and submits the default editable note', () => {
    makeFormsValid();
    fixture.detectChanges();
    const noteInput: HTMLTextAreaElement = fixture.nativeElement.querySelector('[formControlName="note"]');

    expect(noteInput.value).toBe('DEPOSITO EN VENTANILLA');
    expect(noteInput.readOnly).toBe(false);
    expect(noteInput.disabled).toBe(false);

    component.submit();

    expect(baseTellerService.depositToSavingsAccount).toHaveBeenCalledWith(
      77,
      expect.objectContaining({ note: 'DEPOSITO EN VENTANILLA' })
    );
  });

  it('preserves an edited note and generated receipt through step navigation and submission', () => {
    makeFormsValid();
    const receiptNumber = component.depositForm.controls.receiptNumber.value;
    const stepper: MatStepper = fixture.debugElement.query(By.directive(MatStepper)).componentInstance;
    stepper.next();
    fixture.detectChanges();
    const noteInput: HTMLTextAreaElement = fixture.nativeElement.querySelector('[formControlName="note"]');
    noteInput.value = 'Nota personalizada';
    noteInput.dispatchEvent(new Event('input'));

    expect(component.proceedToPreview()).toBe(true);
    stepper.next();
    expect(stepper.selectedIndex).toBe(2);
    stepper.previous();
    stepper.previous();
    expect(stepper.selectedIndex).toBe(0);
    stepper.next();
    stepper.next();
    fixture.detectChanges();

    expect(noteInput.value).toBe('Nota personalizada');
    expect(component.depositForm.controls.receiptNumber.value).toBe(receiptNumber);
    component.submit();

    expect(baseTellerService.depositToSavingsAccount).toHaveBeenCalledWith(
      77,
      expect.objectContaining({ note: 'Nota personalizada', receiptNumber })
    );
  });

  it('automatically displays a read-only UUIDv7 receipt number within the existing length limit', () => {
    const receiptInput: HTMLInputElement = fixture.nativeElement.querySelector('[formControlName="receiptNumber"]');

    expect(receiptInput.value).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(receiptInput.readOnly).toBe(true);
    expect(receiptInput.value).toBe(component.depositForm.controls.receiptNumber.value);
    expect(component.depositForm.controls.receiptNumber.valid).toBe(true);
    expect(receiptInput.maxLength).toBe(50);
  });

  it('encodes Unix milliseconds and sets version and variant bits while retaining secure random bits', () => {
    const now = jest.spyOn(Date, 'now').mockReturnValue(0x017f22e279b0);
    const randomValues = jest.spyOn(crypto, 'getRandomValues').mockReturnValueOnce(new Uint8Array(16).fill(0xff));
    try {
      component.createForms();

      expect(randomValues).toHaveBeenCalledTimes(1);
      expect(randomValues).toHaveBeenCalledWith(expect.any(Uint8Array));
      expect(component.depositForm.controls.receiptNumber.value).toBe('017f22e2-79b0-7fff-bfff-ffffffffffff');
    } finally {
      now.mockRestore();
      randomValues.mockRestore();
    }
  });

  it('gives newly opened deposits different receipt numbers even within the same millisecond', () => {
    const now = jest.spyOn(Date, 'now').mockReturnValue(0x017f22e279b0);
    const nextFixture = TestBed.createComponent(SavingsAccountDepositComponent);
    try {
      nextFixture.detectChanges();
      const receiptNumber = nextFixture.componentInstance.depositForm.controls.receiptNumber.value;
      const anotherFixture = TestBed.createComponent(SavingsAccountDepositComponent);
      try {
        anotherFixture.detectChanges();

        expect(anotherFixture.componentInstance.depositForm.controls.receiptNumber.value).not.toBe(receiptNumber);
      } finally {
        anotherFixture.destroy();
      }
    } finally {
      nextFixture.destroy();
      now.mockRestore();
    }
  });

  it('preserves the receipt number during change detection, lookup navigation and template reloads', () => {
    makeFormsValid();
    const receiptNumber = component.depositForm.controls.receiptNumber.value;
    component.depositForm.controls.note.setValue('Nota personalizada');

    component.lookupForm.controls.search.setValue('Amina');
    component.selectLookupResult({ entityId: 10, entityName: 'Amina Doe', entityType: 'client' });
    component.lookupForm.controls.savingsAccount.setValue(activeSavingsAccount);
    fixture.detectChanges();
    fixture.detectChanges();

    expect(component.depositForm.controls.receiptNumber.value).toBe(receiptNumber);
    expect(component.depositForm.controls.note.value).toBe('Nota personalizada');
  });

  it('generates a new receipt once when starting another deposit after success', () => {
    makeFormsValid();
    const receiptNumber = component.depositForm.controls.receiptNumber.value;
    component.submit();

    component.lookupForm.controls.search.setValue('Amina');
    const nextReceiptNumber = component.depositForm.controls.receiptNumber.value;
    component.selectLookupResult({ entityId: 10, entityName: 'Amina Doe', entityType: 'client' });
    makeFormsValid();

    expect(nextReceiptNumber).not.toBe(receiptNumber);
    expect(component.depositForm.controls.receiptNumber.value).toBe(nextReceiptNumber);
    component.submit();
    expect(baseTellerService.depositToSavingsAccount).toHaveBeenNthCalledWith(
      2,
      77,
      expect.objectContaining({ receiptNumber: nextReceiptNumber })
    );
  });

  it('reuses the same receipt number when retrying a failed operation', () => {
    makeFormsValid();
    const receiptNumber = component.depositForm.controls.receiptNumber.value;
    baseTellerService.depositToSavingsAccount.mockReturnValueOnce(throwError(() => new Error('Network error')));

    component.submit();
    expect(component.isSubmitting).toBe(false);
    expect(component.proceedToPreview()).toBe(true);
    component.submit();

    expect(baseTellerService.depositToSavingsAccount).toHaveBeenCalledTimes(2);
    for (const [
      ,
      payload
    ] of baseTellerService.depositToSavingsAccount.mock.calls) {
      expect(payload.receiptNumber).toBe(receiptNumber);
    }
    expect(component.depositForm.controls.receiptNumber.value).toBe(receiptNumber);
  });

  it('preserves duplicate-submission protection and the receipt number while submitting', () => {
    makeFormsValid();
    const receiptNumber = component.depositForm.controls.receiptNumber.value;
    const response = new Subject<SavingsDepositCommandResult>();
    baseTellerService.depositToSavingsAccount.mockReturnValueOnce(response.asObservable());

    component.submit();
    component.submit();

    expect(component.isSubmitting).toBe(true);
    expect(baseTellerService.depositToSavingsAccount).toHaveBeenCalledTimes(1);
    expect(component.depositForm.controls.receiptNumber.value).toBe(receiptNumber);
    response.next({ resourceId: 101 });
    response.complete();
    fixture.detectChanges();
    const submitButton = Array.from(fixture.nativeElement.querySelectorAll('button')).find(
      (button: HTMLButtonElement) => button.textContent?.includes('labels.buttons.Submit')
    ) as HTMLButtonElement;
    expect(submitButton.disabled).toBe(true);
  });

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
      receiptNumber: component.depositForm.controls.receiptNumber.value,
      note: 'DEPOSITO EN VENTANILLA',
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
      bankNumber: 'BANK-1'
    });

    expect(component.buildPayload()).toEqual({
      transactionDate: '16 September 2026',
      transactionAmount: 50,
      paymentTypeId: 2,
      accountNumber: 'CHK-ACCOUNT',
      checkNumber: 'CHK-9',
      routingCode: 'RT-1',
      receiptNumber: component.depositForm.controls.receiptNumber.value,
      note: 'DEPOSITO EN VENTANILLA',
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
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.receipt').textContent).toContain('RC-101');
    expect(fixture.nativeElement.querySelector('.receipt').textContent).not.toContain(
      component.depositForm.controls.receiptNumber.value
    );
  });

  it('displays the generated receipt fallback if the saved transaction has no receipt number', () => {
    makeFormsValid();
    const receiptNumber = component.depositForm.controls.receiptNumber.value;
    baseTellerService.getSavingsDepositReceipt.mockReturnValueOnce(of({ id: 101, amount: 50 }));

    component.submit();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.receipt').textContent).toContain(receiptNumber);
  });

  it('preserves a receipt confirmed by the deposit response if receipt retrieval fails', () => {
    makeFormsValid();
    baseTellerService.depositToSavingsAccount.mockReturnValueOnce(
      of({ resourceId: 101, paymentDetailData: { receiptNumber: 'BACKEND-101' } })
    );
    baseTellerService.getSavingsDepositReceipt.mockReturnValueOnce(throwError(() => new Error('Network error')));

    component.submit();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.receipt').textContent).toContain('BACKEND-101');
    expect(fixture.nativeElement.querySelector('.receipt').textContent).not.toContain(
      component.depositForm.controls.receiptNumber.value
    );
  });

  it('retains a backend-confirmed receipt number if retrieved details omit it', () => {
    makeFormsValid();
    baseTellerService.depositToSavingsAccount.mockReturnValueOnce(
      of({ resourceId: 101, paymentDetailData: { receiptNumber: 'BACKEND-101' } })
    );
    baseTellerService.getSavingsDepositReceipt.mockReturnValueOnce(
      of({ id: 101, amount: 50, paymentDetailData: { paymentType: { name: 'Cash Drawer' } } })
    );

    component.submit();
    fixture.detectChanges();

    expect(component.receipt?.paymentDetailData).toEqual({
      receiptNumber: 'BACKEND-101',
      paymentType: { name: 'Cash Drawer' }
    });
    expect(fixture.nativeElement.querySelector('.receipt').textContent).toContain('BACKEND-101');
    expect(fixture.nativeElement.querySelector('.receipt').textContent).not.toContain(
      component.depositForm.controls.receiptNumber.value
    );
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

  it.each([
    'success',
    'error'
  ])('ignores a pending receipt %s after the account is cleared', (outcome) => {
    makeFormsValid();
    const pendingReceipt = new Subject<SavingsDepositReceipt>();
    baseTellerService.getSavingsDepositReceipt.mockReturnValueOnce(pendingReceipt.asObservable());
    component.submit();

    component.lookupForm.controls.search.setValue('Another customer');
    if (outcome === 'success') {
      pendingReceipt.next({ id: 101, paymentDetailData: { receiptNumber: 'BACKEND-101' } });
      pendingReceipt.complete();
    } else {
      pendingReceipt.error(new Error('Receipt lookup failed'));
    }

    expect(component.receipt).toBeUndefined();
    expect(component.commandResult).toBeUndefined();
  });

  it.each([
    'success',
    'error'
  ])('ignores an earlier deposit receipt %s after the next receipt loads', (outcome) => {
    makeFormsValid();
    const firstReceipt = new Subject<SavingsDepositReceipt>();
    const secondReceipt = new Subject<SavingsDepositReceipt>();
    baseTellerService.depositToSavingsAccount
      .mockReturnValueOnce(of({ resourceId: 101, paymentDetailData: { receiptNumber: 'BACKEND-101' } }))
      .mockReturnValueOnce(of({ resourceId: 202, paymentDetailData: { receiptNumber: 'BACKEND-202' } }));
    baseTellerService.getSavingsDepositReceipt
      .mockReturnValueOnce(firstReceipt.asObservable())
      .mockReturnValueOnce(secondReceipt.asObservable());
    component.submit();

    component.lookupForm.controls.search.setValue('Another deposit');
    makeFormsValid();
    component.submit();
    secondReceipt.next({ id: 202, amount: 50, runningBalance: 220 });
    secondReceipt.complete();
    const currentReceipt = component.receipt;

    expect(currentReceipt?.paymentDetailData?.receiptNumber).toBe('BACKEND-202');
    expect(baseTellerService.getSavingsDepositReceipt).toHaveBeenNthCalledWith(1, 77, 101);
    expect(baseTellerService.getSavingsDepositReceipt).toHaveBeenNthCalledWith(2, 77, 202);

    if (outcome === 'success') {
      firstReceipt.next({ id: 101, amount: 50, runningBalance: 170 });
      firstReceipt.complete();
    } else {
      firstReceipt.error(new Error('Receipt lookup failed'));
    }
    fixture.detectChanges();

    expect(component.receipt).toBe(currentReceipt);
    expect(component.receipt?.id).toBe(202);
    expect(fixture.nativeElement.querySelector('.receipt').textContent).toContain('BACKEND-202');
    expect(fixture.nativeElement.querySelector('.receipt').textContent).not.toContain('BACKEND-101');
  });

  it('ignores pending receipt details when a different savings account is selected', () => {
    makeFormsValid();
    const pendingReceipt = new Subject<SavingsDepositReceipt>();
    baseTellerService.getSavingsDepositReceipt.mockReturnValueOnce(pendingReceipt.asObservable());
    component.submit();
    const commandReceipt = component.receipt;

    component.lookupForm.controls.savingsAccount.setValue({ ...activeSavingsAccount, id: 88, accountNo: 'SA-88' });
    pendingReceipt.next({ id: 101, amount: 50, paymentDetailData: { receiptNumber: 'BACKEND-101' } });
    pendingReceipt.complete();

    expect(component.receipt).toBe(commandReceipt);
  });
});
