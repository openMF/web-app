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
import { Subject, finalize, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { SettingsService } from 'app/settings/settings.service';
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
    const storage = new Map<string, string>();
    jest.spyOn(sessionStorage, 'getItem').mockImplementation((key) => storage.get(key) ?? null);
    jest.spyOn(sessionStorage, 'setItem').mockImplementation((key, value) => {
      storage.set(key, value);
    });
    jest.spyOn(sessionStorage, 'removeItem').mockImplementation((key) => {
      storage.delete(key);
    });
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
        { provide: SettingsService, useValue: { baseServerUrl: 'synthetic-backend', tenantIdentifier: 'test' } },
        {
          provide: AuthenticationService,
          useValue: {
            getCredentials: jest.fn(() => ({
              officeId: 1,
              userId: 1453,
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

  it('uses the selected response catalog rather than the initial currency-list snapshot', () => {
    fixture.destroy();
    const mxn = { ...context.currencies[0], code: 'MXN', name: 'Mexican Peso' };
    const initial: CashAllocationContext = {
      ...context,
      currencyCode: '',
      currencies: [{ ...mxn, denominations: [] }]
    };
    const selected = { ...context, currencyCode: 'MXN', currencies: [mxn] };
    service.getCashAllocationContext.mockReset().mockReturnValueOnce(of(initial)).mockReturnValueOnce(of(selected));
    fixture = TestBed.createComponent(CashAllocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.denominations.length).toBe(2);
    expect(component.context?.currencies[0]).toEqual(mxn);
    enterCash();
    expect(component.canPreview).toBe(true);
  });

  it('reproduces the missing MXN catalog state and sends no financial request', () => {
    service.getCashAllocationContext.mockReturnValueOnce(
      of({
        ...context,
        currencyCode: 'MXN',
        vaultBalance: '0',
        currencies: [{ ...context.currencies[0], code: 'MXN', denominations: [] }]
      })
    );
    component.allocationForm.controls.currencyCode.setValue('MXN');
    component.currencyChanged();
    fixture.detectChanges();

    expect(component.denominations.length).toBe(0);
    expect(component.canPreview).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('cashAllocation.empty.denominations');
    component.preview();
    expect(service.previewCashAllocation).not.toHaveBeenCalled();
    expect(service.createCashAllocation).not.toHaveBeenCalled();
  });

  it('cancels the previous context request and keeps the latest currency, catalog and balance together', () => {
    const older = new Subject<CashAllocationContext>();
    const cancelled = jest.fn();

    service.getCashAllocationContext.mockReturnValueOnce(older.pipe(finalize(cancelled))).mockReturnValueOnce(
      of({
        ...context,
        currencyCode: 'JPY',
        vaultBalance: '75',
        currencies: [context.currencies[1]]
      })
    );
    component.currencyChanged();
    expect(component.isLoading).toBe(true);
    component.allocationForm.controls.currencyCode.setValue('JPY');
    component.currencyChanged();
    older.next({ ...context, vaultBalance: '999' });
    older.complete();

    expect(cancelled).toHaveBeenCalledTimes(1);
    expect(component.context?.currencyCode).toBe('JPY');
    expect(component.context?.vaultBalance).toBe('75');
    expect(component.denominations.at(0).controls.denominationId.value).toBe('jpy-note-1000');
    expect(component.isLoading).toBe(false);
  });

  it('keeps fallback request keys within the native command limit after backend suffixes', () => {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis.crypto, 'randomUUID');
    Object.defineProperty(globalThis.crypto, 'randomUUID', { configurable: true, value: undefined });
    try {
      enterCash();
      component.preview();
      const key = service.previewCashAllocation.mock.calls[0][0].idempotencyKey;
      expect(key.length).toBeLessThanOrEqual(38);
      expect(key.length).toBeGreaterThan(0);
    } finally {
      if (descriptor) Object.defineProperty(globalThis.crypto, 'randomUUID', descriptor);
      else delete (globalThis.crypto as Partial<Crypto>).randomUUID;
    }
  });

  it('uses decimal-safe denomination subtotals and totals', () => {
    enterCash();
    expect(component.lineTotal(component.denominations.at(0))).toBe('200.00');
    expect(component.lineTotal(component.denominations.at(1))).toBe('0.75');
    expect(component.total).toBe('200.75');
  });

  it.each([
    'NOTE',
    'BILL',
    'BANKNOTE'
  ])('renders the backend %s denomination type with the existing banknote translation', (type) => {
    service.getCashAllocationContext.mockReturnValueOnce(
      of({
        ...context,
        currencies: [
          {
            ...context.currencies[0],
            denominations: [{ ...context.currencies[0].denominations[0], type }]
          }
        ]
      })
    );
    component.currencyChanged();

    expect(component.denominations.at(0).controls.type.value).toBe('BANKNOTE');
    expect(component.denominations.at(0).controls.denominationId.value).toBe('crc-note-100');
    expect(component.denominations.at(0).controls.value.value).toBe('100.00');
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
      throwError(() => ({ status: 0, error: { developerMessage: 'SQL connection lost' } }))
    );
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });
    enterCash();
    component.preview();
    const firstKey = service.createCashAllocation.mock.calls[0][0].idempotencyKey;
    expect(component.errorMessage).toBe('cashAllocation.errors.create');
    expect(component.allocationForm.disabled).toBe(true);
    component.operationChanged();
    component.currencyChanged();
    component.newOperation();
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

  it('loads an empty currency response without requesting an invented default', () => {
    fixture.destroy();
    service.getCashAllocationContext.mockReset().mockReturnValue(of({ ...context, currencies: [] }));
    fixture = TestBed.createComponent(CashAllocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(service.getCashAllocationContext).toHaveBeenCalledTimes(1);
    expect(component.canPreview).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('cashAllocation.empty.currencies');
  });

  it('recovers from a failed context request and clears stale quantities', () => {
    enterCash();
    service.getCashAllocationContext.mockReturnValueOnce(
      throwError(() => ({ error: { developerMessage: 'SQL secret' } }))
    );
    component.currencyChanged();
    expect(component.context).toBeUndefined();
    expect(component.denominations.length).toBe(0);
    expect(component.errorMessage).toBe('cashAllocation.errors.context');
    expect(component.isLoading).toBe(false);
    expect(component.canPreview).toBe(false);
    fixture.detectChanges();
    const retry = fixture.nativeElement.querySelector('[data-testid="cash-allocation-context-retry"]');
    expect(retry.textContent).toContain('labels.buttons.Retry');
    retry.click();
    expect(service.getCashAllocationContext).toHaveBeenLastCalledWith(1, 'CRC');
    expect(component.denominations.length).toBe(2);
    expect(component.errorMessage).toBe('');
    expect(component.denominations.at(0).controls.quantity.value).toBe(0);
  });

  it('refreshes an empty single-currency catalog using its visible Retry without allowing stale preview', () => {
    fixture.destroy();
    const empty: CashAllocationContext = { ...context, currencies: [{ ...context.currencies[0], denominations: [] }] };
    const refresh = new Subject<CashAllocationContext>();
    service.getCashAllocationContext
      .mockReset()
      .mockReturnValueOnce(of(empty))
      .mockReturnValueOnce(of(empty))
      .mockReturnValueOnce(refresh);
    fixture = TestBed.createComponent(CashAllocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.currencyOptions.length).toBe(1);
    const selector = fixture.nativeElement.querySelector('mat-select[formcontrolname="currencyCode"]');
    fixture.nativeElement.querySelector('[data-testid="cash-allocation-denominations-retry"]').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('mat-select[formcontrolname="currencyCode"]')).toBe(selector);
    expect(component.isLoading).toBe(true);
    expect(component.context).toBeUndefined();
    expect(component.canPreview).toBe(false);
    expect(service.previewCashAllocation).not.toHaveBeenCalled();
    refresh.next({ ...context, currencies: [context.currencies[0]] });
    refresh.complete();
    expect(component.denominations.length).toBe(2);
    expect(component.denominations.at(0).controls.quantity.value).toBe(0);
    enterCash();
    expect(component.canPreview).toBe(true);
  });

  it('keeps the same currency selector during refresh and after failure so another currency can be selected', () => {
    const pending = new Subject<CashAllocationContext>();
    service.getCashAllocationContext.mockReturnValueOnce(pending);
    const selector = fixture.nativeElement.querySelector('mat-select[formcontrolname="currencyCode"]');
    enterCash();
    component.currencyChanged();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('mat-select[formcontrolname="currencyCode"]')).toBe(selector);
    expect(component.context).toBeUndefined();
    expect(component.denominations.length).toBe(0);
    expect(fixture.nativeElement.querySelector('.context-summary')).toBeNull();
    expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBe(true);
    pending.error({ status: 500 });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('mat-select[formcontrolname="currencyCode"]')).toBe(selector);
    service.getCashAllocationContext.mockReturnValueOnce(
      of({ ...context, currencyCode: 'JPY', currencies: [context.currencies[1]] })
    );
    component.allocationForm.controls.currencyCode.setValue('JPY');
    component.currencyChanged();
    expect(component.context?.currencyCode).toBe('JPY');
    expect(component.denominations.at(0).controls.denominationId.value).toBe('jpy-note-1000');
  });

  it('retrieves the created receipt even if saving its allocation ID fails', () => {
    const save = jest.spyOn(sessionStorage, 'setItem');
    const write = save.getMockImplementation()!;
    save.mockImplementationOnce(write).mockImplementationOnce(() => {
      throw new Error('Storage unavailable after create');
    });
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });
    enterCash();
    component.preview();
    expect(service.createCashAllocation).toHaveBeenCalledTimes(1);
    expect(service.getCashAllocation).toHaveBeenCalledWith(77);
    expect(component.receipt).toEqual(receipt);
    expect(component.canRetryPost).toBe(false);
  });

  it('cancels context retrieval when the component is destroyed', () => {
    const cancelled = jest.fn();
    service.getCashAllocationContext.mockReturnValueOnce(
      new Subject<CashAllocationContext>().pipe(finalize(cancelled))
    );
    component.currencyChanged();
    fixture.destroy();
    expect(cancelled).toHaveBeenCalledTimes(1);
  });

  it('rejects a context for another office or currency', () => {
    service.getCashAllocationContext.mockReturnValueOnce(of({ ...context, officeId: 22 }));
    component.currencyChanged();
    expect(component.canPreview).toBe(false);
    expect(component.context).toBeUndefined();
    service.getCashAllocationContext.mockReturnValueOnce(of({ ...context, currencyCode: 'JPY' }));
    component.currencyChanged();
    expect(component.canPreview).toBe(false);
    expect(component.context).toBeUndefined();
  });

  it.each([
    -1,
    1.5,
    13
  ])('blocks unsupported currency precision %s without throwing', (decimalPlaces) => {
    service.getCashAllocationContext.mockReturnValueOnce(
      of({
        ...context,
        currencies: [{ ...context.currencies[0], decimalPlaces }]
      })
    );
    component.currencyChanged();
    expect(component.errorMessage).toBe('cashAllocation.errors.configuration');
    expect(component.denominations.length).toBe(0);
    expect(component.canPreview).toBe(false);
    expect(() => component.total).not.toThrow();
  });

  it.each([
    { identifier: '', type: 'COIN', value: '1' },
    { identifier: 'bad', type: 'VOUCHER', value: '1' },
    { identifier: 'bad', type: 'COIN', value: '-1' },
    { identifier: 'bad', type: 'COIN', value: '0' },
    { identifier: 'bad', type: 'COIN', value: '0.001' },
    { identifier: 'bad', type: 'COIN', value: 'oops' }
  ])('blocks malformed denomination $identifier / $type / $value', (denomination) => {
    service.getCashAllocationContext.mockReturnValueOnce(
      of({
        ...context,
        currencies: [{ ...context.currencies[0], denominations: [{ ...denomination, quantity: 0, subtotal: '0' }] }]
      })
    );
    component.currencyChanged();
    expect(component.errorMessage).toBe('cashAllocation.errors.configuration');
    expect(component.denominations.length).toBe(0);
    component.preview();
    expect(service.previewCashAllocation).not.toHaveBeenCalled();
  });

  it('rejects a duplicate denomination identifier without rendering duplicate rows', () => {
    service.getCashAllocationContext.mockReturnValueOnce(
      of({
        ...context,
        currencies: [{ ...context.currencies[0], denominations: [
              context.currencies[0].denominations[0],
              context.currencies[0].denominations[0]
            ] }]
      })
    );
    component.currencyChanged();
    expect(component.denominations.length).toBe(0);
    expect(component.canPreview).toBe(false);
  });

  it('accepts exact catalog values with trailing zeroes at the configured precision', () => {
    service.getCashAllocationContext.mockReturnValueOnce(
      of({
        ...context,
        currencies: [
          {
            ...context.currencies[0],
            denominations: [{ ...context.currencies[0].denominations[1], value: '0.250000' }]
          }
        ]
      })
    );
    component.currencyChanged();
    component.denominations.at(0).controls.quantity.setValue(3);
    expect(component.total).toBe('0.75');
    expect(component.canPreview).toBe(true);
  });

  it.each([
    null,
    -1,
    1.5,
    Number.MAX_SAFE_INTEGER + 1
  ])('rejects quantity %s without a BigInt rendering exception', (quantity) => {
    component.denominations.at(0).controls.quantity.setValue(quantity);
    expect(component.canPreview).toBe(false);
    expect(component.lineTotal(component.denominations.at(0))).toBe('0.00');
    expect(component.total).toBe('0.00');
    component.preview();
    expect(service.previewCashAllocation).not.toHaveBeenCalled();
  });

  it('rejects zero totals and invalid cashier selections', () => {
    expect(component.canPreview).toBe(false);
    enterCash();
    component.allocationForm.patchValue({ operationType: 'HEAD_CASHIER_ALLOCATION' });
    expect(component.canPreview).toBe(false);
    component.allocationForm.patchValue({ destinationCashierId: 999 });
    expect(component.canPreview).toBe(false);
    component.allocationForm.patchValue({
      operationType: 'OPERATIONAL_TELLER_ALLOCATION',
      sourceCashierId: 11,
      destinationCashierId: 10
    });
    expect(component.canPreview).toBe(false);
    component.allocationForm.patchValue({ sourceCashierId: 10, destinationCashierId: 10 });
    expect(component.canPreview).toBe(false);
  });

  it('uses the authoritative source balance for provisioning but permits initial vault opening at zero', () => {
    service.getCashAllocationContext.mockReturnValueOnce(of({ ...context, vaultBalance: '0' }));
    component.currencyChanged();
    enterCash();
    expect(component.canPreview).toBe(true);
    component.allocationForm.patchValue({ operationType: 'HEAD_CASHIER_ALLOCATION', destinationCashierId: 10 });
    expect(component.insufficientSourceBalance).toBe(true);
    expect(component.canPreview).toBe(false);
    component.allocationForm.patchValue({
      operationType: 'OPERATIONAL_TELLER_ALLOCATION',
      sourceCashierId: 10,
      destinationCashierId: 11
    });
    component.denominations.at(0).controls.quantity.setValue(6);
    expect(component.insufficientSourceBalance).toBe(true);
    component.preview();
    expect(service.previewCashAllocation).not.toHaveBeenCalled();
  });

  it('keeps the reviewed inputs locked through confirmation and makes no write on cancellation', () => {
    const confirmation = new Subject<boolean>();
    dialog.open.mockReturnValue({ afterClosed: () => confirmation });
    enterCash();
    component.preview();
    expect(component.isConfirming).toBe(true);
    expect(component.allocationForm.disabled).toBe(true);
    component.preview();
    expect(service.previewCashAllocation).toHaveBeenCalledTimes(1);
    confirmation.next(false);
    confirmation.complete();
    expect(service.createCashAllocation).not.toHaveBeenCalled();
    expect(component.allocationForm.enabled).toBe(true);
    expect(component.canRetryPost).toBe(false);
  });

  it.each([
    [
      'drawer.already.opened',
      'alreadyOpened'
    ],
    [
      'drawer.closed',
      'drawerClosed'
    ],
    [
      'source.insufficient',
      'insufficientSource'
    ],
    [
      'source.not.head.cashier',
      'sourceCashier'
    ],
    [
      'cashier.invalid',
      'cashier'
    ],
    [
      'business.date.invalid',
      'businessDate'
    ],
    [
      'denomination.configuration.invalid',
      'configuration'
    ]
  ])('localizes backend guard %s without exposing internal messages', (code, key) => {
    service.previewCashAllocation.mockReturnValueOnce(
      throwError(() => ({
        status: 403,
        error: {
          errors: [
            {
              userMessageGlobalisationCode: 'error.msg.base.teller.cash.allocation.' + code,
              defaultUserMessage: 'SQL internal details'
            }
          ]
        }
      }))
    );
    enterCash();
    component.preview();
    expect(component.errorMessage).toBe('cashAllocation.errors.' + key);
    expect(service.createCashAllocation).not.toHaveBeenCalled();
    expect(component.receipt).toBeUndefined();
    expect(component.allocationForm.enabled).toBe(true);
  });

  it.each([
    [
      0,
      401
    ],
    [
      0,
      403
    ],
    [
      0,
      422
    ],
    [
      408,
      401
    ],
    [
      429,
      401
    ],
    [
      500,
      401
    ]
  ])('retains the original identity after uncertain status %s followed by retry rejection %s', (first, retryStatus) => {
    service.createCashAllocation
      .mockReturnValueOnce(throwError(() => ({ status: first, error: {} })))
      .mockReturnValueOnce(throwError(() => ({ status: retryStatus, error: {} })))
      .mockReturnValueOnce(of(receipt));
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });
    enterCash();
    component.preview();
    const original = service.createCashAllocation.mock.calls[0][0];
    component.retryPosting();
    expect(component.canRetryPost).toBe(true);
    expect(component.allocationForm.disabled).toBe(true);
    expect(component.receipt).toBeUndefined();
    component.retryPosting();
    expect(service.createCashAllocation.mock.calls.map(([request]) => request)).toEqual([
      original,
      original,
      original
    ]);
    expect(service.getCashAllocation).toHaveBeenCalledWith(77);
    expect(component.receipt).toEqual(receipt);
  });

  it('requires fresh context if the user changes before preview starts, even within the same office', () => {
    const auth = TestBed.inject(AuthenticationService);
    jest.spyOn(auth, 'getCredentials').mockReturnValue({ ...auth.getCredentials()!, userId: 99 });
    enterCash();
    component.preview();
    expect(service.previewCashAllocation).not.toHaveBeenCalled();
    expect(component.context).toBeUndefined();
    expect(component.denominations.length).toBe(0);
    expect(component.canPreview).toBe(false);
    expect(service.createCashAllocation).not.toHaveBeenCalled();
  });

  it('rejects an old-scope preview response without opening confirmation', () => {
    const pending = new Subject<CashAllocationPreview>();
    service.previewCashAllocation.mockReturnValueOnce(pending);
    enterCash();
    component.preview();
    const auth = TestBed.inject(AuthenticationService);
    jest.spyOn(auth, 'getCredentials').mockReturnValue({ ...auth.getCredentials()!, userId: 99 });
    pending.next(preview);
    pending.complete();
    expect(dialog.open).not.toHaveBeenCalled();
    expect(component.context).toBeUndefined();
    expect(component.canPreview).toBe(false);
    expect(component.allocationForm.enabled).toBe(true);
    expect(service.createCashAllocation).not.toHaveBeenCalled();
  });

  it.each([
    'user',
    'tenant',
    'server'
  ])('rejects confirmation after the %s changes and requires a fresh review', (changed) => {
    const confirmation = new Subject<boolean>();
    dialog.open.mockReturnValueOnce({ afterClosed: () => confirmation });
    enterCash();
    component.preview();
    const oldKey = service.previewCashAllocation.mock.calls[0][0].idempotencyKey;
    const settings = TestBed.inject(SettingsService) as unknown as { tenantIdentifier: string; baseServerUrl: string };
    const auth = TestBed.inject(AuthenticationService);
    if (changed === 'user')
      jest.spyOn(auth, 'getCredentials').mockReturnValue({ ...auth.getCredentials()!, userId: 99 });
    else if (changed === 'tenant') settings.tenantIdentifier = 'other-tenant';
    else settings.baseServerUrl = 'other-server';
    confirmation.next(true);
    confirmation.complete();
    expect(service.createCashAllocation).not.toHaveBeenCalled();
    expect(component.context).toBeUndefined();
    expect(component.denominations.length).toBe(0);
    expect(component.canRetryPost).toBe(false);
    expect(component.allocationForm.enabled).toBe(true);
    component.preview();
    expect(service.previewCashAllocation).toHaveBeenCalledTimes(1);
    component.retryContext();
    expect(component.denominations.at(0).controls.quantity.value).toBe(0);
    dialog.open.mockReturnValueOnce({ afterClosed: () => of(true) });
    enterCash();
    component.preview();
    expect(service.previewCashAllocation).toHaveBeenCalledTimes(2);
    expect(service.createCashAllocation).toHaveBeenCalledTimes(1);
    expect(service.createCashAllocation.mock.calls[0][0].idempotencyKey).not.toBe(oldKey);
    expect(component.receipt).toEqual(receipt);
  });

  it('keeps the request-start storage scope if credentials change while create is in flight', () => {
    const create = new Subject<CashAllocationReceipt>();
    service.createCashAllocation.mockReturnValueOnce(create);
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });
    enterCash();
    component.preview();
    const auth = TestBed.inject(AuthenticationService);
    const original = auth.getCredentials()!;
    jest.spyOn(auth, 'getCredentials').mockReturnValue({ ...original, userId: 99, officeId: 2 });
    create.next(receipt);
    create.complete();
    expect(JSON.parse(sessionStorage.getItem('cash-allocation:synthetic-backend:test:1453:1')!).allocationId).toBe(77);
    expect(sessionStorage.getItem('cash-allocation:synthetic-backend:test:99:2')).toBeNull();
    expect(service.getCashAllocation).not.toHaveBeenCalled();
    component.retryPosting();
    expect(service.getCashAllocation).not.toHaveBeenCalled();
    jest.spyOn(auth, 'getCredentials').mockReturnValue(original);
    component.retryPosting();
    expect(service.getCashAllocation).toHaveBeenCalledWith(77);
    expect(component.receipt).toEqual(receipt);
  });

  it('uses the captured scope when clearing receipt recovery after credentials change', () => {
    const read = new Subject<CashAllocationReceipt>();
    service.getCashAllocation.mockReturnValueOnce(throwError(() => ({ status: 500 }))).mockReturnValueOnce(read);
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });
    enterCash();
    component.preview();
    component.retryPosting();
    const auth = TestBed.inject(AuthenticationService);
    jest.spyOn(auth, 'getCredentials').mockReturnValue({ ...auth.getCredentials()!, userId: 99, officeId: 2 });
    sessionStorage.setItem('cash-allocation:synthetic-backend:test:99:2', 'another-user-record');
    read.next(receipt);
    read.complete();
    expect(sessionStorage.getItem('cash-allocation:synthetic-backend:test:99:2')).toBe('another-user-record');
    expect(sessionStorage.getItem('cash-allocation:synthetic-backend:test:1453:1')).toBeNull();
  });

  it('cancels create callbacks on destruction and retains recovery for an uncertain outcome', () => {
    const create = new Subject<CashAllocationReceipt>();
    const cancelled = jest.fn();
    service.createCashAllocation.mockReturnValueOnce(create.pipe(finalize(cancelled)));
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });
    enterCash();
    component.preview();
    const old = component;
    const key = 'cash-allocation:synthetic-backend:test:1453:1';
    const stored = sessionStorage.getItem(key);
    fixture.destroy();
    expect(cancelled).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem(key)).toBe(stored);
    sessionStorage.setItem(key, 'newer-instance-record');
    create.next(receipt);
    create.error({ status: 403 });
    expect(service.getCashAllocation).not.toHaveBeenCalled();
    expect(old.receipt).toBeUndefined();
    expect(sessionStorage.getItem(key)).toBe('newer-instance-record');
  });

  it('cancels receipt-retry callbacks on destruction without removing a newer recovery record', () => {
    const read = new Subject<CashAllocationReceipt>();
    const cancelled = jest.fn();
    service.getCashAllocation
      .mockReturnValueOnce(throwError(() => ({ status: 500 })))
      .mockReturnValueOnce(read.pipe(finalize(cancelled)));
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });
    enterCash();
    component.preview();
    component.retryPosting();
    const old = component;
    fixture.destroy();
    expect(cancelled).toHaveBeenCalledTimes(1);
    const key = 'cash-allocation:synthetic-backend:test:1453:1';
    sessionStorage.setItem(key, 'newer-instance-record');
    read.next(receipt);
    read.complete();
    expect(old.receipt).toBeUndefined();
    expect(sessionStorage.getItem(key)).toBe('newer-instance-record');
  });

  it('does not remove another request record even when its amount and signature match', () => {
    const read = new Subject<CashAllocationReceipt>();
    service.getCashAllocation.mockReturnValueOnce(read);
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });
    enterCash();
    component.preview();
    const key = 'cash-allocation:synthetic-backend:test:1453:1';
    const newer = JSON.parse(sessionStorage.getItem(key)!);
    newer.request.idempotencyKey = 'different-transaction';
    const stored = JSON.stringify(newer);
    sessionStorage.setItem(key, stored);
    read.next(receipt);
    read.complete();
    expect(sessionStorage.getItem(key)).toBe(stored);
  });

  it('restores an unresolved transaction after reloading and retries the same identity', () => {
    service.createCashAllocation.mockReturnValueOnce(throwError(() => ({ status: 0 })));
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });
    enterCash();
    component.preview();
    const request = service.createCashAllocation.mock.calls[0][0];
    fixture.destroy();
    fixture = TestBed.createComponent(CashAllocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.canRetryPost).toBe(true);
    expect(component.allocationForm.disabled).toBe(true);
    component.retryPosting();
    expect(service.createCashAllocation.mock.calls[1][0]).toEqual(request);
    expect(component.receipt).toEqual(receipt);
    expect(sessionStorage.getItem('cash-allocation:synthetic-backend:test:1453:1')).toBeNull();
  });

  it('restores receipt-only recovery across reload without creating again', () => {
    service.getCashAllocation.mockReturnValueOnce(throwError(() => ({ status: 500 })));
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });
    enterCash();
    component.preview();
    fixture.destroy();
    fixture = TestBed.createComponent(CashAllocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.retryPosting();
    expect(service.createCashAllocation).toHaveBeenCalledTimes(1);
    expect(service.getCashAllocation).toHaveBeenLastCalledWith(77);
    expect(component.receipt).toEqual(receipt);
  });

  it('does not restore another tenant or user transaction', () => {
    service.createCashAllocation.mockReturnValueOnce(throwError(() => ({ status: 0 })));
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });
    enterCash();
    component.preview();
    fixture.destroy();
    const settings = TestBed.inject(SettingsService) as unknown as { tenantIdentifier: string };
    settings.tenantIdentifier = 'other-tenant';
    fixture = TestBed.createComponent(CashAllocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.canRetryPost).toBe(false);
    expect(component.allocationForm.enabled).toBe(true);
  });

  it('does not submit when recovery storage is unavailable', () => {
    const save = jest.spyOn(sessionStorage, 'setItem').mockImplementation(() => {
      throw new Error('Storage unavailable');
    });
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });
    try {
      enterCash();
      component.preview();
      expect(service.createCashAllocation).not.toHaveBeenCalled();
    } finally {
      save.mockRestore();
    }
  });

  it('retains unknown backend parameter validation messages', () => {
    service.previewCashAllocation.mockReturnValueOnce(
      throwError(() => ({
        status: 400,
        error: {
          errors: [
            {
              userMessageGlobalisationCode: 'validation.msg.note.invalid',
              defaultUserMessage: 'Enter a valid allocation note.'
            }
          ]
        }
      }))
    );
    enterCash();
    component.preview();
    expect(component.errorMessage).toBe('Enter a valid allocation note.');
  });

  it('allows correcting a definitive create rejection without displaying success', () => {
    service.createCashAllocation.mockReturnValueOnce(throwError(() => ({ status: 403, error: {} })));
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });
    enterCash();
    component.preview();
    expect(component.receipt).toBeUndefined();
    expect(service.getCashAllocation).not.toHaveBeenCalled();
    expect(component.canRetryPost).toBe(false);
    expect(component.allocationForm.enabled).toBe(true);
  });

  it.each([
    { ...receipt, status: 'PENDING' },
    { ...receipt, id: 999 }
  ])('does not display an incomplete or mismatched receipt as success', (response) => {
    service.getCashAllocation.mockReturnValueOnce(of(response));
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });
    enterCash();
    component.preview();
    expect(component.receipt).toBeUndefined();
    expect(component.errorMessage).toBe('cashAllocation.errors.receipt');
    component.retryPosting();
    expect(service.createCashAllocation).toHaveBeenCalledTimes(1);
    expect(service.getCashAllocation).toHaveBeenLastCalledWith(77);
    expect(component.receipt).toEqual(receipt);
  });

  it('does not reuse the initial catalog if the selected response omits that currency', () => {
    fixture.destroy();
    service.getCashAllocationContext
      .mockReset()
      .mockReturnValueOnce(of(context))
      .mockReturnValueOnce(of({ ...context, currencies: [context.currencies[1]] }));
    fixture = TestBed.createComponent(CashAllocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.canPreview).toBe(false);
    expect(component.denominations.length).toBe(0);
    expect(component.errorMessage).toBe('cashAllocation.errors.context');
  });

  it('localizes a missing accounting mapping without exposing its internal identifier', () => {
    enterCash();
    service.previewCashAllocation.mockReturnValueOnce(
      throwError(() => ({
        status: 404,
        error: {
          userMessageGlobalisationCode: 'error.msg.financialActivityAccount.not.found',
          defaultUserMessage: 'Internal activity ID 300'
        }
      }))
    );
    component.preview();
    expect(component.errorMessage).toBe('cashAllocation.errors.accounting');
    expect(service.createCashAllocation).not.toHaveBeenCalled();
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
});
