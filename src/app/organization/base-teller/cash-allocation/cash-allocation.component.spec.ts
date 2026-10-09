/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { AuthenticationService } from 'app/core/authentication/authentication.service';
import {
  BaseTellerService,
  CashAllocationContext,
  CashAllocationPreview,
  CashAllocationReceipt
} from '../base-teller.service';
import { CashAllocationComponent } from './cash-allocation.component';

describe('CashAllocationComponent', () => {
  let component: CashAllocationComponent;
  let fixture: ComponentFixture<CashAllocationComponent>;
  let service: jest.Mocked<BaseTellerService>;
  let dialog: { open: jest.Mock };

  const context: CashAllocationContext = {
    businessDate: '2026-09-26',
    officeId: 1,
    officeName: 'Head Office',
    currencyCode: 'CRC',
    vaultBalance: '1000.00',
    currencies: [
      {
        code: 'CRC',
        name: 'Colón',
        displaySymbol: '₡',
        decimalPlaces: 2,
        denominations: [
          { identifier: 'crc-note-100', type: 'BANKNOTE', value: '100.00', quantity: 0, subtotal: '0' },
          { identifier: 'crc-coin-025', type: 'COIN', value: '0.25', quantity: 0, subtotal: '0' }
        ]
      },
      {
        code: 'JPY',
        name: 'Yen',
        displaySymbol: '¥',
        decimalPlaces: 0,
        denominations: [
          { identifier: 'jpy-note-1000', type: 'BANKNOTE', value: '1000', quantity: 0, subtotal: '0' }
        ]
      }
    ],
    cashiers: [
      {
        cashierId: 10,
        tellerId: 100,
        tellerName: 'Head Window',
        staffId: 1000,
        cashierName: 'Head Cashier',
        headCashierSource: true,
        currentBalance: '500.00'
      },
      {
        cashierId: 11,
        tellerId: 101,
        tellerName: 'Teller Window',
        staffId: 1001,
        cashierName: 'Operational Teller',
        headCashierSource: false,
        currentBalance: '0.00'
      }
    ]
  };

  const preview: CashAllocationPreview = {
    operationType: 'SAFE_VAULT_OPENING',
    businessDate: '2026-09-26',
    officeId: 1,
    currencyCode: 'CRC',
    source: 'Configured opening balance contra',
    destination: 'Safe/Vault - Head Office',
    cashInflow: '200.75',
    cashOutflow: '200.75',
    checksInflow: '0',
    checksOutflow: '0',
    vouchersInflow: '0',
    vouchersOutflow: '0',
    authoritativeTotal: '200.75',
    denominations: context.currencies[0].denominations
  };

  const receipt: CashAllocationReceipt = {
    id: 77,
    reference: 'CA-2026-09-26-1-ABC',
    operationType: 'SAFE_VAULT_OPENING',
    status: 'COMPLETED',
    businessDate: '2026-09-26',
    officeId: 1,
    officeName: 'Head Office',
    initiatedBy: 1,
    initiatedByUsername: 'mifos',
    source: 'Configured opening balance contra',
    destination: 'Safe/Vault - Head Office',
    currencyCode: 'CRC',
    totalAmount: '200.75',
    destinationBalanceBefore: '0',
    destinationBalanceAfter: '200.75',
    accountingTransactionId: '101',
    createdOn: '2026-09-26T10:00:00Z',
    completedOn: '2026-09-26T10:00:01Z',
    denominations: context.currencies[0].denominations
  };

  beforeEach(async () => {
    service = {
      getCashAllocationContext: jest.fn(() => of(context)),
      previewCashAllocation: jest.fn(() => of(preview)),
      createCashAllocation: jest.fn(() => of(receipt)),
      getCashAllocation: jest.fn(() => of(receipt)),
      reprintCashAllocationReceipt: jest.fn(() => of(receipt))
    } as unknown as jest.Mocked<BaseTellerService>;
    dialog = { open: jest.fn(() => ({ afterClosed: () => of(false) })) };

    await TestBed.configureTestingModule({
      imports: [
        CashAllocationComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: BaseTellerService, useValue: service },
        {
          provide: AuthenticationService,
          useValue: {
            getCredentials: jest.fn(() => ({
              officeId: 1,
              permissions: [
                'READ_BASE_TELLER_CASH_ALLOCATION',
                'CREATE_BASE_TELLER_CASH_ALLOCATION',
                'REPRINT_BASE_TELLER_CASH_ALLOCATION'
              ]
            }))
          }
        },
        { provide: MatDialog, useValue: dialog },
        provideAnimationsAsync()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CashAllocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function enterCash(): void {
    component.denominations.at(0).controls.quantity.setValue(2);
    component.denominations.at(1).controls.quantity.setValue(3);
  }

  it('loads office context then reloads the first configured currency without hardcoded values', () => {
    expect(service.getCashAllocationContext).toHaveBeenNthCalledWith(1, 1, undefined);
    expect(service.getCashAllocationContext).toHaveBeenNthCalledWith(2, 1, 'CRC');
    expect(component.context).toEqual(context);
    expect(component.denominations.length).toBe(2);
    expect(component.allocationForm.controls.currencyCode.value).toBe('CRC');
  });

  it('uses decimal-safe denomination subtotals and totals', () => {
    enterCash();
    expect(component.lineTotal(component.denominations.at(0))).toBe('200.00');
    expect(component.lineTotal(component.denominations.at(1))).toBe('0.75');
    expect(component.total).toBe('200.75');
  });

  it('reloads real configuration for another backend currency', () => {
    service.getCashAllocationContext.mockReturnValueOnce(
      of({ ...context, currencyCode: 'JPY', currencies: [context.currencies[1]] })
    );
    component.allocationForm.controls.currencyCode.setValue('JPY');
    component.currencyChanged();
    expect(service.getCashAllocationContext).toHaveBeenLastCalledWith(1, 'JPY');
    expect(component.denominations.at(0).controls.denominationId.value).toBe('jpy-note-1000');
  });

  it.each([
    [
      'SAFE_VAULT_OPENING',
      null,
      null
    ],
    [
      'HEAD_CASHIER_ALLOCATION',
      null,
      10
    ],
    [
      'OPERATIONAL_TELLER_ALLOCATION',
      10,
      11
    ]
  ] as const)(
    'previews the exact %s backend operation shape',
    (operationType, sourceCashierId, destinationCashierId) => {
      component.allocationForm.patchValue({ operationType, sourceCashierId, destinationCashierId });
      enterCash();
      component.preview();
      const request = service.previewCashAllocation.mock.calls.at(-1)?.[0];
      expect(request?.operationType).toBe(operationType);
      expect(request?.sourceCashierId).toBe(sourceCashierId ?? undefined);
      expect(request?.destinationCashierId).toBe(destinationCashierId ?? undefined);
      expect(request?.denominations).toEqual([
        { denominationId: 'crc-note-100', quantity: 2 },
        { denominationId: 'crc-coin-025', quantity: 3 }
      ]);
    }
  );

  it('offers only funded head cashiers as operational sources and excludes the source from Transfer To', () => {
    component.allocationForm.patchValue({
      operationType: 'OPERATIONAL_TELLER_ALLOCATION',
      sourceCashierId: 10
    });
    expect(component.sourceCashiers.map((cashier) => cashier.cashierId)).toEqual([10]);
    expect(component.destinationCashiers.map((cashier) => cashier.cashierId)).toEqual([11]);
  });

  it('requires explicit preview confirmation, posts once, and retrieves the authoritative receipt', () => {
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });
    enterCash();
    component.preview();
    expect(service.previewCashAllocation).toHaveBeenCalledTimes(1);
    expect(dialog.open).toHaveBeenCalledTimes(1);
    expect(service.createCashAllocation).toHaveBeenCalledTimes(1);
    expect(service.getCashAllocation).toHaveBeenCalledWith(77);
    expect(component.receipt).toEqual(receipt);
  });

  it('prevents duplicate posting while the same request is in flight', () => {
    const pending = new Subject<CashAllocationReceipt>();
    service.createCashAllocation.mockReturnValue(pending);
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });
    enterCash();
    component.preview();
    component.preview();
    expect(service.createCashAllocation).toHaveBeenCalledTimes(1);
    pending.next(receipt);
    pending.complete();
  });

  it('does not allow a failed preview to bypass confirmation through retry', () => {
    service.previewCashAllocation.mockReturnValueOnce(throwError(() => ({ error: {} })));
    enterCash();

    component.preview();

    expect(component.errorMessage).toBe('cashAllocation.errors.preview');
    expect(component.canRetryPost).toBe(false);
    component.retryPosting();
    expect(service.createCashAllocation).not.toHaveBeenCalled();
  });

  it('surfaces backend validation and retries an uncertain transaction with the same idempotency key', () => {
    service.createCashAllocation.mockReturnValueOnce(
      throwError(() => ({ error: { defaultUserMessage: 'The source balance is insufficient.' } }))
    );
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });
    enterCash();
    component.preview();
    const firstKey = service.createCashAllocation.mock.calls[0][0].idempotencyKey;
    expect(component.errorMessage).toBe('The source balance is insufficient.');
    component.retryPosting();
    expect(service.createCashAllocation.mock.calls[1][0].idempotencyKey).toBe(firstKey);
  });

  it('retries only receipt retrieval when creation succeeds but the receipt request fails', () => {
    service.getCashAllocation.mockReturnValueOnce(throwError(() => ({ error: {} }))).mockReturnValueOnce(of(receipt));
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });
    enterCash();

    component.preview();

    expect(service.createCashAllocation).toHaveBeenCalledTimes(1);
    expect(service.getCashAllocation).toHaveBeenCalledTimes(1);
    expect(component.errorMessage).toBe('cashAllocation.errors.receipt');

    component.retryPosting();

    expect(service.createCashAllocation).toHaveBeenCalledTimes(1);
    expect(service.getCashAllocation).toHaveBeenNthCalledWith(2, 77);
    expect(component.receipt).toEqual(receipt);
  });

  it('retrieves backend data for print and uses the separately permissioned reprint endpoint', () => {
    const print = jest.spyOn(window, 'print').mockImplementation(() => undefined);
    jest.useFakeTimers();
    component.receipt = receipt;
    component.printReceipt();
    expect(service.getCashAllocation).toHaveBeenCalledWith(77);
    component.reprintReceipt();
    expect(service.reprintCashAllocationReceipt).toHaveBeenCalledWith(77);
    jest.runOnlyPendingTimers();
    expect(print).toHaveBeenCalledTimes(2);
    print.mockRestore();
    jest.useRealTimers();
  });

  it('renders an empty configuration state without frontend currency or denomination defaults', () => {
    component.context = { ...context, currencies: [], cashiers: [] };
    component.denominations.clear();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('cashAllocation.empty.currencies');
  });
});
