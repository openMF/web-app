/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatStepper } from '@angular/material/stepper';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faArrowRight, faCheck, faPencilAlt, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { of, Subject, throwError } from 'rxjs';
import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals';

import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { environment } from 'environments/environment';
import { Dates } from 'app/core/utils/dates';
import { SavingsService } from 'app/savings/savings.service';
import { SettingsService } from 'app/settings/settings.service';
import {
  BaseTellerService,
  DepositClientAccounts,
  DepositSavingsAccount,
  DepositSearchResult,
  SavingsDepositCommandResult,
  SavingsDepositReceipt
} from '../base-teller.service';
import { DepositSubmissionStateService } from './deposit-submission-state.service';
import { DepositReceiptExportService } from './deposit-receipt-export.service';
import { SavingsAccountDepositComponent } from './savings-account-deposit.component';

describe('SavingsAccountDepositComponent', () => {
  let component: SavingsAccountDepositComponent;
  let fixture: ComponentFixture<SavingsAccountDepositComponent>;
  let savingsNotes: { getSavingsNotes: jest.Mock; createSavingsNote: jest.Mock };
  let baseTellerService: jest.Mocked<BaseTellerService>;

  const businessDate = new Date(2026, 8, 16);
  const activeSavingsAccount = {
    id: 77,
    clientId: 10,
    accountNo: 'SA-77',
    productName: 'Voluntary Savings',
    currency: { code: 'USD', decimalPlaces: 2 },
    status: { active: true, value: 'Active' },
    summary: { accountBalance: 120 }
  };

  beforeEach(async () => {
    let notes: unknown[] = [];
    savingsNotes = {
      getSavingsNotes: jest.fn(() => of(notes)),
      createSavingsNote: jest.fn((_id: string, payload: { note: string }) => {
        notes = [{ id: 501, createdById: 1, note: payload.note }];
        return of({ resourceId: 501 });
      })
    };
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
        { provide: SavingsService, useValue: savingsNotes },
        {
          provide: AuthenticationService,
          useValue: { getCredentials: jest.fn(() => ({ userId: 1, permissions: ['ALL_FUNCTIONS'] })) }
        },
        { provide: SettingsService, useValue: { businessDate, dateFormat: 'dd MMMM yyyy', language: { code: 'en' } } },
        { provide: Dates, useValue: { formatDate: jest.fn(() => '16 September 2026') } },
        provideRouter([]),
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
    component.customer = { id: 10, displayName: 'Amina Doe', accountNo: 'CL-10' };
    component.savingsAccounts = [activeSavingsAccount];
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

  function startAnotherDeposit(): void {
    const stepper = fixture.debugElement.query(By.directive(MatStepper)).componentInstance as MatStepper;
    component.startNewDeposit(stepper, fixture.nativeElement.querySelector('input[formControlName="search"]'));
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

    startAnotherDeposit();
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

  it('reuses the same receipt number when correcting a definitively rejected operation', () => {
    makeFormsValid();
    const receiptNumber = component.depositForm.controls.receiptNumber.value;
    baseTellerService.depositToSavingsAccount.mockReturnValueOnce(
      throwError(() => ({ status: 400, error: { defaultUserMessage: 'Invalid payment' } }))
    );

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
    expect(fixture.nativeElement.querySelector('[data-testid="deposit-success"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.confirmation-footer').textContent).not.toContain(
      'depositReceipt.confirmDeposit'
    );
    component.submit();
    expect(baseTellerService.depositToSavingsAccount).toHaveBeenCalledTimes(1);
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

    baseTellerService.getDepositClientAccounts.mockReturnValueOnce(
      of({ savingsAccounts: [
          activeSavingsAccount,
          { ...activeSavingsAccount, id: 88, accountNo: 'SA-88' }
        ] })
    );
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
      (button: HTMLButtonElement) => button.textContent?.includes('depositReceipt.confirmDeposit')
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
      throwError(() => ({ status: 400, error: { defaultUserMessage: 'paymentTypeId is required' } }))
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

    startAnotherDeposit();
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

    startAnotherDeposit();
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

  it('blocks changing the destination while receipt details are pending', () => {
    makeFormsValid();
    const pendingReceipt = new Subject<SavingsDepositReceipt>();
    baseTellerService.getSavingsDepositReceipt.mockReturnValueOnce(pendingReceipt.asObservable());
    component.submit();
    const commandReceipt = component.receipt;

    const secondAccount = { ...activeSavingsAccount, id: 88, accountNo: 'SA-88' };
    component.savingsAccounts.push(secondAccount);
    baseTellerService.getDepositSavingsAccount.mockReturnValueOnce(of(secondAccount));
    baseTellerService.getSavingsDepositTemplate.mockReturnValueOnce(
      of({ paymentTypeOptions: [{ id: 1, name: 'Cash Drawer', isCashPayment: true }] })
    );
    component.lookupForm.controls.savingsAccount.setValue(secondAccount);
    expect(component.selectedSavingsAccount?.id).toBe(77);
    expect(component.lookupForm.controls.savingsAccount.value).toEqual(activeSavingsAccount);
    expect(component.lookupForm.valid).toBe(true);
    pendingReceipt.next({ id: 101, amount: 50, paymentDetailData: { receiptNumber: 'BACKEND-101' } });
    pendingReceipt.complete();

    expect(commandReceipt).toBeDefined();
    expect(component.receipt?.id).toBe(101);
    expect(component.receiptView?.accountNumber).toBe('SA-77');
  });

  describe('WEB-1468 selection', () => {
    afterEach(() => jest.useRealTimers());
    function lookup(query = 'Amina') {
      component.lookupForm.controls.search.setValue(query);
      const result = { entityId: 10, entityType: 'CLIENT', entityName: 'Amina Doe' };
      component.lookupForm.controls.search.setValue(result);
      component.selectLookupResult(result);
    }
    function render() {
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
    }
    function twoAccounts() {
      const second = { ...activeSavingsAccount, id: 88, accountNo: 'SA-88', productName: 'Goal Savings' };
      baseTellerService.getDepositClientAccounts.mockReturnValue(
        of({ savingsAccounts: [
            activeSavingsAccount,
            second
          ] })
      );
      baseTellerService.getDepositSavingsAccount.mockImplementation((id) =>
        of(String(id) === '88' ? second : activeSavingsAccount)
      );
      lookup();
      return second;
    }

    it('starts incomplete with an empty sidebar and disabled next action', () => {
      expect(component.selectionReady).toBe(false);
      expect(fixture.nativeElement.querySelector('.selection-next').disabled).toBe(true);
      expect(fixture.nativeElement.querySelector('.account-context').textContent).toContain(
        'depositSelection.chooseAccount'
      );
      expect(baseTellerService.depositToSavingsAccount).not.toHaveBeenCalled();
    });

    it.each([
      'Amina',
      'SA-77'
    ])('debounces supported lookup query %s with a two-character minimum', (query: string) => {
      jest.useFakeTimers();
      const results = [{ entityId: 10, entityType: 'CLIENT', entityName: 'Amina Doe' }];
      baseTellerService.searchDepositCustomersAndAccounts.mockReturnValue(of(results));
      component.lookupForm.controls.search.setValue('A');
      jest.advanceTimersByTime(300);
      expect(baseTellerService.searchDepositCustomersAndAccounts).not.toHaveBeenCalled();
      component.lookupForm.controls.search.setValue(query);
      jest.advanceTimersByTime(299);
      expect(baseTellerService.searchDepositCustomersAndAccounts).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(baseTellerService.searchDepositCustomersAndAccounts).toHaveBeenCalledWith(query);
      expect(component.searchResults).toEqual(results);
      component.lookupForm.controls.search.setValue(query);
      jest.advanceTimersByTime(300);
      expect(baseTellerService.searchDepositCustomersAndAccounts).toHaveBeenCalledTimes(1);
    });

    it('cancels stale search results immediately while a replacement query is debouncing', () => {
      jest.useFakeTimers();
      const pending = new Subject<DepositSearchResult[]>();
      baseTellerService.searchDepositCustomersAndAccounts.mockReturnValueOnce(pending);
      component.lookupForm.controls.search.setValue('First');
      jest.advanceTimersByTime(300);
      component.lookupForm.controls.search.setValue('Next');
      pending.next([{ entityId: 9, entityType: 'CLIENT', entityName: 'Previous customer' }]);
      expect(component.searchResults).toEqual([]);
      jest.advanceTimersByTime(300);
      expect(baseTellerService.searchDepositCustomersAndAccounts).toHaveBeenLastCalledWith('Next');
    });

    it('keeps a pending search and its results when only surrounding whitespace changes', () => {
      jest.useFakeTimers();
      const pending = new Subject<DepositSearchResult[]>();
      const results = [{ entityId: 10, entityType: 'CLIENT', entityName: 'Amina Doe' }];
      baseTellerService.searchDepositCustomersAndAccounts.mockReturnValueOnce(pending);
      component.lookupForm.controls.search.setValue('Amina');
      jest.advanceTimersByTime(300);
      component.lookupForm.controls.search.setValue('  Amina ');
      expect(pending.observed).toBe(true);
      expect(component.isSearching).toBe(true);
      pending.next(results);
      pending.complete();
      component.lookupForm.controls.search.setValue('Amina  ');
      jest.advanceTimersByTime(300);
      expect(component.searchResults).toEqual(results);
      expect(component.hasSearched).toBe(true);
      expect(baseTellerService.searchDepositCustomersAndAccounts).toHaveBeenCalledTimes(1);
    });

    it('retries a failed text search using the same trimmed query', () => {
      jest.useFakeTimers();
      const results = [{ entityId: 10, entityType: 'CLIENT', entityName: 'Amina Doe' }];
      baseTellerService.searchDepositCustomersAndAccounts
        .mockReturnValueOnce(throwError(() => new Error('offline')))
        .mockReturnValueOnce(of(results));
      component.lookupForm.controls.search.setValue('  Amina  ');
      jest.advanceTimersByTime(300);
      expect(component.errorMessage).toBe('offline');
      component.retrySelection();
      jest.advanceTimersByTime(300);
      expect(baseTellerService.searchDepositCustomersAndAccounts.mock.calls).toEqual([
        ['Amina'],
        ['Amina']
      ]);
      expect(component.searchResults).toEqual(results);
      expect(component.errorMessage).toBe('');
    });

    it('restores search focus only for a text-query retry', () => {
      jest.useFakeTimers();
      const input: HTMLInputElement = fixture.nativeElement.querySelector('input[formControlName="search"]');
      const focus = jest.spyOn(input, 'focus').mockImplementation(() => undefined);
      component.lookupForm.controls.search.setValue('Amina');
      jest.advanceTimersByTime(300);
      component.retrySelection(input);
      expect(focus).toHaveBeenCalledTimes(1);
      jest.advanceTimersByTime(300);
      lookup();
      component.retrySelection(input);
      expect(focus).toHaveBeenCalledTimes(1);
      component.selectAccount(activeSavingsAccount);
      component.retrySelection(input);
      expect(focus).toHaveBeenCalledTimes(1);
    });

    it.each([
      'accountType',
      'subEntityType'
    ] as const)('uses %s consistently for savings result labels and dispatch', (key) => {
      const result = { [key]: 'SAVINGS', accountId: 77, entityName: 'Amina Doe' };
      component.searchResults = [result];
      expect(component.entityType(result)).toBe('savings');
      expect(component.displayLookupResult(result)).toContain('77');
      component.selectLookupResult(result);
      expect(baseTellerService.getDepositSavingsAccount).toHaveBeenCalledWith(77);
      expect(component.selectedSavingsAccount?.id).toBe(77);
    });

    it('clears the search without restoring a pending customer or account', () => {
      const pending = new Subject<DepositClientAccounts>();
      baseTellerService.getDepositClientAccounts.mockReturnValueOnce(pending);
      lookup();
      const input = fixture.nativeElement.querySelector('input[formControlName="search"]');
      component.changeCustomer(input);
      pending.next({ savingsAccounts: [activeSavingsAccount] });
      pending.complete();
      expect(component.customer).toBeNull();
      expect(component.savingsAccounts).toEqual([]);
      expect(component.selectedSavingsAccount).toBeNull();
      expect(document.activeElement).toBe(input);
    });

    it('shows no results for an empty successful search', () => {
      jest.useFakeTimers();
      component.lookupForm.controls.search.setValue('Nobody');
      jest.advanceTimersByTime(300);
      expect(component.hasSearched).toBe(true);
      expect(component.searchResults).toEqual([]);
      expect(component.isSearching).toBe(false);
    });

    it('recovers after a search failure without terminating the lookup stream', () => {
      jest.useFakeTimers();
      baseTellerService.searchDepositCustomersAndAccounts.mockReturnValueOnce(throwError(() => new Error('offline')));
      component.lookupForm.controls.search.setValue('Nobody');
      jest.advanceTimersByTime(300);
      expect(component.errorMessage).toBe('offline');
      expect(component.isSearching).toBe(false);
      component.lookupForm.controls.search.setValue('Amina');
      jest.advanceTimersByTime(300);
      expect(baseTellerService.searchDepositCustomersAndAccounts).toHaveBeenCalledTimes(2);
      expect(component.errorMessage).toBe('');
    });

    it('ignores unsupported search resources', () => {
      jest.useFakeTimers();
      baseTellerService.searchDepositCustomersAndAccounts.mockReturnValueOnce(
        of([{ entityId: 1, entityType: 'LOAN' }])
      );
      component.lookupForm.controls.search.setValue('Loan');
      jest.advanceTimersByTime(300);
      expect(component.searchResults).toEqual([]);
      component.selectLookupResult({ entityId: 1, entityType: 'LOAN' });
      expect(baseTellerService.getDepositClient).not.toHaveBeenCalled();
    });

    it('loads authoritative customer name, identifier, phone, branch and status without a verified badge', () => {
      baseTellerService.getDepositClient.mockReturnValueOnce(
        of({
          id: 10,
          accountNo: 'CL-10',
          displayName: 'Amina Doe',
          mobileNo: '000-0010',
          officeName: 'Test branch',
          active: true,
          status: { value: 'Active' }
        })
      );
      lookup();
      render();
      const card = fixture.nativeElement.querySelector('.customer-card');
      for (const text of [
        'Amina Doe',
        'CL-10',
        '000-0010',
        'Test branch',
        'Active'
      ]) expect(card.textContent).toContain(text);
      expect(card.textContent).not.toMatch(/verified|verificada/i);
      expect(component.customerInitials).toBe('AD');
    });

    it('omits absent customer metadata and displays an authoritative inactive status', () => {
      baseTellerService.getDepositClient.mockReturnValueOnce(
        of({ id: 10, displayName: 'Amina Doe', active: false, status: { value: 'Inactive' } })
      );
      lookup();
      render();
      const card = fixture.nativeElement.querySelector('.customer-card');
      expect(card.textContent).toContain('Inactive');
      expect(card.textContent).not.toContain('labels.inputs.Phone');
      expect(card.textContent).not.toContain('labels.inputs.Office');
    });

    it('does not use account-result text as a customer identity and loads direct account ownership once', () => {
      component.lookupForm.controls.search.setValue({ entityId: 77, entityType: 'SAVINGS' });
      component.selectLookupResult({ entityId: 77, entityType: 'SAVINGS', entityName: 'Untrusted name' });
      expect(baseTellerService.getDepositClient).toHaveBeenCalledWith(10);
      expect(baseTellerService.getDepositClientAccounts).toHaveBeenCalledWith(10);
      expect(baseTellerService.getDepositSavingsAccount).toHaveBeenCalledTimes(1);
      expect(component.customerName).toBe('Amina Doe');
      expect(component.selectedSavingsAccount?.id).toBe(77);
      expect(component.selectionReady).toBe(true);
    });

    it('rejects a direct account without an authoritative client ID', () => {
      baseTellerService.getDepositSavingsAccount.mockReturnValueOnce(
        of({ ...activeSavingsAccount, clientId: undefined })
      );
      component.selectLookupResult({ entityId: 77, entityType: 'SAVINGS' });
      expect(component.selectedSavingsAccount).toBeNull();
      expect(baseTellerService.getDepositClient).not.toHaveBeenCalled();
      expect(baseTellerService.getSavingsDepositTemplate).not.toHaveBeenCalled();
    });

    it('rejects a direct account absent from the authoritative customer account list', () => {
      baseTellerService.getDepositClientAccounts.mockReturnValueOnce(of({ savingsAccounts: [] }));
      component.selectLookupResult({ entityId: 77, entityType: 'SAVINGS' });
      expect(component.selectedSavingsAccount).toBeNull();
      expect(baseTellerService.getSavingsDepositTemplate).not.toHaveBeenCalled();
    });

    it('does not confirm a customer when their profile cannot be retrieved', () => {
      baseTellerService.getDepositClient.mockReturnValueOnce(throwError(() => new Error('forbidden')));
      lookup();
      expect(component.customer).toBeNull();
      expect(component.savingsAccounts).toEqual([]);
      expect(component.selectionReady).toBe(false);
    });

    it('ignores customer account responses after another customer is selected', () => {
      const first = new Subject<DepositClientAccounts>();
      baseTellerService.getDepositClientAccounts
        .mockReturnValueOnce(first)
        .mockReturnValueOnce(of({ savingsAccounts: [] }));
      baseTellerService.getDepositClient
        .mockReturnValueOnce(of({ id: 10, displayName: 'Amina Doe' }))
        .mockReturnValueOnce(of({ id: 20, displayName: 'Other test customer' }));
      lookup();
      component.selectLookupResult({ entityId: 20, entityType: 'CLIENT' });
      first.next({ savingsAccounts: [activeSavingsAccount] });
      first.complete();
      expect(component.customer?.id).toBe(20);
      expect(component.savingsAccounts).toEqual([]);
      expect(component.selectedSavingsAccount).toBeNull();
    });

    it('hides the workflow from a user without deposit permission', () => {
      const previous = environment.productionModeEnableRBAC;
      environment.productionModeEnableRBAC = true;
      jest
        .spyOn(TestBed.inject(AuthenticationService), 'getCredentials')
        .mockReturnValue({ permissions: ['ALL_FUNCTIONS_READ'] } as ReturnType<
          AuthenticationService['getCredentials']
        >);
      const denied = TestBed.createComponent(SavingsAccountDepositComponent);
      try {
        denied.detectChanges();
        expect(denied.componentInstance.canAccessWorkflow).toBe(false);
        expect(denied.nativeElement.querySelector('input[formControlName="search"]')).toBeNull();
        expect(baseTellerService.searchDepositCustomersAndAccounts).not.toHaveBeenCalled();
      } finally {
        denied.destroy();
        environment.productionModeEnableRBAC = previous;
      }
    });

    it('retains inactive accounts as disabled cards alongside eligible accounts', () => {
      const inactive = { ...activeSavingsAccount, id: 99, status: { active: false, value: 'Closed' } };
      baseTellerService.getDepositClientAccounts.mockReturnValueOnce(
        of({ savingsAccounts: [
            activeSavingsAccount,
            inactive
          ] })
      );
      lookup();
      render();
      expect(fixture.nativeElement.querySelectorAll('.account-card')).toHaveLength(2);
      expect(fixture.nativeElement.querySelectorAll('input[type="radio"]')[1].disabled).toBe(true);
      component.selectAccount(inactive);
      expect(component.selectedSavingsAccount).toBeNull();
      expect(baseTellerService.getSavingsDepositTemplate).not.toHaveBeenCalled();
    });

    it('updates the existing form control, selected radio and footer without requiring Step 2', () => {
      lookup();
      component.selectAccount(activeSavingsAccount);
      render();
      expect(component.lookupForm.controls.savingsAccount.value).toEqual(activeSavingsAccount);
      expect(fixture.nativeElement.querySelector('input[type="radio"]').checked).toBe(true);
      expect(fixture.nativeElement.querySelector('.destination-summary').textContent).toContain('SA-77');
      expect(component.depositForm.valid).toBe(false);
      expect(component.selectionReady).toBe(true);
      expect(baseTellerService.getSavingsDepositTemplate).toHaveBeenCalledWith(77);
      const stepper: MatStepper = fixture.debugElement.query(By.directive(MatStepper)).componentInstance;
      stepper.next();
      expect(stepper.selectedIndex).toBe(1);
      expect(baseTellerService.depositToSavingsAccount).not.toHaveBeenCalled();
    });

    it.each([
      [
        'Closed',
        'Closed'
      ],
      [
        { value: 'Frozen' },
        'Frozen'
      ],
      [
        { active: true },
        'labels.status.Active'
      ],
      [
        undefined,
        'depositSelection.ineligible'
      ]
    ] as const)('displays the status representation %p accurately', (status, label) => {
      const account: DepositSavingsAccount = { ...activeSavingsAccount, status };
      expect(component.accountStatusLabel(account)).toBe(label);
      if (typeof status === 'string') expect(component.isActiveSavingsAccount(account)).toBe(false);
    });

    it('renders a string account status on its disabled card', () => {
      baseTellerService.getDepositClientAccounts.mockReturnValueOnce(
        of({ savingsAccounts: [{ ...activeSavingsAccount, status: 'Closed' }] })
      );
      lookup();
      render();
      expect(fixture.nativeElement.querySelector('.account-card .status-badge').textContent.trim()).toBe('Closed');
      expect(fixture.nativeElement.querySelector('input[type="radio"]').disabled).toBe(true);
    });

    it('distinguishes available balance, account balance, zero and absent amounts', () => {
      expect(component.balanceLabel(activeSavingsAccount)).toBe('labels.inputs.Account Balance');
      const available = { ...activeSavingsAccount, summary: { availableBalance: 0, accountBalance: 120 } };
      expect(component.balanceLabel(available)).toBe('labels.inputs.Available Balance');
      expect(component.accountBalance(available)).toBe(0);
      expect(component.accountBalance({ accountBalance: 9 })).toBe(9);
      expect(component.accountBalance({})).toBeNull();
    });

    it.each([
      { code: 'JPY', decimalPlaces: 0, expected: '¥1,234' },
      { code: 'KWD', decimalPlaces: 3, expected: '1,234.125' }
    ])('formats actual $code currency precision', ({ code, decimalPlaces, expected }) => {
      const formatted = component.formatMoney(1234.125, { currency: { code, decimalPlaces } });
      expect(formatted).toContain(expected);
    });

    it('shows optional account details including zero minimum balance and zero annual interest', () => {
      baseTellerService.getDepositSavingsAccount.mockReturnValueOnce(
        of({ ...activeSavingsAccount, timeline: { activatedOnDate: [
              2021,
              2,
              12
            ] }, nominalAnnualInterestRate: 0, minRequiredBalance: 0 })
      );
      lookup();
      component.selectAccount(activeSavingsAccount);
      render();
      const panel = fixture.nativeElement.querySelector('.account-details');
      expect(panel.textContent).toContain('2021');
      expect(panel.textContent).toContain('0%');
      expect(panel.textContent).toContain('$0.00');
    });

    it('omits missing account details rather than fabricating values', () => {
      lookup();
      component.selectAccount(activeSavingsAccount);
      render();
      const panel = fixture.nativeElement.querySelector('.account-details');
      expect(panel.textContent).not.toContain('labels.inputs.Opening Date');
      expect(panel.textContent).not.toContain('labels.inputs.Minimum Balance');
      expect(panel.textContent).toContain('depositSelection.historyUnavailable');
    });

    it('keeps history/detail failures separate from account eligibility and template validity', () => {
      baseTellerService.getDepositSavingsAccount.mockReturnValueOnce(
        throwError(() => new Error('history unavailable'))
      );
      lookup();
      component.selectAccount(activeSavingsAccount);
      expect(component.accountDetailsUnavailable).toBe(true);
      expect(component.selectionReady).toBe(true);
      expect(component.selectedSavingsAccount?.id).toBe(77);
    });

    it('orders real transactions by date then ID, limits to three and uses metadata for direction', () => {
      component.selectedSavingsAccount = {
        ...activeSavingsAccount,
        transactions: [
          { id: 1, date: [
              2026,
              11,
              1
            ], amount: 9, transactionType: { deposit: true, value: 'Deposit' } },
          { id: 2, date: [
              2026,
              11,
              3
            ], amount: 8, transactionType: { withdrawal: true, value: 'Withdrawal' } },
          { id: 3, date: [
              2026,
              11,
              2
            ], amount: 7, transactionType: { interestPosting: true, value: 'Interest posting' } },
          { id: 4, date: [
              2026,
              11,
              3
            ], amount: 6, entryType: 'DEBIT', transactionType: { value: 'Tax' } }
        ]
      };
      expect(component.recentTransactions.map((t) => t.id)).toEqual([
        4,
        2,
        3
      ]);
      expect(component.recentTransactions.map((t) => component.transactionDirection(t))).toEqual([
        '−',
        '−',
        '+'
      ]);
      expect(component.transactionDirection({ id: 5, amount: 123 })).toBe('');
      expect(component.transactionDirection({ id: 6, reversed: true, transactionType: { deposit: true } })).toBe('');
      expect(component.transactionDirection({ id: 7, isReversal: true, entryType: 'CREDIT' })).toBe('');
    });

    it('discards stale detail responses and caches details only within the confirmed customer', () => {
      const second = twoAccounts();
      const firstDetails = new Subject<DepositSavingsAccount>();
      baseTellerService.getDepositSavingsAccount.mockReturnValueOnce(firstDetails);
      component.selectAccount(activeSavingsAccount);
      component.selectAccount(second);
      firstDetails.next({ ...activeSavingsAccount, summary: { accountBalance: 999 } });
      firstDetails.complete();
      expect(component.selectedSavingsAccount?.id).toBe(88);
      expect(component.accountBalance(component.selectedSavingsAccount!)).toBe(120);
      component.selectAccount(activeSavingsAccount);
      component.selectAccount(second);
      expect(baseTellerService.getDepositSavingsAccount.mock.calls.filter(([id]) => id === 88)).toHaveLength(1);
    });

    it('clears old payment options and ignores stale template responses when switching accounts', () => {
      const second = twoAccounts();
      const firstTemplate = new Subject<{ paymentTypeOptions: { id: number; isCashPayment: boolean }[] }>();
      const secondTemplate = new Subject<{ paymentTypeOptions: { id: number; isCashPayment: boolean }[] }>();
      baseTellerService.getSavingsDepositTemplate
        .mockReturnValueOnce(firstTemplate)
        .mockReturnValueOnce(secondTemplate);
      component.selectAccount(activeSavingsAccount);
      expect(component.selectionReady).toBe(false);
      component.selectAccount(second);
      expect(component.paymentTypeOptions).toEqual([]);
      firstTemplate.next({ paymentTypeOptions: [{ id: 99, isCashPayment: true }] });
      firstTemplate.complete();
      expect(component.paymentTypeOptions).toEqual([]);
      secondTemplate.next({ paymentTypeOptions: [{ id: 3, isCashPayment: true }] });
      secondTemplate.complete();
      expect(component.paymentTypeOptions.map((t) => t.id)).toEqual([3]);
      expect(component.selectionReady).toBe(true);
    });

    it('prevents step-header navigation until the required deposit template completes', () => {
      const template = new Subject<{ paymentTypeOptions: { id: number; isCashPayment: boolean }[] }>();
      baseTellerService.getSavingsDepositTemplate.mockReturnValueOnce(template);
      lookup();
      component.selectAccount(activeSavingsAccount);
      const stepper: MatStepper = fixture.debugElement.query(By.directive(MatStepper)).componentInstance;
      stepper.next();
      expect(stepper.selectedIndex).toBe(0);
      template.next({ paymentTypeOptions: [{ id: 1, isCashPayment: true }] });
      template.complete();
      stepper.next();
      expect(stepper.selectedIndex).toBe(1);
    });

    it('allows navigation while optional details remain pending after the required template completes', () => {
      const details = new Subject<DepositSavingsAccount>();
      baseTellerService.getDepositSavingsAccount.mockReturnValueOnce(details);
      lookup();
      component.selectAccount(activeSavingsAccount);
      expect(details.observed).toBe(true);
      expect(component.isLoadingDetails).toBe(true);
      expect(component.lookupForm.controls.savingsAccount.valid).toBe(true);
      expect(component.selectionReady).toBe(true);
      const stepper: MatStepper = fixture.debugElement.query(By.directive(MatStepper)).componentInstance;
      stepper.next();
      expect(stepper.selectedIndex).toBe(1);
      details.next({
        id: 77,
        clientId: 10,
        status: { active: false, value: 'Closed' },
        summary: { accountBalance: 9 }
      });
      details.complete();
      expect(component.selectionReady).toBe(false);
      expect(component.lookupForm.valid).toBe(false);
      expect(component.selectedSavingsAccount?.productName).toBe('Voluntary Savings');
      expect(component.accountBalance(component.selectedSavingsAccount!)).toBe(9);
    });

    it('preserves known destination names and account numbers without restoring stale financial fields', () => {
      baseTellerService.getDepositSavingsAccount.mockReturnValueOnce(
        of({
          id: 77,
          clientId: 10,
          currency: { code: 'JPY', decimalPlaces: 0 },
          status: { active: true },
          accountBalance: 9
        })
      );
      lookup();
      component.selectAccount(activeSavingsAccount);
      render();
      expect(component.selectedSavingsAccount).toEqual({
        id: 77,
        clientId: 10,
        currency: { code: 'JPY', decimalPlaces: 0 },
        status: { active: true },
        accountBalance: 9,
        productName: 'Voluntary Savings',
        accountNo: 'SA-77'
      });
      expect(fixture.nativeElement.querySelector('.destination-summary').textContent).toContain('Voluntary Savings');
      expect(fixture.nativeElement.querySelector('.destination-summary').textContent).toContain('SA-77');
      expect(component.balanceLabel(component.selectedSavingsAccount!)).toBe('labels.inputs.Account Balance');
    });

    it.each([
      'submitting',
      'confirmed'
    ])('does not let a late optional detail response change a %s deposit destination', (phase) => {
      const details = new Subject<DepositSavingsAccount>();
      baseTellerService.getDepositSavingsAccount.mockReturnValueOnce(details);
      if (phase === 'submitting')
        baseTellerService.depositToSavingsAccount.mockReturnValueOnce(new Subject<SavingsDepositCommandResult>());
      makeFormsValid();
      component.submit();
      const receipt = component.receipt;
      details.next({ id: 77, clientId: 999, status: { active: false, value: 'Closed' } });
      details.complete();
      expect(component.selectedSavingsAccount?.id).toBe(77);
      expect(component.selectedSavingsAccount?.clientId).toBe(10);
      expect(component.lookupForm.valid).toBe(true);
      expect(component.receipt).toBe(receipt);
      expect(baseTellerService.depositToSavingsAccount).toHaveBeenCalledTimes(1);
    });

    it('fails closed when selected account details belong to another customer', () => {
      baseTellerService.getDepositSavingsAccount.mockReturnValueOnce(of({ ...activeSavingsAccount, clientId: 999 }));
      lookup();
      component.selectAccount(activeSavingsAccount);
      expect(component.selectedSavingsAccount).toBeNull();
      expect(component.lookupForm.valid).toBe(false);
      expect(component.paymentTypeOptions).toEqual([]);
      expect(baseTellerService.getSavingsDepositTemplate).not.toHaveBeenCalled();
    });

    it('revalidates authoritative inactive account details before enabling navigation', () => {
      baseTellerService.getDepositSavingsAccount.mockReturnValueOnce(
        of({ ...activeSavingsAccount, status: { active: false, value: 'Closed' } })
      );
      lookup();
      component.selectAccount(activeSavingsAccount);
      expect(component.selectionReady).toBe(false);
      expect(component.lookupForm.valid).toBe(false);
    });

    it('allows safe retry of a failed required template', () => {
      baseTellerService.getSavingsDepositTemplate.mockReturnValueOnce(throwError(() => new Error('offline')));
      lookup();
      component.selectAccount(activeSavingsAccount);
      expect(component.selectionReady).toBe(false);
      expect(component.paymentTypeOptions).toEqual([]);
      component.retrySelection();
      expect(component.selectionReady).toBe(true);
      expect(baseTellerService.getDepositSavingsAccount).toHaveBeenCalledTimes(1);
    });

    it('preserves valid selection and avoids repeated account GETs on back navigation', () => {
      lookup();
      component.selectAccount(activeSavingsAccount);
      const stepper: MatStepper = fixture.debugElement.query(By.directive(MatStepper)).componentInstance;
      stepper.next();
      stepper.previous();
      component.selectAccount(activeSavingsAccount);
      expect(component.selectedSavingsAccount?.id).toBe(77);
      expect(baseTellerService.getDepositSavingsAccount).toHaveBeenCalledTimes(1);
      expect(baseTellerService.getSavingsDepositTemplate).toHaveBeenCalledTimes(1);
    });

    it.each([
      'CASH',
      'CHECK'
    ] as const)('starts a fresh deposit after a completed %s deposit without resubmitting', (depositType) => {
      makeFormsValid();
      component.depositForm.patchValue({
        depositType,
        accountNumber: 'OLD-ACCOUNT',
        checkNumber: 'OLD-CHECK',
        routingCode: 'OLD-ROUTE',
        bankNumber: 'OLD-BANK',
        note: 'Previous deposit note',
        paymentTypeId: depositType === 'CHECK' ? 2 : 1
      });
      const oldReceiptNumber = component.depositForm.controls.receiptNumber.value;
      const stepper: MatStepper = fixture.debugElement.query(By.directive(MatStepper)).componentInstance;
      stepper.next();
      stepper.next();
      component.submit();
      render();
      expect(stepper.selectedIndex).toBe(2);
      const action = Array.from(fixture.nativeElement.querySelectorAll('button')).find((button: HTMLButtonElement) =>
        button.textContent?.includes('depositSelection.newDeposit')
      ) as HTMLButtonElement;
      expect(action).toBeDefined();
      action.click();
      render();
      expect(stepper.selectedIndex).toBe(0);
      expect(stepper.steps.get(0)?.interacted).toBe(false);
      expect(stepper.steps.get(1)?.interacted).toBe(false);
      expect(component.commandResult).toBeUndefined();
      expect(component.receipt).toBeUndefined();
      expect(component.customer).toBeNull();
      expect(component.selectedSavingsAccount).toBeNull();
      expect(component.paymentTypeOptions).toEqual([]);
      expect(component.lookupForm.getRawValue()).toEqual({ search: '', savingsAccount: '' });
      expect(component.depositForm.getRawValue()).toEqual({
        depositType: 'CASH',
        transactionDate: businessDate,
        transactionAmount: null,
        paymentTypeId: '',
        accountNumber: '',
        checkNumber: '',
        routingCode: '',
        receiptNumber: expect.any(String),
        bankNumber: '',
        note: 'DEPOSITO EN VENTANILLA',
        denominations: [{ denomination: '', quantity: 1 }]
      });
      expect(component.depositForm.controls.receiptNumber.value).not.toBe(oldReceiptNumber);
      expect(component.depositForm.controls.receiptNumber.value).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      );
      expect(component.depositForm.controls.checkNumber.valid).toBe(true);
      expect(component.depositForm.pristine).toBe(true);
      expect(component.selectionReady).toBe(false);
      expect(baseTellerService.depositToSavingsAccount).toHaveBeenCalledTimes(1);
    });

    it('refreshes both the transaction date and maximum date from one business-date read for a new deposit', () => {
      makeFormsValid();
      component.submit();
      const nextBusinessDate = new Date(2026, 8, 17);
      const getBusinessDate = jest.fn(() => nextBusinessDate);
      Object.defineProperty(TestBed.inject(SettingsService), 'businessDate', {
        configurable: true,
        get: getBusinessDate
      });
      const stepper: MatStepper = fixture.debugElement.query(By.directive(MatStepper)).componentInstance;
      component.startNewDeposit(stepper, fixture.nativeElement.querySelector('input[formControlName="search"]'));
      render();
      expect(getBusinessDate).toHaveBeenCalledTimes(1);
      expect(component.maxDate).toBe(nextBusinessDate);
      expect(component.depositForm.controls.transactionDate.value).toBe(nextBusinessDate);
      expect(component.depositForm.controls.transactionDate.hasError('matDatepickerMax')).toBe(false);
    });

    it('shows a single workflow live alert when Preview submission fails', () => {
      makeFormsValid();
      const stepper: MatStepper = fixture.debugElement.query(By.directive(MatStepper)).componentInstance;
      stepper.next();
      stepper.next();
      baseTellerService.depositToSavingsAccount.mockReturnValueOnce(
        throwError(() => ({ status: 400, error: { defaultUserMessage: 'Synthetic deposit rejected' } }))
      );
      component.submit();
      render();
      const alerts = fixture.nativeElement.querySelectorAll('[role="alert"]');
      expect(alerts).toHaveLength(1);
      expect(alerts[0].textContent.trim()).toBe('Synthetic deposit rejected');
    });

    it('ignores a pending receipt response after explicitly starting a new deposit', () => {
      makeFormsValid();
      const pending = new Subject<SavingsDepositReceipt>();
      baseTellerService.getSavingsDepositReceipt.mockReturnValueOnce(pending);
      component.submit();
      const stepper: MatStepper = fixture.debugElement.query(By.directive(MatStepper)).componentInstance;
      component.startNewDeposit(stepper, fixture.nativeElement.querySelector('input[formControlName="search"]'));
      const receiptNumber = component.depositForm.controls.receiptNumber.value;
      pending.next({ id: 101, paymentDetailData: { receiptNumber: 'OLD-RECEIPT' } });
      pending.complete();
      expect(component.receipt).toBeUndefined();
      expect(component.commandResult).toBeUndefined();
      expect(component.depositForm.controls.receiptNumber.value).toBe(receiptNumber);
    });

    it('only allows New Deposit after a successful command and outside submission', () => {
      const stepper: MatStepper = fixture.debugElement.query(By.directive(MatStepper)).componentInstance;
      const input = fixture.nativeElement.querySelector('input[formControlName="search"]');
      const receiptNumber = component.depositForm.controls.receiptNumber.value;
      component.startNewDeposit(stepper, input);
      expect(component.depositForm.controls.receiptNumber.value).toBe(receiptNumber);
      component.commandResult = { resourceId: 101 };
      component.isSubmitting = true;
      component.startNewDeposit(stepper, input);
      expect(component.commandResult).toEqual({ resourceId: 101 });
      expect(component.depositForm.controls.receiptNumber.value).toBe(receiptNumber);
    });

    it('blocks user destination changes after receipt confirmation and during submission', () => {
      const second = twoAccounts();
      component.selectAccount(activeSavingsAccount);
      component.isSubmitting = true;
      component.selectAccount(second);
      component.changeCustomer(fixture.nativeElement.querySelector('input'));
      expect(component.selectedSavingsAccount?.id).toBe(77);
      component.isSubmitting = false;
      component.commandResult = { resourceId: 101 };
      component.selectAccount(second);
      render();
      expect(component.selectedSavingsAccount?.id).toBe(77);
      expect(fixture.nativeElement.querySelector('input[type="radio"]').disabled).toBe(true);
    });
  });
  describe('WEB-1469 deposit details', () => {
    function selectMxn() {
      const account = { ...activeSavingsAccount, currency: { code: 'MXN', decimalPlaces: 2 } };
      baseTellerService.getDepositSavingsAccount.mockReturnValue(of(account));
      component.customer = { id: 10, displayName: 'Amina Doe' };
      component.savingsAccounts = [account];
      component.lookupForm.patchValue({ search: { entityId: 10 }, savingsAccount: account });
      component.depositForm.controls.transactionAmount.setValue(1000);
      return account;
    }

    it('starts with an empty amount, business date, default note and no false success', () => {
      expect(component.depositForm.controls.transactionAmount.value).toBeNull();
      expect(component.depositForm.controls.transactionDate.value).toBe(businessDate);
      expect(component.depositForm.controls.note.value).toBe('DEPOSITO EN VENTANILLA');
      expect(component.reconciliationState).toBe('neutral');
      expect(component.cashDenominationsReconcile).toBe(false);
    });

    it.each([
      0,
      -1,
      NaN,
      Infinity,
      1.001,
      'invalid',
      '1,000',
      ' 1 ',
      '0x10'
    ])('rejects invalid amount %p without rounding', (amount) => {
      makeFormsValid();
      component.depositForm.controls.transactionAmount.setValue(amount as number);
      expect(component.depositForm.controls.transactionAmount.invalid).toBe(true);
      expect(component.canContinueDetails).toBe(false);
    });

    it.each([
      0.01,
      1,
      1234.56
    ])('accepts valid positive amount %p', (amount) => {
      component.depositForm.controls.transactionAmount.setValue(amount);
      expect(component.depositForm.controls.transactionAmount.valid).toBe(true);
    });

    it.each([
      { code: 'JPY', decimalPlaces: 0, invalid: 1.1, valid: 1 },
      { code: 'KWD', decimalPlaces: 3, invalid: 1.0001, valid: 1.001 }
    ])('respects $code precision', ({ code, decimalPlaces, invalid, valid }) => {
      component.selectedSavingsAccount = { currency: { code, decimalPlaces } };
      component.depositForm.controls.transactionAmount.setValue(invalid);
      expect(component.depositForm.controls.transactionAmount.invalid).toBe(true);
      component.depositForm.controls.transactionAmount.setValue(valid);
      expect(component.depositForm.controls.transactionAmount.valid).toBe(true);
      expect(component.accountCurrencyCode()).toBe(code);
    });

    it('creates MXN shortcuts in the existing form array with zero quantities and renders both groups', () => {
      selectMxn();
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(component.denominations.getRawValue()).toEqual(
        [
          1000,
          500,
          200,
          100,
          50,
          20,
          10,
          5,
          2,
          1,
          0.5
        ].map((denomination) => ({ denomination, quantity: 0 }))
      );
      expect(fixture.nativeElement.querySelectorAll('.cash-group')).toHaveLength(2);
      expect(fixture.nativeElement.querySelectorAll('.cash-row')).toHaveLength(11);
      expect(fixture.nativeElement.querySelector('[formControlName="denomination"]')).toBeNull();
      expect(component.reconciliationState).toBe('missing');
    });

    it('retains editable manual denominations for other currencies', () => {
      makeFormsValid();
      expect(component.usesPresetDenominations).toBe(false);
      component.addDenomination();
      component.denominations.at(1).patchValue({ denomination: 5, quantity: 2 });
      expect(component.denominationTotal).toBe(60);
      component.removeDenomination(1);
      expect(component.denominationTotal).toBe(50);
    });

    it('increments, decrements and never goes below zero or above the quantity bound', () => {
      selectMxn();
      component.adjustQuantity(0, -1);
      expect(component.denominations.at(0).controls.quantity.value).toBe(0);
      component.adjustQuantity(0, 1);
      expect(component.denominationTotal).toBe(1000);
      component.adjustQuantity(0, -1);
      expect(component.denominationTotal).toBe(0);
      component.denominations.at(0).controls.quantity.setValue(component.maxQuantity);
      component.adjustQuantity(0, 1);
      expect(component.denominations.at(0).controls.quantity.value).toBe(component.maxQuantity);
    });

    it.each([
      -1,
      0.5,
      NaN,
      Infinity,
      1000001,
      '',
      null
    ])('rejects invalid quantity %p', (quantity) => {
      selectMxn();
      component.denominations.at(0).controls.quantity.setValue(quantity);
      expect(component.denominations.at(0).controls.quantity.invalid).toBe(true);
      expect(component.reconciliationState).toBe('invalid');
      expect(component.cashDenominationsReconcile).toBe(false);
      expect(Number.isFinite(component.denominationTotal)).toBe(true);
    });

    it('reconciles banknotes using exact scaled integer sums', () => {
      selectMxn();
      component.denominations.at(1).controls.quantity.setValue(1);
      component.denominations.at(2).controls.quantity.setValue(2);
      component.denominations.at(3).controls.quantity.setValue(1);
      expect(component.denominationTotal).toBe(1000);
      expect(component.selectedDenominationLineTotal(component.denominations.at(2))).toBe(400);
      expect(component.pieceCounts).toEqual({ banknotes: 4, coins: 0 });
      expect(component.reconciliationState).toBe('matched');
      expect(component.canContinueDetails).toBe(true);
    });

    it('handles fractional coins and decimal sums exactly', () => {
      selectMxn();
      component.depositForm.controls.transactionAmount.setValue(1);
      component.denominations.at(10).controls.quantity.setValue(2);
      expect(component.denominationTotal).toBe(1);
      expect(component.cashDenominationsReconcile).toBe(true);
      expect(component.pieceCounts).toEqual({ banknotes: 0, coins: 2 });
      makeFormsValid();
      component.selectedSavingsAccount = activeSavingsAccount;
      component.denominations.clear();
      component.addDenomination();
      component.denominations.at(0).patchValue({ denomination: 0.1, quantity: 3 });
      component.depositForm.controls.transactionAmount.setValue(0.3);
      expect(component.cashDenominationsReconcile).toBe(true);
    });

    it('rejects overflow instead of displaying a matched count', () => {
      makeFormsValid();
      component.denominations.at(0).patchValue({ denomination: 90071992547409, quantity: component.maxQuantity });
      expect(component.reconciliationState).toBe('invalid');
      expect(component.canContinueDetails).toBe(false);
    });

    it('reports the correct missing and excess differences', () => {
      selectMxn();
      component.denominations.at(1).controls.quantity.setValue(1);
      expect(component.reconciliationState).toBe('missing');
      expect(component.cashDifference).toBe(500);
      component.denominations.at(1).controls.quantity.setValue(3);
      expect(component.reconciliationState).toBe('excess');
      expect(component.cashDifference).toBe(500);
    });

    it('clear count only resets quantities', () => {
      selectMxn();
      component.depositForm.controls.note.setValue('Keep me');
      component.adjustQuantity(0, 1);
      const before = component.depositForm.getRawValue();
      const account = component.selectedSavingsAccount;
      component.clearCount();
      expect(component.depositForm.getRawValue()).toEqual({
        ...before,
        denominations: before.denominations.map((row) => ({ ...row, quantity: 0 }))
      });
      expect(component.selectedSavingsAccount).toBe(account);
      expect(component.reconciliationState).toBe('missing');
      expect(baseTellerService.depositToSavingsAccount).not.toHaveBeenCalled();
    });

    it('blocks Preview through both the Next button and step headers while mismatched', () => {
      makeFormsValid();
      const stepper: MatStepper = fixture.debugElement.query(By.directive(MatStepper)).componentInstance;
      stepper.next();
      component.depositForm.controls.transactionAmount.setValue(100);
      component.goToPreview(stepper);
      stepper.next();
      expect(stepper.selectedIndex).toBe(1);
      expect(component.depositForm.hasError('cashReconciliation')).toBe(true);
      component.denominations.at(0).controls.quantity.setValue(4);
      component.goToPreview(stepper);
      expect(stepper.selectedIndex).toBe(2);
      expect(baseTellerService.depositToSavingsAccount).not.toHaveBeenCalled();
    });

    it('preserves check details, notes, amount and receipt while toggling types', () => {
      makeFormsValid();
      const receipt = component.depositForm.controls.receiptNumber.value;
      component.depositForm.patchValue({
        depositType: 'CHECK',
        accountNumber: 'A',
        checkNumber: 'C',
        routingCode: 'R',
        bankNumber: 'B',
        note: 'N'
      });
      expect(component.denominations.disabled).toBe(true);
      expect(component.depositForm.controls.paymentTypeId.value).toBe('');
      component.depositForm.controls.paymentTypeId.setValue(2);
      expect(component.depositForm.valid).toBe(true);
      expect(component.cashDenominationsReconcile).toBe(true);
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.cash-count')).toBeNull();
      expect(fixture.nativeElement.querySelector('[formControlName="checkNumber"]')).not.toBeNull();
      component.depositForm.controls.depositType.setValue('CASH');
      expect(component.denominations.enabled).toBe(true);
      expect(component.depositForm.controls.checkNumber.value).toBe('C');
      expect(component.depositForm.controls.note.value).toBe('N');
      expect(component.depositForm.controls.transactionAmount.value).toBe(50);
      expect(component.depositForm.controls.receiptNumber.value).toBe(receipt);
    });

    it('does not offer an unsupported transfer option', () => {
      expect(fixture.nativeElement.querySelectorAll('mat-button-toggle')).toHaveLength(2);
      expect(fixture.nativeElement.querySelector('mat-button-toggle[value="TRANSFER"]')).toBeNull();
      makeFormsValid();
      component.depositForm.controls.depositType.setValue('TRANSFER' as 'CASH');
      expect(component.canContinueDetails).toBe(false);
      component.submit();
      expect(baseTellerService.depositToSavingsAccount).not.toHaveBeenCalled();
    });

    it('updates context and estimated balance from ledger balance, not available balance', () => {
      selectMxn();
      component.selectedSavingsAccount = {
        ...component.selectedSavingsAccount!,
        summary: { accountBalance: 120, availableBalance: 50 }
      };
      expect(component.currentBalance).toBe(120);
      expect(component.estimatedBalance).toBe(1120);
      component.depositForm.controls.transactionAmount.setValue(10.25);
      expect(component.estimatedBalance).toBe(130.25);
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      const context = fixture.nativeElement.querySelector('.deposit-context').textContent;
      expect(context).toContain('Amina Doe');
      expect(context).toContain('SA-77');
      expect(context).toContain('Voluntary Savings');
      const summary = fixture.nativeElement.querySelector('.deposit-summary').textContent;
      expect(summary).toContain('130.25');
      expect(summary).toContain('MXN');
      expect(summary).toContain('Cash Drawer');
      expect(summary).toContain('2026');
      expect(summary).toContain(component.depositForm.controls.receiptNumber.value);
      expect(summary).not.toContain('50,000');
    });

    it('does not fabricate a ledger balance or estimate when only available balance exists', () => {
      makeFormsValid();
      component.selectedSavingsAccount = { summary: { availableBalance: 90 } };
      expect(component.currentBalance).toBeNull();
      expect(component.estimatedBalance).toBeNull();
      component.selectedSavingsAccount = { accountBalance: 0, currency: { code: 'USD' } };
      expect(component.estimatedBalance).toBe(50);
      component.selectedSavingsAccount.accountBalance = -10;
      expect(component.estimatedBalance).toBe(40);
    });

    it('clears stale context and count when the destination changes', () => {
      selectMxn();
      component.adjustQuantity(0, 1);
      component.lookupForm.controls.search.setValue('Another customer');
      expect(component.selectedSavingsAccount).toBeNull();
      expect(component.currentBalance).toBeNull();
      expect(component.estimatedBalance).toBeNull();
      expect(component.usesPresetDenominations).toBe(false);
      expect(component.canContinueDetails).toBe(false);
    });

    it('revalidates precision when account details change the currency', () => {
      const pending = new Subject<DepositSavingsAccount>();
      baseTellerService.getDepositSavingsAccount.mockReturnValueOnce(pending);
      component.customer = { id: 10 };
      component.savingsAccounts = [activeSavingsAccount];
      component.lookupForm.patchValue({ search: { entityId: 10 }, savingsAccount: activeSavingsAccount });
      component.depositForm.controls.transactionAmount.setValue(1.25);
      pending.next({ ...activeSavingsAccount, currency: { code: 'JPY', decimalPlaces: 0 } });
      pending.complete();
      expect(component.depositForm.controls.transactionAmount.invalid).toBe(true);
      expect(component.canContinueDetails).toBe(false);
    });

    it('revalidates a retained CHECK payment after the new account template arrives', () => {
      makeFormsValid();
      component.depositForm.patchValue({
        depositType: 'CHECK',
        paymentTypeId: 2,
        accountNumber: 'A',
        checkNumber: 'C',
        routingCode: 'R',
        bankNumber: 'B'
      });
      expect(component.canContinueDetails).toBe(true);
      const receipt = component.depositForm.controls.receiptNumber.value;
      const second = { ...activeSavingsAccount, id: 88, accountNo: 'SA-88' };
      component.savingsAccounts.push(second);
      baseTellerService.getDepositSavingsAccount.mockReturnValueOnce(of(second));
      const template = new Subject<{ paymentTypeOptions: { id: number; isCashPayment: boolean }[] }>();
      baseTellerService.getSavingsDepositTemplate.mockReturnValueOnce(template);
      component.selectAccount(second);
      expect(component.depositForm.hasError('incompatiblePayment')).toBe(true);
      expect(component.canContinueDetails).toBe(false);
      template.next({ paymentTypeOptions: [{ id: 2, isCashPayment: false }] });
      template.complete();
      expect(component.depositForm.controls.paymentTypeId.value).toBe(2);
      expect(component.depositForm.hasError('incompatiblePayment')).toBe(false);
      expect(component.canContinueDetails).toBe(true);
      expect(component.depositForm.controls.receiptNumber.value).toBe(receipt);
      expect(baseTellerService.depositToSavingsAccount).not.toHaveBeenCalled();
    });

    it('renders editable custom MXN rows alongside presets and reconciles smaller coin values', () => {
      selectMxn();
      component.depositForm.controls.transactionAmount.setValue(1000.2);
      component.adjustQuantity(0, 1);
      component.addDenomination();
      component.denominations.at(11).patchValue({ denomination: 0.2, quantity: 1 });
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('input[formControlName="denomination"]')).toHaveLength(1);
      expect(fixture.nativeElement.querySelectorAll('.cash-row')).toHaveLength(12);
      expect(component.cashDenominationsReconcile).toBe(true);
      expect(component.canContinueDetails).toBe(true);
      expect(component.pieceCounts).toEqual({ banknotes: 1, coins: 0 });
      expect(fixture.nativeElement.querySelector('.reconciliation').textContent).not.toContain('depositDetails.pieces');
      expect(component.buildPayload()).not.toHaveProperty('denominations');
    });

    it('removes only custom MXN rows and recovers preset-only reconciliation', () => {
      selectMxn();
      component.adjustQuantity(0, 1);
      component.addDenomination();
      component.denominations.at(11).patchValue({ denomination: 0.01, quantity: 20 });
      expect(component.cashDenominationsReconcile).toBe(false);
      component.removeDenomination(0);
      expect(component.denominations.at(0).controls.denomination.value).toBe(1000);
      component.removeDenomination(11);
      expect(component.denominations.length).toBe(11);
      expect(component.cashDenominationsReconcile).toBe(true);
      expect(component.canContinueDetails).toBe(true);
    });
  });
  describe('WEB-1470 confirmation safety', () => {
    function renderPreview(): void {
      makeFormsValid();
      const stepper = fixture.debugElement.query(By.directive(MatStepper)).componentInstance as MatStepper;
      stepper.selectedIndex = 1;
      stepper.next();
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
    }

    it('opens Preview without a success message, receipt, ID or financial POST', () => {
      renderPreview();
      expect(fixture.nativeElement.querySelector('.preview-summary').textContent).toContain('SA-77');
      expect(fixture.nativeElement.querySelector('[data-testid="deposit-success"]')).toBeNull();
      expect(fixture.nativeElement.querySelector('.receipt')).toBeNull();
      expect(component.receiptView?.transactionId).toBeNull();
      expect(baseTellerService.depositToSavingsAccount).not.toHaveBeenCalled();
    });

    it.each([
      0,
      408,
      500,
      502,
      503,
      504
    ])('locks unknown outcome after HTTP %s without retrying or resetting the reference', (status) => {
      renderPreview();
      const reference = component.depositForm.controls.receiptNumber.value;
      baseTellerService.depositToSavingsAccount.mockReturnValueOnce(throwError(() => ({ status })));
      component.submit();
      fixture.detectChanges();
      expect(component.outcomeUncertain).toBe(true);
      expect(component.commandResult).toBeUndefined();
      expect(fixture.nativeElement.querySelector('[data-testid="deposit-success"]')).toBeNull();
      expect(fixture.nativeElement.querySelector('.receipt')).toBeNull();
      expect(fixture.nativeElement.querySelector('.uncertain').textContent).toContain(reference);
      component.submit();
      component.changeCustomer(fixture.nativeElement.querySelector('input[formControlName="search"]'));
      component.lookupForm.controls.search.setValue('Another customer');
      startAnotherDeposit();
      component.finish();
      expect(baseTellerService.depositToSavingsAccount).toHaveBeenCalledTimes(1);
      expect(component.selectedSavingsAccount?.id).toBe(77);
      expect(component.depositForm.controls.receiptNumber.value).toBe(reference);
    });

    it('does not treat an empty or maker-checker-only response as posted', () => {
      makeFormsValid();
      baseTellerService.depositToSavingsAccount.mockReturnValueOnce(of({ commandId: 9 }));
      component.submit();
      expect(component.outcomeUncertain).toBe(true);
      expect(component.commandResult).toBeUndefined();
      expect(baseTellerService.getSavingsDepositReceipt).not.toHaveBeenCalled();
    });

    it('keeps confirmed command state when the transaction ID is absent', () => {
      makeFormsValid();
      baseTellerService.depositToSavingsAccount.mockReturnValueOnce(of({ savingsId: 77 }));
      component.submit();
      expect(component.commandResult).toEqual({ savingsId: 77 });
      expect(component.receiptUnavailable).toBe(true);
      expect(component.receiptView?.transactionId).toBeNull();
      expect(baseTellerService.getSavingsDepositReceipt).not.toHaveBeenCalled();
      component.submit();
      expect(baseTellerService.depositToSavingsAccount).toHaveBeenCalledTimes(1);
    });

    it('retrieves missing receipt details without posting again', () => {
      makeFormsValid();
      baseTellerService.getSavingsDepositReceipt.mockReturnValueOnce(throwError(() => ({ status: 503 })));
      component.submit();
      expect(component.receiptUnavailable).toBe(true);
      expect(component.commandResult?.resourceId).toBe(101);
      component.retryReceipt();
      expect(component.receiptUnavailable).toBe(false);
      expect(component.receipt?.id).toBe(101);
      expect(baseTellerService.depositToSavingsAccount).toHaveBeenCalledTimes(1);
      expect(baseTellerService.getSavingsDepositReceipt).toHaveBeenCalledTimes(2);
    });

    it.each([
      { id: 102, accountId: 77 },
      { id: 101, accountId: 88 }
    ])('rejects mismatched receipt identity %j', (receipt) => {
      makeFormsValid();
      baseTellerService.getSavingsDepositReceipt.mockReturnValueOnce(of(receipt));
      component.submit();
      expect(component.receiptUnavailable).toBe(true);
      expect(component.receiptView?.transactionId).toBe('101');
      expect(component.receiptView?.resultingBalance).toBeNull();
    });

    it.each([
      { code: 'US' },
      { code: 'US', decimalPlaces: 0 },
      { code: 'US', decimalPlaces: 2 },
      { code: 'USD', decimalPlaces: 2 },
      undefined
    ])('renders the confirmed receipt with safe currency formatting for %j', (currency) => {
      renderPreview();
      baseTellerService.getSavingsDepositReceipt.mockReturnValueOnce(
        of({ id: 101, accountId: 77, amount: 50, currency })
      );
      component.submit();
      fixture.changeDetectorRef.markForCheck();
      expect(() => fixture.detectChanges()).not.toThrow();
      expect(component.receiptMoney(component.receiptView!.amount)).toBe('$50.00');
      expect(fixture.nativeElement.querySelector('[data-testid="deposit-success"]')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('.receipt').textContent).toContain('$50.00');
      expect(baseTellerService.depositToSavingsAccount).toHaveBeenCalledTimes(1);
    });

    it('retains the submitted context when forms are modified programmatically after confirmation', () => {
      makeFormsValid();
      component.submit();
      component.depositForm.patchValue({ transactionAmount: 999, note: 'Changed', depositType: 'CHECK' });
      component.customer = { id: 99, displayName: 'Other client' };
      expect(component.receiptView?.amount).toBe(50);
      expect(component.receiptView?.customer).toBe('Amina Doe');
      expect(component.receiptView?.depositType).toBe('CASH');
      expect(component.receiptView?.note).toBe('DEPOSITO EN VENTANILLA');
    });

    it('uses the existing print entry point only for a confirmed deposit', () => {
      const print = jest.spyOn(window, 'print').mockImplementation(() => undefined);
      component.printReceipt();
      expect(print).not.toHaveBeenCalled();
      makeFormsValid();
      component.submit();
      component.printReceipt();
      expect(print).toHaveBeenCalledTimes(1);
      expect(baseTellerService.depositToSavingsAccount).toHaveBeenCalledTimes(1);
      print.mockRestore();
    });

    it('exports genuine receipt fields and keeps financial state after PDF failure', async () => {
      makeFormsValid();
      const exporter = jest
        .spyOn(TestBed.inject(DepositReceiptExportService), 'download')
        .mockRejectedValueOnce(new Error('Canvas failure'));
      component.submit();
      const command = component.commandResult;
      await component.downloadReceiptPdf();
      expect(exporter).toHaveBeenCalledWith(
        'labels.heading.Payment Receipt',
        '$50.00 USD',
        expect.arrayContaining([
          { label: 'labels.inputs.Transaction Id', value: '101' },
          { label: 'labels.inputs.Receipt Number', value: 'RC-101' },
          { label: 'labels.inputs.Savings Account', value: 'SA-77' }
        ]),
        '101'
      );
      expect(component.pdfError).toBe(true);
      expect(component.isExportingPdf).toBe(false);
      expect(component.commandResult).toBe(command);
      expect(baseTellerService.depositToSavingsAccount).toHaveBeenCalledTimes(1);
      exporter.mockRestore();
    });

    it('prevents concurrent PDF requests and clears export state on completion', async () => {
      makeFormsValid();
      component.submit();
      let resolve!: () => void;
      const exporter = jest.spyOn(TestBed.inject(DepositReceiptExportService), 'download').mockImplementationOnce(
        () =>
          new Promise<void>((done) => {
            resolve = done;
          })
      );
      const pending = component.downloadReceiptPdf();
      await component.downloadReceiptPdf();
      expect(exporter).toHaveBeenCalledTimes(1);
      expect(component.isExportingPdf).toBe(true);
      startAnotherDeposit();
      expect(component.commandResult).toBeDefined();
      resolve();
      await pending;
      expect(component.isExportingPdf).toBe(false);
      exporter.mockRestore();
    });

    it('uses authoritative route IDs and finishes at the Base Teller without financial writes', () => {
      const navigate = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
      makeFormsValid();
      component.finish();
      expect(navigate).not.toHaveBeenCalled();
      component.submit();
      expect(component.accountRoute).toEqual([
        '/clients',
        10,
        'savings-accounts',
        77
      ]);
      expect(component.accountHistoryRoute).toEqual([
        '/clients',
        10,
        'savings-accounts',
        77,
        'transactions'
      ]);
      component.finish();
      expect(navigate).toHaveBeenCalledWith(['/organization/base-teller']);
      expect(baseTellerService.depositToSavingsAccount).toHaveBeenCalledTimes(1);
      navigate.mockRestore();
    });

    it('has no unsupported sharing or decorative barcode control', () => {
      makeFormsValid();
      component.submit();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[href^="mailto:"], .barcode, [aria-label="Email"]')).toBeNull();
    });
  });
  describe('review corrections', () => {
    it.each([
      'pending',
      'uncertain'
    ])('restores an unresolved %s submission after the route is destroyed', (phase) => {
      makeFormsValid();
      const pending = new Subject<SavingsDepositCommandResult>();
      baseTellerService.depositToSavingsAccount.mockReturnValueOnce(
        phase === 'pending' ? pending : throwError(() => ({ status: 0 }))
      );
      const reference = component.depositForm.controls.receiptNumber.value;
      component.submit();
      fixture.destroy();
      const returned = TestBed.createComponent(SavingsAccountDepositComponent);
      returned.detectChanges();
      const restored = returned.componentInstance;
      expect(restored.outcomeUncertain).toBe(true);
      expect(restored.workflowLocked).toBe(true);
      expect(restored.receiptView?.receiptNumber).toBe(reference);
      expect(restored.depositForm.controls.receiptNumber.value).toBe(reference);
      expect(returned.debugElement.query(By.directive(MatStepper)).componentInstance.selectedIndex).toBe(2);
      restored.submit();
      expect(baseTellerService.depositToSavingsAccount).toHaveBeenCalledTimes(1);
      returned.destroy();
    });

    it('refuses a financial POST when the original reference cannot be persisted', () => {
      makeFormsValid();
      const begin = jest.spyOn(TestBed.inject(DepositSubmissionStateService), 'begin').mockReturnValue(false);
      component.submit();
      expect(baseTellerService.depositToSavingsAccount).not.toHaveBeenCalled();
      expect(component.errorMessage).toBe('depositReceipt.storageUnavailable');
      begin.mockRestore();
    });

    it('only unlocks an uncertain submission after a matching receipt GET, without another POST', () => {
      makeFormsValid();
      const reference = component.depositForm.controls.receiptNumber.value!;
      baseTellerService.depositToSavingsAccount.mockReturnValueOnce(throwError(() => ({ status: 0 })));
      component.submit();
      component.recoveryTransactionId.setValue('101');
      component.verifyUncertainDeposit();
      expect(component.outcomeUncertain).toBe(true);
      expect(component.recoveryError).toBe('depositReceipt.recoveryMismatch');
      baseTellerService.getSavingsDepositReceipt.mockReturnValueOnce(
        of({ id: 101, accountId: 77, amount: 50, currency: { code: 'USD', decimalPlaces: 2 }, date: [
            2026,
            9,
            16
          ], entryType:
            'CREDIT', transactionType: { deposit: true }, reversed: false, paymentDetailData: { receiptNumber: reference } })
      );
      component.verifyUncertainDeposit();
      expect(component.outcomeUncertain).toBe(false);
      expect(component.commandResult?.resourceId).toBe(101);
      expect(TestBed.inject(DepositSubmissionStateService).pending).toBeNull();
      expect(baseTellerService.depositToSavingsAccount).toHaveBeenCalledTimes(1);
    });

    it('uses the history Undo permission, retaining the separate account read check', () => {
      const original = environment.productionModeEnableRBAC;
      const credentials = jest.spyOn(TestBed.inject(AuthenticationService), 'getCredentials');
      try {
        environment.productionModeEnableRBAC = true;
        credentials.mockReturnValue({ permissions: [
            'READ_SAVINGSACCOUNT',
            'ADJUSTTRANSACTION_SAVINGSACCOUNT'
          ] } as never);
        makeFormsValid();
        expect(component.canReviewReversal).toBe(true);
        expect(component.accountHistoryRoute).not.toBeNull();
        credentials.mockReturnValue({ permissions: ['ADJUSTTRANSACTION_SAVINGSACCOUNT'] } as never);
        expect(component.accountHistoryRoute).toBeNull();
        credentials.mockReturnValue({ permissions: [
            'READ_SAVINGSACCOUNT',
            'UNDOTRANSACTION_SAVINGSACCOUNT'
          ] } as never);
        expect(component.canReviewReversal).toBe(false);
      } finally {
        environment.productionModeEnableRBAC = original;
        credentials.mockRestore();
      }
    });

    it('keeps the ledger date separate from an offset-bearing time in every receipt output', () => {
      makeFormsValid();
      baseTellerService.getSavingsDepositReceipt.mockReturnValueOnce(
        of({ id: 101, date: [
            2026,
            11,
            11
          ], transactionTime: '00:30:00Z' })
      );
      component.submit();
      expect(component.receiptDate).toBe('Nov 11, 2026');
      expect(component.receiptTime).toBe('00:30:00Z');
      expect(component.receiptFields).toContainEqual({
        label: 'labels.inputs.Transaction Date',
        value: 'Nov 11, 2026'
      });
      expect(component.receiptFields).toContainEqual({ label: 'depositReceipt.transactionTime', value: '00:30:00Z' });
    });
  });
  describe('second review corrections', () => {
    it('blocks a financial POST if list and failed account details provide no currency, then persists retrieved currency', () => {
      makeFormsValid();
      component.selectedSavingsAccount = { ...activeSavingsAccount, currency: undefined };
      expect(component.depositCurrencyReady).toBe(false);
      expect(component.canContinueDetails).toBe(false);
      component.submit();
      expect(baseTellerService.depositToSavingsAccount).not.toHaveBeenCalled();
      expect(component.errorMessage).toBe('depositReceipt.currencyRequired');
      component.retryDepositCurrency();
      expect(component.depositCurrencyReady).toBe(true);
      component.denominations.at(0).patchValue({ denomination: 25, quantity: 2 });
      const pending = new Subject<SavingsDepositCommandResult>();
      baseTellerService.depositToSavingsAccount.mockReturnValueOnce(pending);
      component.submit();
      expect(baseTellerService.depositToSavingsAccount).toHaveBeenCalledTimes(1);
      expect(TestBed.inject(DepositSubmissionStateService).pending?.context?.account.currency).toEqual({
        code: 'USD',
        decimalPlaces: 2
      });
    });

    it.each([
      { date: undefined },
      { date: [
          2026,
          11,
          22
        ] }
    ])('labels confirmation details using date provenance %j', ({ date }) => {
      makeFormsValid();
      baseTellerService.getSavingsDepositReceipt.mockReturnValueOnce(of({ id: 101, date }));
      component.submit();
      fixture.detectChanges();
      const details = fixture.nativeElement.querySelector('.confirmation-details').textContent;
      expect(details).toContain(date ? 'labels.inputs.Transaction Date' : 'depositReceipt.requestDate');
    });

    it('records a checker non-posting decision before unlocking and never replays the deposit', () => {
      makeFormsValid();
      const reference = component.depositForm.controls.receiptNumber.value!;
      baseTellerService.depositToSavingsAccount.mockReturnValueOnce(throwError(() => ({ status: 0 })));
      component.submit();
      component.nonPostingForm.setValue({
        outcome: 'NOT_POSTED',
        reference,
        evidence: 'CASE-1470',
        reason: 'Bank operations independently confirmed the original request never reached posting.',
        acknowledged: true
      });
      component.recordNonPostingDecision();
      fixture.detectChanges();
      expect(savingsNotes.createSavingsNote).toHaveBeenCalledTimes(1);
      expect(component.recordedNonPosting).toMatchObject({ noteId: '501', reference, outcome: 'NOT_POSTED' });
      expect(component.commandResult).toBeUndefined();
      expect(fixture.nativeElement.querySelector('[data-testid="deposit-success"]')).toBeNull();
      expect(component.workflowLocked).toBe(true);
      expect(TestBed.inject(DepositSubmissionStateService).pending).toBeNull();
      startAnotherDeposit();
      expect(component.depositForm.controls.receiptNumber.value).not.toBe(reference);
      expect(component.recordedNonPosting).toBeUndefined();
      expect(baseTellerService.depositToSavingsAccount).toHaveBeenCalledTimes(1);
    });

    it('retains the original unresolved reference when decision-note persistence cannot be verified', () => {
      makeFormsValid();
      const reference = component.depositForm.controls.receiptNumber.value!;
      baseTellerService.depositToSavingsAccount.mockReturnValueOnce(throwError(() => ({ status: 0 })));
      component.submit();
      component.nonPostingForm.setValue({
        outcome: 'REJECTED',
        reference,
        evidence: 'CASE-1470',
        reason: 'The bank command review confirms the original request was definitively rejected.',
        acknowledged: true
      });
      savingsNotes.getSavingsNotes.mockImplementation(() => throwError(() => ({ status: 503 })));
      component.recordNonPostingDecision();
      expect(component.outcomeUncertain).toBe(true);
      expect(component.recordedNonPosting).toBeUndefined();
      expect(component.recoveryError).toBe('depositReceipt.nonPostingFailed');
      expect(TestBed.inject(DepositSubmissionStateService).pending?.context?.receiptReference).toBe(reference);
      expect(baseTellerService.depositToSavingsAccount).toHaveBeenCalledTimes(1);
    });
  });
});
