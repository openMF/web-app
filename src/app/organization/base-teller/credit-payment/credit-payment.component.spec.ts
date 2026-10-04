/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { of, Subject, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { AuthenticationService } from 'app/core/authentication/authentication.service';
import {
  BaseTellerService,
  CreditPaymentContext,
  CreditPaymentLoan,
  CreditPaymentReceipt
} from '../base-teller.service';
import { CreditPaymentComponent } from './credit-payment.component';

describe('CreditPaymentComponent', () => {
  let component: CreditPaymentComponent;
  let fixture: ComponentFixture<CreditPaymentComponent>;
  let service: jest.Mocked<BaseTellerService>;

  const context: CreditPaymentContext = {
    businessDate: '2026-09-27',
    officeId: 1,
    tellerId: 2,
    cashierId: 3,
    denominations: [{ identifier: 'USD-10', currencyCode: 'USD', value: 10, type: 'BANKNOTE' }],
    banks: [{ id: 4, code: 'BANK', name: 'Test Bank' }],
    paymentTypes: [
      { id: 5, name: 'Cash', isCashPayment: true },
      { id: 6, name: 'Check', isCashPayment: false }
    ]
  };
  const customer = {
    clientId: 7,
    accountNo: 'C-7',
    displayName: 'Ada Lovelace',
    officeId: 1,
    officeName: 'Head Office',
    status: 'Active'
  };
  const loan: CreditPaymentLoan = {
    id: 8,
    accountNo: 'L-8',
    clientId: 7,
    clientName: 'Ada Lovelace',
    officeId: 1,
    status: 'loanStatusType.active',
    payable: true,
    currencyCode: 'USD',
    principalOutstanding: 80,
    interestOutstanding: 10,
    feeOutstanding: 5,
    penaltyOutstanding: 0,
    totalOutstanding: 95,
    principalOverdue: 20,
    interestOverdue: 2,
    feeOverdue: 0,
    penaltyOverdue: 0,
    totalOverdue: 22,
    repaymentSchedule: { periods: [{ period: 1, dueDate: [
            2026,
            10,
            1
          ], totalDueForPeriod: 20 }] },
    transactions: []
  };
  const pendingReceipt: CreditPaymentReceipt = {
    id: 9,
    receiptNumber: 'CP-1',
    status: 'PENDING_COLLECTION',
    paymentMethod: 'CHECK',
    clientId: 7,
    clientName: 'Ada Lovelace',
    loanId: 8,
    loanAccountNo: 'L-8',
    amount: 20,
    tenderAmount: 20,
    changeAmount: 0,
    currencyCode: 'USD',
    paymentTypeId: 6,
    businessDate: '2026-09-27',
    operatorId: 10,
    operatorName: 'teller',
    officeId: 1,
    tellerId: 2,
    cashierId: 3,
    createdOnUtc: '2026-09-27T10:00:00Z',
    denominations: [],
    check: {
      id: 11,
      bankId: 4,
      bankName: 'Test Bank',
      checkType: 'PERSONAL',
      checkNumber: '1001',
      classification: 'SUBJECT_TO_COLLECTION',
      status: 'PENDING_COLLECTION',
      acceptedBy: 10,
      acceptedOnUtc: '2026-09-27T10:00:00Z'
    }
  };

  beforeEach(async () => {
    service = {
      getCreditPaymentContext: jest.fn(() => of(context)),
      searchCreditPaymentCustomers: jest.fn(() => of([customer])),
      getCreditPaymentLoans: jest.fn(() => of([loan])),
      getCreditPaymentLoan: jest.fn(() => of(loan)),
      previewCreditPayment: jest.fn(() =>
        of({
          loanId: 8,
          paymentMethod: 'CASH',
          currencyCode: 'USD',
          businessDate: '2026-09-27',
          paymentAmount: 20,
          tenderAmount: 20,
          changeAmount: 0,
          principalOutstanding: 80,
          interestOutstanding: 10,
          feeOutstanding: 5,
          penaltyOutstanding: 0,
          denominations: [{ denominationId: 'USD-10', value: 10, quantity: 2 }],
          postsRepaymentOnConfirmation: true
        })
      ),
      createCreditPayment: jest.fn(() => of({ ...pendingReceipt, status: 'COMPLETED', paymentMethod: 'CASH' })),
      getCreditPaymentReceipt: jest.fn(() => of(pendingReceipt)),
      clearCreditPaymentCheck: jest.fn(() => of({ ...pendingReceipt, status: 'CLEARED' })),
      returnCreditPaymentCheck: jest.fn(() => of({ ...pendingReceipt, status: 'RETURNED' }))
    } as unknown as jest.Mocked<BaseTellerService>;

    await TestBed.configureTestingModule({
      imports: [
        CreditPaymentComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: BaseTellerService, useValue: service },
        {
          provide: AuthenticationService,
          useValue: {
            getCredentials: () => ({
              permissions: [
                'READ_BASE_TELLER_CREDIT_PAYMENT',
                'CREATE_BASE_TELLER_CREDIT_PAYMENT',
                'REPRINT_BASE_TELLER_CREDIT_PAYMENT',
                'RETURN_BASE_TELLER_CREDIT_PAYMENT_CHECK',
                'AUTHORIZE_BASE_TELLER_CHECK_CLEARING',
                'REPAYMENT_LOAN'
              ]
            })
          }
        },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({}) } } },
        { provide: Router, useValue: { navigate: jest.fn(() => Promise.resolve(true)) } },
        provideAnimationsAsync()
      ]
    }).compileComponents();

    TestBed.inject(FaIconLibrary).addIcons(faArrowLeft, faArrowRight);
    fixture = TestBed.createComponent(CreditPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function selectLoan(): void {
    component.selectCustomer(customer);
    component.selectLoan(loan);
  }

  it('loads backend context and searches customers', () => {
    component.customerForm.controls.search.setValue('Ada');
    component.searchCustomers();

    expect(service.getCreditPaymentContext).toHaveBeenCalledTimes(1);
    expect(service.searchCreditPaymentCustomers).toHaveBeenCalledWith('Ada');
    expect(component.customers).toEqual([customer]);
  });

  it('loads only backend-payable loans and renders authoritative balances', () => {
    service.getCreditPaymentLoans.mockReturnValue(
      of([
        { ...loan, id: 99, payable: false },
        loan
      ])
    );
    component.selectCustomer(customer);
    component.selectLoan(loan);

    expect(component.loans).toEqual([loan]);
    expect(component.selectedLoan?.totalOutstanding).toBe(95);
    expect(component.selectedLoan?.totalOverdue).toBe(22);
  });

  it('discards a stale loan list after the customer selection is reset', () => {
    const loansResponse = new Subject<CreditPaymentLoan[]>();
    service.getCreditPaymentLoans.mockReturnValue(loansResponse);
    component.selectCustomer(customer);

    component.customerForm.controls.search.setValue('Grace');
    component.searchCustomers();
    loansResponse.next([loan]);

    expect(component.selectedCustomer).toBeUndefined();
    expect(component.loans).toEqual([]);
  });

  it('discards stale loan details after a different customer is selected', () => {
    const loanResponse = new Subject<CreditPaymentLoan>();
    service.getCreditPaymentLoan.mockReturnValue(loanResponse);
    component.selectCustomer(customer);
    component.selectLoan(loan);

    service.getCreditPaymentLoans.mockReturnValue(of([]));
    component.selectCustomer({ ...customer, clientId: 12, accountNo: 'C-12', displayName: 'Grace Hopper' });
    loanResponse.next(loan);

    expect(component.selectedCustomer?.clientId).toBe(12);
    expect(component.selectedLoan).toBeUndefined();
  });

  it('calculates cash denomination subtotals with decimal-safe units and previews the exact request', () => {
    selectLoan();
    component.paymentForm.patchValue({ amount: '20', paymentTypeId: 5 });
    component.denominations.at(0).controls.quantity.setValue(2);
    component.requestPreview();

    expect(component.totalCash).toBe('20');
    expect(component.changeAmount).toBe('0');
    expect(service.previewCreditPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        clientId: 7,
        loanId: 8,
        paymentMethod: 'CASH',
        paymentTypeId: 5,
        denominations: [{ denominationId: 'USD-10', value: '10', quantity: 2 }]
      })
    );
  });

  it('prevents duplicate submission while the original request is pending', () => {
    const response = new Subject<CreditPaymentReceipt>();
    service.createCreditPayment.mockReturnValue(response);
    selectLoan();
    component.preview = {
      loanId: 8,
      paymentMethod: 'CASH',
      currencyCode: 'USD',
      businessDate: '2026-09-27',
      paymentAmount: 20,
      tenderAmount: 20,
      changeAmount: 0,
      principalOutstanding: 80,
      interestOutstanding: 10,
      feeOutstanding: 5,
      penaltyOutstanding: 0,
      denominations: [],
      postsRepaymentOnConfirmation: true
    };

    component.submitPayment();
    component.submitPayment();

    expect(service.createCreditPayment).toHaveBeenCalledTimes(1);
  });

  it('keeps the idempotency key for retries and rotates it after a new successful preview', () => {
    service.createCreditPayment.mockReturnValue(throwError(() => new Error('Submission failed')));
    selectLoan();
    component.paymentForm.patchValue({ amount: '20', paymentTypeId: 5 });
    component.denominations.at(0).controls.quantity.setValue(2);
    component.requestPreview();

    component.submitPayment();
    component.submitPayment();

    const firstKey = service.createCreditPayment.mock.calls[0][0].idempotencyKey;
    expect(firstKey).toBeTruthy();
    expect(service.createCreditPayment.mock.calls[1][0].idempotencyKey).toBe(firstKey);

    component.paymentForm.controls.amount.setValue('10');
    component.requestPreview();
    component.submitPayment();

    expect(service.createCreditPayment.mock.calls[2][0].idempotencyKey).not.toBe(firstKey);
  });

  it('keeps a subject-to-collection receipt pending without a loan transaction', () => {
    component.receipt = pendingReceipt;
    fixture.detectChanges();

    expect(component.receipt.status).toBe('PENDING_COLLECTION');
    expect(component.receipt.loanTransactionId).toBeUndefined();
    expect(fixture.nativeElement.textContent).toContain('creditPayment.messages.pendingReceipt');
  });

  it('clears and returns only pending checks using the backend transitions', () => {
    component.receipt = pendingReceipt;
    component.clearCheck();
    expect(service.clearCreditPaymentCheck).toHaveBeenCalledWith(
      11,
      expect.objectContaining({ idempotencyKey: expect.any(String) })
    );

    component.receipt = pendingReceipt;
    component.returnForm.controls.reason.setValue('NSF');
    component.returnCheck();
    expect(service.returnCreditPaymentCheck).toHaveBeenCalledWith(
      11,
      expect.objectContaining({ idempotencyKey: expect.any(String), reason: 'NSF' })
    );
  });

  it('surfaces backend validation failures without inventing local financial state', () => {
    service.previewCreditPayment.mockReturnValue(
      throwError(() => ({ error: { errors: [{ defaultUserMessage: 'Payment type does not match.' }] } }))
    );
    selectLoan();
    component.paymentForm.patchValue({ amount: '20', paymentTypeId: 5 });
    component.denominations.at(0).controls.quantity.setValue(2);
    component.requestPreview();

    expect(component.errorMessage).toBe('Payment type does not match.');
    expect(component.preview).toBeUndefined();
  });
});
