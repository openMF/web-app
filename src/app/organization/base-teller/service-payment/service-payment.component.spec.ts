/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { AuthenticationService } from 'app/core/authentication/authentication.service';
import {
  BaseTellerService,
  ServicePaymentQuote,
  ServicePaymentReceipt,
  ServicePaymentServiceConfiguration
} from '../base-teller.service';
import { ServicePaymentComponent } from './service-payment.component';

describe('ServicePaymentComponent', () => {
  let component: ServicePaymentComponent;
  let fixture: ComponentFixture<ServicePaymentComponent>;
  let service: jest.Mocked<BaseTellerService>;

  const configuredService: ServicePaymentServiceConfiguration = {
    id: 5,
    code: 'POWER',
    name: 'Power Utility',
    active: true,
    currencyCode: 'USD',
    commissionType: 'PERCENTAGE',
    commissionValue: '2',
    commissionVatRate: '13',
    denominations: [
      { identifier: 'USD-100', value: '100.00', type: 'NOTE' },
      { identifier: 'USD-10', value: '10.00', type: 'NOTE' }
    ]
  };
  const quote: ServicePaymentQuote = {
    payerType: 'NON_CLIENT',
    payerName: 'Ada Lovelace',
    serviceId: 5,
    serviceCode: 'POWER',
    serviceName: 'Power Utility',
    serviceReference: 'INV-42',
    baseAmount: '100.00',
    commission: '2.00',
    commissionVat: '0.26',
    totalToPay: '102.26',
    currencyCode: 'USD',
    businessDate: '2026-09-25'
  };
  const receipt = {
    ...quote,
    transactionId: 77,
    receiptNumber: 'SP-77',
    status: 'COMPLETED',
    officeId: 1,
    officeName: 'Head Office',
    tellerId: 2,
    tellerName: 'Main Teller',
    cashierId: 3,
    cashierName: 'Cashier One',
    operatorId: 4,
    operatorName: 'operator',
    totalPaid: '102.26',
    amountReceived: '110.00',
    change: '7.74',
    cashierTransactionId: 88,
    accountingTransactionId: '99',
    createdOnUtc: '2026-09-25T10:00:00Z',
    completedOnUtc: '2026-09-25T10:00:01Z',
    denominations: [{ denominationId: 'USD-10', value: '10.00', quantity: 11 }]
  } as ServicePaymentReceipt;

  beforeEach(async () => {
    service = {
      getServicePaymentServices: jest.fn(() => of([configuredService])),
      getReturnedCheckPaymentTypes: jest.fn(() =>
        of([
          { id: 1, name: 'Cash', isCashPayment: true },
          { id: 2, name: 'Check', isCashPayment: false }
        ])
      ),
      searchServicePaymentClients: jest.fn(() => of([{ entityId: 42, entityName: 'Grace Hopper' }])),
      getServicePaymentClient: jest.fn(() =>
        of({
          clientId: 42,
          accountNo: 'CL-42',
          displayName: 'Grace Hopper',
          officeId: 1,
          officeName: 'Head Office',
          status: '300'
        })
      ),
      quoteServicePayment: jest.fn(() => of(quote)),
      createServicePayment: jest.fn(() => of(receipt)),
      getServicePaymentReceipt: jest.fn(() => of(receipt))
    } as unknown as jest.Mocked<BaseTellerService>;

    await TestBed.configureTestingModule({
      imports: [
        ServicePaymentComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: BaseTellerService, useValue: service },
        {
          provide: AuthenticationService,
          useValue: { getCredentials: jest.fn(() => ({ permissions: ['ALL_FUNCTIONS'] })) }
        },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({}) } } },
        { provide: Router, useValue: { navigate: jest.fn(() => Promise.resolve(true)) } },
        provideAnimationsAsync()
      ]
    }).compileComponents();

    TestBed.inject(FaIconLibrary).addIcons(faArrowLeft, faArrowRight);
    fixture = TestBed.createComponent(ServicePaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function prepareNonClientPayment(): void {
    component.changePayerType('NON_CLIENT');
    component.detailsForm.patchValue({
      payerName: 'Ada Lovelace',
      serviceId: 5,
      serviceReference: 'INV-42',
      baseAmount: '100.00'
    });
    component.serviceChanged();
    component.requestQuote();
    component.denominations.at(0).controls.quantity.setValue(0);
    component.denominations.at(1).controls.quantity.setValue(11);
  }

  it('creates the component and loads only configured services and cash payment types', () => {
    expect(component).toBeTruthy();
    expect(component.services).toEqual([configuredService]);
    expect(component.cashPaymentTypes.map((paymentType) => paymentType.id)).toEqual([1]);
    expect(component.cashForm.controls.paymentTypeId.value).toBe(1);
  });

  it('supports client search and resolves the authoritative client payer', () => {
    component.detailsForm.controls.clientSearch.setValue('Grace');
    component.searchClients();
    expect(service.searchServicePaymentClients).toHaveBeenCalledWith('Grace');
    component.selectClient(component.clientResults[0]);
    expect(service.getServicePaymentClient).toHaveBeenCalledWith(42);
    expect(component.selectedClient?.accountNo).toBe('CL-42');
  });

  it('keeps the resolved client when the selected payer toggle is clicked again', () => {
    component.selectedClient = {
      clientId: 42,
      accountNo: 'CL-42',
      displayName: 'Grace Hopper',
      officeId: 1,
      officeName: 'Head Office',
      status: '300'
    };
    fixture.detectChanges();

    const selectedToggle = fixture.nativeElement.querySelector('mat-button-toggle button') as HTMLButtonElement;
    selectedToggle.click();
    fixture.detectChanges();

    expect(component.selectedClient?.clientId).toBe(42);
  });

  it('requests and renders the backend-authoritative quote for a non-client', () => {
    prepareNonClientPayment();
    expect(service.quoteServicePayment).toHaveBeenCalledWith({
      payerType: 'NON_CLIENT',
      clientId: undefined,
      payerName: 'Ada Lovelace',
      serviceId: 5,
      serviceReference: 'INV-42',
      baseAmount: '100.00',
      currencyCode: 'USD'
    });
    expect(component.quote?.commission).toBe('2.00');
    expect(component.quote?.commissionVat).toBe('0.26');
    expect(component.quote?.totalToPay).toBe('102.26');
  });

  it('ignores a quote response after the request context changes', () => {
    const pendingQuote = new Subject<ServicePaymentQuote>();
    service.quoteServicePayment.mockReturnValue(pendingQuote);
    component.changePayerType('NON_CLIENT');
    component.detailsForm.patchValue({
      payerName: 'Ada Lovelace',
      serviceId: 5,
      serviceReference: 'INV-42',
      baseAmount: '100.00'
    });
    component.requestQuote();

    component.detailsForm.controls.baseAmount.setValue('200.00');
    pendingQuote.next(quote);
    pendingQuote.complete();

    expect(component.quote).toBeUndefined();
  });

  it('uses backend denominations and decimal-safe cash/change previews', () => {
    prepareNonClientPayment();
    expect(component.denominations.length).toBe(2);
    expect(component.totalCashReceived).toBe('110');
    expect(component.changeAmount).toBe('7.74');
    expect(component.cashIsSufficient).toBe(true);
    component.denominations.at(1).controls.quantity.setValue(1.5);
    expect(component.denominations.at(1).controls.quantity.hasError('pattern')).toBe(true);
  });

  it('blocks quote requests for invalid payer or amount details', () => {
    component.changePayerType('NON_CLIENT');
    component.detailsForm.patchValue({ serviceId: 5, serviceReference: 'INV-42', baseAmount: '-1' });
    component.requestQuote();
    expect(service.quoteServicePayment).not.toHaveBeenCalled();
  });

  it('submits the exact quote context and configured denomination identifiers once', () => {
    prepareNonClientPayment();
    component.finalizePayment();
    expect(service.createServicePayment).toHaveBeenCalledTimes(1);
    const request = service.createServicePayment.mock.calls[0][0];
    expect(request.businessDate).toBe('2026-09-25');
    expect(request.paymentTypeId).toBe(1);
    expect(request.denominations).toEqual([{ denominationId: 'USD-10', value: '10.00', quantity: 11 }]);
    expect(request.idempotencyKey).toBeTruthy();
    expect(component.receipt).toEqual(receipt);
  });

  it('prevents duplicate submit while the same idempotent request is pending', () => {
    const pending = new Subject<ServicePaymentReceipt>();
    service.createServicePayment.mockReturnValue(pending);
    prepareNonClientPayment();
    component.finalizePayment();
    component.finalizePayment();
    expect(service.createServicePayment).toHaveBeenCalledTimes(1);
    pending.next(receipt);
    pending.complete();
  });

  it('surfaces a safe backend payment error and permits retry with the same key', () => {
    service.createServicePayment.mockReturnValueOnce(
      throwError(() => ({ error: { defaultUserMessage: 'Accounting configuration is incomplete.' } }))
    );
    prepareNonClientPayment();
    component.finalizePayment();
    const firstKey = service.createServicePayment.mock.calls[0][0].idempotencyKey;
    expect(component.errorMessage).toBe('Accounting configuration is incomplete.');
    component.finalizePayment();
    expect(service.createServicePayment.mock.calls[1][0].idempotencyKey).toBe(firstKey);
  });

  it('uses a new idempotency key after quote context invalidation and recalculation', () => {
    service.createServicePayment.mockReturnValueOnce(
      throwError(() => ({ error: { defaultUserMessage: 'Payment failed.' } }))
    );
    prepareNonClientPayment();
    component.finalizePayment();
    const firstKey = service.createServicePayment.mock.calls[0][0].idempotencyKey;

    service.quoteServicePayment.mockReturnValueOnce(
      of({
        ...quote,
        baseAmount: '101.00',
        totalToPay: '103.26'
      })
    );
    component.detailsForm.controls.baseAmount.setValue('101.00');
    component.requestQuote();
    component.denominations.at(1).controls.quantity.setValue(11);
    component.finalizePayment();

    expect(service.createServicePayment.mock.calls[1][0].idempotencyKey).not.toBe(firstKey);
  });

  it('retrieves the immutable receipt before reprinting', () => {
    const print = jest.spyOn(window, 'print').mockImplementation(() => undefined);
    jest.useFakeTimers();
    component.receipt = receipt;
    component.reprintReceipt();
    expect(service.getServicePaymentReceipt).toHaveBeenCalledWith(77);
    jest.runOnlyPendingTimers();
    expect(print).toHaveBeenCalled();
    print.mockRestore();
    jest.useRealTimers();
  });

  it('shows an empty configuration state without frontend defaults', () => {
    component.services = [];
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('servicePayment.text.noServices');
  });
});
