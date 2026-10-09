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
import { faArrowLeft, faArrowRight, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { of, Subject, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import {
  BaseTellerService,
  ReturnedCheckDetail,
  ReturnedCheckReceipt,
  ReturnedCheckSearchResult
} from '../base-teller.service';
import { ReturnedCheckPaymentComponent } from './returned-check-payment.component';

describe('ReturnedCheckPaymentComponent', () => {
  let component: ReturnedCheckPaymentComponent;
  let fixture: ComponentFixture<ReturnedCheckPaymentComponent>;
  let baseTellerService: jest.Mocked<BaseTellerService>;

  const businessDate = new Date(2026, 8, 16);
  const returnedCheck = {
    id: 99,
    depositId: 1,
    depositCheckDetailId: 2,
    originalReceiptNumber: 'DEP-1',
    checkType: 'PERSONAL',
    bank: 'Bank',
    checkNumber: 'CHK-99',
    clientId: 10,
    customerName: 'Ada Lovelace',
    amount: 100,
    currencyCode: 'USD',
    returnedOnDate: '2026-09-16',
    returnReason: 'Insufficient funds',
    status: 'RETURNED',
    tellerId: 7,
    officeId: 1,
    officeName: 'Head Office'
  } as ReturnedCheckDetail;
  const receipt = {
    receiptNumber: 'RCP-1',
    status: 'SETTLED',
    returnedCheckId: 99,
    depositCheckDetailId: 2,
    checkNumber: 'CHK-99',
    clientId: 10,
    customerName: 'Ada Lovelace',
    checkAmount: 100,
    cashReceived: 120,
    changeAmount: 20,
    currencyCode: 'USD',
    tellerId: 7,
    cashierId: 8,
    cashierTransactionId: 9,
    operatorId: 10,
    operatorName: 'cashier',
    officeId: 1,
    officeName: 'Head Office',
    createdOnUtc: '2026-09-16T10:00:00Z',
    completedOnUtc: '2026-09-16T10:01:00Z',
    denominations: [{ denominationId: '20', value: 20, quantity: 6 }]
  } as ReturnedCheckReceipt;

  beforeEach(async () => {
    baseTellerService = {
      getReturnedCheckTellers: jest.fn(() => of([{ id: 7, name: 'Main Teller' }])),
      getReturnedCheckCurrencies: jest.fn(() => of({ selectedCurrencyOptions: [{ id: 'USD', code: 'USD' }] })),
      getReturnedCheckPaymentTypes: jest.fn(() =>
        of([
          { id: 3, name: 'Cash', isCashPayment: true },
          { id: 4, name: 'Check', isCashPayment: false }
        ])
      ),
      searchReturnedChecks: jest.fn(() => of({ pageItems: [], totalFilteredRecords: 0 })),
      getReturnedCheck: jest.fn(() => of(returnedCheck)),
      settleReturnedCheck: jest.fn(() => of(receipt))
    } as unknown as jest.Mocked<BaseTellerService>;

    await TestBed.configureTestingModule({
      imports: [
        ReturnedCheckPaymentComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: BaseTellerService, useValue: baseTellerService },
        {
          provide: AuthenticationService,
          useValue: {
            getCredentials: jest.fn(() => ({
              permissions: [
                'READ_BASE_TELLER_RETURNED_CHECK_PAYMENT',
                'CREATE_BASE_TELLER_RETURNED_CHECK_PAYMENT'
              ]
            }))
          }
        },
        { provide: SettingsService, useValue: { businessDate, dateFormat: 'dd MMMM yyyy', language: { code: 'en' } } },
        {
          provide: Dates,
          useValue: {
            angularToMomentFormat: jest.fn((format: string) => format),
            getMomentLocale: jest.fn(() => 'en'),
            formatDate: jest.fn((date: Date, format: string) =>
              format === 'yyyy-MM-dd' ? '2026-09-16' : '16 September 2026'
            )
          }
        },
        provideNativeDateAdapter(),
        provideAnimationsAsync()
      ]
    }).compileComponents();

    TestBed.inject(FaIconLibrary).addIcons(faArrowLeft, faArrowRight, faPlus, faTrash);
    fixture = TestBed.createComponent(ReturnedCheckPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function setSearchFilters(): void {
    component.searchForm.patchValue({
      date: businessDate,
      customerName: 'Ada',
      tellerId: 7,
      currencyCode: 'USD'
    });
  }

  function selectAndFund(value: number = 20, quantity: number = 5): void {
    component.selectedCheck = returnedCheck;
    component.searchForm.controls.selectedCheckId.setValue(returnedCheck.id);
    component.denominations.at(0).patchValue({ value, quantity });
    component.paymentForm.controls.paymentTypeId.setValue(3);
  }

  it('requires all four search filters before searching', () => {
    component.search();
    expect(baseTellerService.searchReturnedChecks).not.toHaveBeenCalled();
    expect(component.searchForm.controls.customerName.hasError('required')).toBe(true);
  });

  it('renders search results and supports an empty result state', () => {
    setSearchFilters();
    const searchResult = returnedCheck as ReturnedCheckSearchResult;
    baseTellerService.searchReturnedChecks.mockReturnValueOnce(
      of({ pageItems: [searchResult], totalFilteredRecords: 1 })
    );
    component.search();
    expect(component.results).toEqual([searchResult]);

    baseTellerService.searchReturnedChecks.mockReturnValueOnce(of({ pageItems: [], totalFilteredRecords: 0 }));
    component.search();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('labels.text.No returned checks found');
  });

  it('loads and selects exactly one eligible returned check', () => {
    component.selectCheck(returnedCheck);
    expect(baseTellerService.getReturnedCheck).toHaveBeenCalledWith(99);
    expect(component.selectedCheck).toEqual(returnedCheck);
    expect(component.searchForm.controls.selectedCheckId.value).toBe(99);
  });

  it('ignores a stale detail response after a new search starts', () => {
    const detailResponse = new Subject<ReturnedCheckDetail>();
    baseTellerService.getReturnedCheck.mockReturnValueOnce(detailResponse);
    component.selectCheck(returnedCheck);
    expect(component.isLoadingDetail).toBe(true);

    setSearchFilters();
    component.search();
    detailResponse.next(returnedCheck);
    detailResponse.complete();

    expect(component.selectedCheck).toBeUndefined();
    expect(component.searchForm.controls.selectedCheckId.value).toBeNull();
    expect(component.isLoadingDetail).toBe(false);
  });

  it('maps backend statuses to translation keys', () => {
    expect(component.statusTranslationKey('RETURNED')).toBe('labels.inputs.Returned');
    expect(component.statusTranslationKey('SETTLED')).toBe('labels.inputs.Settled');
  });

  it('does not resubmit the search form when advancing after selection', () => {
    setSearchFilters();
    component.selectedCheck = returnedCheck;
    component.searchForm.controls.selectedCheckId.setValue(returnedCheck.id);
    const searchSpy = jest.spyOn(component, 'search');
    fixture.detectChanges();

    const nextButton = fixture.nativeElement.querySelector('button[matStepperNext]') as HTMLButtonElement;
    expect(nextButton.type).toBe('button');
    nextButton.click();

    expect(searchSpy).not.toHaveBeenCalled();
  });

  it('calculates denomination totals, exact cash, positive change, and insufficient cash safely', () => {
    selectAndFund(20, 5);
    expect(component.lineTotal(component.denominations.at(0))).toBe(100);
    expect(component.totalCashReceived).toBe(100);
    expect(component.changeAmount).toBe(0);
    expect(component.cashIsSufficient).toBe(true);

    component.denominations.at(0).patchValue({ value: 20, quantity: 6 });
    expect(component.changeAmount).toBe(20);
    expect(component.cashIsSufficient).toBe(true);

    component.denominations.at(0).patchValue({ value: 20, quantity: 4 });
    expect(component.changeAmount).toBe(-20);
    expect(component.cashIsSufficient).toBe(false);
  });

  it('rejects a fractional denomination quantity', () => {
    component.denominations.at(0).patchValue({ value: 20, quantity: 1.5 });
    expect(component.denominations.at(0).controls.quantity.hasError('pattern')).toBe(true);
    expect(() => component.totalCashReceived).not.toThrow();
    expect(() => component.lineTotal(component.denominations.at(0))).not.toThrow();
    expect(component.totalCashReceived).toBe(0);
  });

  it('builds the exact settlement DTO and filters payment types to cash', () => {
    selectAndFund(20, 6);
    expect(component.cashPaymentTypes.map((paymentType) => paymentType.id)).toEqual([3]);
    expect(component.buildPayload()).toMatchObject({
      locale: 'en',
      dateFormat: 'dd MMMM yyyy',
      transactionDate: '16 September 2026',
      cashReceived: 120,
      currencyCode: 'USD',
      paymentTypeId: 3,
      denominations: [{ denominationId: '20', value: 20, quantity: 6 }]
    });
  });

  it('prevents double submission while settlement is in flight', () => {
    const pending = new Subject<ReturnedCheckReceipt>();
    baseTellerService.settleReturnedCheck.mockReturnValueOnce(pending);
    selectAndFund();
    component.finalizePayment();
    component.finalizePayment();
    expect(baseTellerService.settleReturnedCheck).toHaveBeenCalledTimes(1);
    expect(component.isSubmitting).toBe(true);
    pending.next(receipt);
    pending.complete();
    expect(component.receipt).toEqual(receipt);
  });

  it('surfaces a failed settlement receipt without advancing to success', () => {
    const failedReceipt = {
      ...receipt,
      status: 'RETURNED' as const,
      failureMessage: 'Denomination mismatch.'
    };
    baseTellerService.settleReturnedCheck.mockReturnValueOnce(of(failedReceipt));
    selectAndFund();
    const nextSpy = jest.spyOn(component.stepper!, 'next');

    component.finalizePayment();

    expect(component.errorMessage).toBe('Denomination mismatch.');
    expect(component.receipt).toEqual(failedReceipt);
    expect(nextSpy).not.toHaveBeenCalled();
  });

  it.each([
    [
      400,
      'Returned check has already been settled.'
    ],
    [
      403,
      'You do not have permission.'
    ],
    [
      500,
      'Server failure.'
    ]
  ])('preserves backend errors for status %s', (status, message) => {
    baseTellerService.settleReturnedCheck.mockReturnValueOnce(
      throwError(() => ({ status, error: { defaultUserMessage: message } }))
    );
    selectAndFund();
    component.finalizePayment();
    expect(component.errorMessage).toBe(message);
    expect(component.receipt).toBeUndefined();
  });
});
