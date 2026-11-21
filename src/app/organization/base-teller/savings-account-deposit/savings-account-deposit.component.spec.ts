/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
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
import { SettingsService } from 'app/settings/settings.service';
import {
  BaseTellerService,
  DepositClientAccounts,
  DepositSavingsAccount,
  DepositSearchResult,
  SavingsDepositCommandResult,
  SavingsDepositReceipt
} from '../base-teller.service';
import { SavingsAccountDepositComponent } from './savings-account-deposit.component';

describe('SavingsAccountDepositComponent', () => {
  let component: SavingsAccountDepositComponent;
  let fixture: ComponentFixture<SavingsAccountDepositComponent>;
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

    const secondAccount = { ...activeSavingsAccount, id: 88, accountNo: 'SA-88' };
    component.savingsAccounts.push(secondAccount);
    baseTellerService.getDepositSavingsAccount.mockReturnValueOnce(of(secondAccount));
    baseTellerService.getSavingsDepositTemplate.mockReturnValueOnce(
      of({ paymentTypeOptions: [{ id: 1, name: 'Cash Drawer', isCashPayment: true }] })
    );
    component.lookupForm.controls.savingsAccount.setValue(secondAccount);
    expect(component.selectedSavingsAccount?.id).toBe(88);
    expect(component.lookupForm.controls.savingsAccount.value).toEqual(secondAccount);
    expect(component.lookupForm.valid).toBe(true);
    pendingReceipt.next({ id: 101, amount: 50, paymentDetailData: { receiptNumber: 'BACKEND-101' } });
    pendingReceipt.complete();

    expect(component.receipt).toBe(commandReceipt);
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
        transactionAmount: 0,
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
        throwError(() => ({ error: { defaultUserMessage: 'Synthetic deposit rejected' } }))
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
});
