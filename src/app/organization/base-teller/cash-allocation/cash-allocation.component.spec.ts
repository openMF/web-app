/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { By } from '@angular/platform-browser';
import { MatSelect } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { SettingsService } from 'app/settings/settings.service';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import {
  BaseTellerService,
  CashAllocationContext,
  CashAllocationCurrency,
  CashAllocationPreview,
  CashAllocationReceipt
} from '../base-teller.service';
import { CashAllocationComponent } from './cash-allocation.component';

describe('CashAllocationComponent', () => {
  let component: CashAllocationComponent;
  let fixture: ComponentFixture<CashAllocationComponent>;
  let service: jest.Mocked<BaseTellerService>;
  const settings = { server: '/fineract-provider', tenantIdentifier: 'default', language: { code: 'en-US' } };
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
    settings.tenantIdentifier = 'default';
    service = {
      getCashAllocationContext: jest.fn((_officeId, currencyCode) =>
        of({
          ...context,
          currencyCode: currencyCode ?? null,
          currencies: currencyCode
            ? context.currencies.filter((currency) => currency.code === currencyCode)
            : context.currencies
        })
      ),
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
        { provide: SettingsService, useValue: settings },
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

  function currencyOptions(): string[] {
    fixture.detectChanges();
    const select = fixture.debugElement.query(By.css('mat-select[formControlName="currencyCode"]'))
      .componentInstance as MatSelect;
    return select.options.map((option) => option.viewValue);
  }

  function selectCurrency(code: string): void {
    component.allocationForm.controls.currencyCode.setValue(code);
    component.currencyChanged();
  }

  function restart(): void {
    fixture.destroy();
    service.getCashAllocationContext.mockClear();
    fixture = TestBed.createComponent(CashAllocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('merges fresh selected-currency names and denominations without truncating or duplicating the catalog', () => {
    const updated = { ...context.currencies[1], name: 'Configured Yen', denominations: [
        { identifier: 'jpy-coin-500', type: 'COIN', value: 500, quantity: 0, subtotal: 0 }
      ] };
    service.getCashAllocationContext.mockReturnValueOnce(
      of({ ...context, currencyCode: 'JPY', currencies: [updated] })
    );
    selectCurrency('JPY');
    expect(component.context?.currencies.map((currency) => currency.code)).toEqual([
      'CRC',
      'JPY'
    ]);
    expect(component.selectedCurrency?.name).toBe('Configured Yen');
    expect(component.denominations.at(0).controls.denominationId.value).toBe('jpy-coin-500');
    expect(component.allocationForm.controls.currencyCode.value).toBe('JPY');
    selectCurrency('CRC');
    expect(service.getCashAllocationContext).toHaveBeenLastCalledWith(1, 'CRC');
    expect(component.denominations.at(0).controls.denominationId.value).toBe('crc-note-100');
    expect(component.context?.currencies).toHaveLength(2);
  });

  it('uses fresh selected-currency data on initial automatic selection', () => {
    const selected = { ...context.currencies[0], denominations: [context.currencies[0].denominations[1]] };
    service.getCashAllocationContext
      .mockReturnValueOnce(of({ ...context, currencyCode: null }))
      .mockReturnValueOnce(of({ ...context, currencies: [selected] }));
    restart();
    expect(component.denominations.length).toBe(1);
    expect(component.denominations.at(0).controls.denominationId.value).toBe('crc-coin-025');
    expect(component.context?.currencies).toHaveLength(2);
  });

  it.each([
    '',
    '   ',
    null
  ])('renders a localized label for a %s backend name while preserving the code', (name) => {
    service.getCashAllocationContext.mockReturnValueOnce(
      of({ ...context, currencyCode: 'JPY', currencies: [{ ...context.currencies[1], name }] })
    );
    selectCurrency('JPY');
    fixture.detectChanges();
    expect(currencyOptions()).toContain('JPY \u2014 Japanese Yen');
    expect(component.selectedCurrency?.code).toBe('JPY');
    expect(fixture.nativeElement.textContent).not.toMatch(/undefined|null/);
  });

  it('renders configured currency names and codes unchanged', () => {
    fixture.detectChanges();
    expect(currencyOptions()).toEqual([
      'CRC \u2014 Col\u00f3n',
      'JPY \u2014 Yen'
    ]);
  });

  it('uses the code as final fallback when no localized name is available', () => {
    const currency: CashAllocationCurrency = { ...context.currencies[1], code: 'ZZZ', name: null };
    service.getCashAllocationContext
      .mockReturnValueOnce(of({ ...context, currencyCode: null, currencies: [currency] }))
      .mockReturnValueOnce(of({ ...context, currencyCode: 'ZZZ', currencies: [currency] }));
    restart();
    expect(currencyOptions()).toEqual(['ZZZ \u2014 ZZZ']);
    expect(component.selectedCurrency?.code).toBe('ZZZ');
  });

  it('keeps enabled currencies visible independently of missing denominations', () => {
    service.getCashAllocationContext.mockReturnValueOnce(
      of({ ...context, currencyCode: 'JPY', currencies: [{ ...context.currencies[1], denominations: [] }] })
    );
    selectCurrency('JPY');
    fixture.detectChanges();
    expect(component.context?.currencies).toHaveLength(2);
    expect(component.denominations.length).toBe(0);
    expect(component.canPreview).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('cashAllocation.empty.denominations');
    expect(currencyOptions()).toContain('JPY \u2014 Yen');
  });

  it('loads an empty authoritative catalog without fabricating options or making a selected request', () => {
    service.getCashAllocationContext.mockReturnValueOnce(of({ ...context, currencyCode: null, currencies: [] }));
    restart();
    expect(service.getCashAllocationContext).toHaveBeenCalledTimes(1);
    expect(component.allocationForm.controls.currencyCode.value).toBe('');
    expect(component.isLoading).toBe(false);
    expect(component.canPreview).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('cashAllocation.empty.currencies');
  });

  it('removes duplicate currency codes from the authoritative catalog', () => {
    service.getCashAllocationContext.mockReturnValueOnce(
      of({ ...context, currencies: [
          ...context.currencies,
          context.currencies[0]
        ] })
    );
    restart();
    expect(component.context?.currencies.map((currency) => currency.code)).toEqual([
      'CRC',
      'JPY'
    ]);
  });

  it('clears a currency missing from a refreshed catalog without silently selecting a different one', () => {
    service.getCashAllocationContext.mockReturnValueOnce(
      of({ ...context, currencyCode: null, currencies: [context.currencies[1]] })
    );
    component.retryContext();
    expect(component.context?.currencies.map((currency) => currency.code)).toEqual(['JPY']);
    expect(component.allocationForm.controls.currencyCode.value).toBe('');
    expect(component.denominations.length).toBe(0);
    expect(component.errorMessage).toBe('cashAllocation.errors.currencyUnavailable');
    selectCurrency('JPY');
    expect(component.selectedCurrency?.code).toBe('JPY');
    expect(component.errorMessage).toBe('');
  });

  it('blocks stale denominations when the selected-currency response omits the selection', () => {
    service.getCashAllocationContext.mockReturnValueOnce(of({ ...context, currencyCode: 'JPY', currencies: [] }));
    selectCurrency('JPY');
    expect(component.allocationForm.controls.currencyCode.value).toBe('');
    expect(component.denominations.length).toBe(0);
    expect(component.canPreview).toBe(false);
    expect(component.errorMessage).toBe('cashAllocation.errors.currencyUnavailable');
    expect(component.isLoading).toBe(false);
  });

  it.each([
    [
      401,
      'authentication'
    ],
    [
      403,
      'noReadPermission'
    ],
    [
      404,
      'apiUnavailable'
    ],
    [
      500,
      'context'
    ],
    [
      503,
      'context'
    ],
    [
      0,
      'context'
    ]
  ])('handles API status %s without reporting missing configuration and allows recovery', (status, key) => {
    service.getCashAllocationContext.mockReturnValueOnce(throwError(() => ({ status, error: {} })));
    selectCurrency('JPY');
    expect(component.errorMessage).toBe('cashAllocation.errors.' + key);
    expect(component.isLoading).toBe(false);
    expect(component.canPreview).toBe(false);
    expect(component.denominations.length).toBe(0);
    component.retryContext();
    expect(component.selectedCurrency?.code).toBe('JPY');
    expect(component.errorMessage).toBe('');
  });

  it.each([
    'office.required',
    'office.forbidden'
  ])('identifies backend %s errors as office errors', (code) => {
    service.getCashAllocationContext.mockReturnValueOnce(
      throwError(() => ({
        status: 400,
        error: { errors: [{ userMessageGlobalisationCode: 'error.msg.base.teller.cash.allocation.' + code }] }
      }))
    );
    selectCurrency('JPY');
    expect(component.errorMessage).toBe('cashAllocation.errors.office');
    expect(component.context).toBeUndefined();
  });

  it('cancels slow requests during rapid currency switching and accepts only the latest response', () => {
    const slow = new Subject<CashAllocationContext>();
    const latest = new Subject<CashAllocationContext>();
    service.getCashAllocationContext.mockReturnValueOnce(slow).mockReturnValueOnce(latest);
    selectCurrency('JPY');
    expect(component.isLoading).toBe(true);
    expect(component.denominations.length).toBe(0);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('mat-select[formControlName="currencyCode"]')).toBeTruthy();
    selectCurrency('CRC');
    expect(slow.observed).toBe(false);
    expect(component.isLoading).toBe(true);
    slow.next({ ...context, currencyCode: 'JPY', currencies: [context.currencies[1]] });
    slow.complete();
    expect(component.isLoading).toBe(true);
    latest.next({ ...context, currencyCode: 'CRC', currencies: [context.currencies[0]] });
    latest.complete();
    expect(component.selectedCurrency?.code).toBe('CRC');
    expect(component.denominations.at(0).controls.denominationId.value).toBe('crc-note-100');
    expect(component.isLoading).toBe(false);
    expect(component.context?.currencies).toHaveLength(2);
  });

  it('cancels the initial selected request if the user selects another currency', () => {
    const slow = new Subject<CashAllocationContext>();
    service.getCashAllocationContext
      .mockReturnValueOnce(of({ ...context, currencyCode: null }))
      .mockReturnValueOnce(slow);
    restart();
    expect(component.isLoading).toBe(true);
    expect(component.context?.currencies).toHaveLength(2);
    selectCurrency('JPY');
    expect(slow.observed).toBe(false);
    expect(component.selectedCurrency?.code).toBe('JPY');
    expect(component.isLoading).toBe(false);
  });

  it('cancels pending requests when destroyed', () => {
    const slow = new Subject<CashAllocationContext>();
    service.getCashAllocationContext.mockReturnValueOnce(slow);
    selectCurrency('JPY');
    fixture.destroy();
    expect(slow.observed).toBe(false);
    expect(component.isLoading).toBe(false);
  });

  it.each([
    undefined,
    0,
    -1,
    NaN,
    1.5
  ])('rejects invalid authenticated office %s without requesting a guessed office', (officeId) => {
    const authentication = TestBed.inject(AuthenticationService);
    jest
      .spyOn(authentication, 'getCredentials')
      .mockReturnValue({ ...authentication.getCredentials(), officeId } as ReturnType<
        AuthenticationService['getCredentials']
      >);
    service.getCashAllocationContext.mockClear();
    component.retryContext();
    expect(service.getCashAllocationContext).not.toHaveBeenCalled();
    expect(component.context).toBeUndefined();
    expect(component.errorMessage).toBe('cashAllocation.errors.office');
    expect(component.canPreview).toBe(false);
    expect(component.isLoading).toBe(false);
  });

  it('rejects a response for a different office', () => {
    service.getCashAllocationContext.mockReturnValueOnce(of({ ...context, officeId: 2 }));
    selectCurrency('JPY');
    expect(component.context).toBeUndefined();
    expect(component.errorMessage).toBe('cashAllocation.errors.office');
    expect(component.denominations.length).toBe(0);
  });

  it('discards the previous tenant catalog before loading another tenant', () => {
    const slow = new Subject<CashAllocationContext>();
    settings.tenantIdentifier = 'another-tenant';
    service.getCashAllocationContext.mockReturnValueOnce(slow);
    selectCurrency('JPY');
    expect(service.getCashAllocationContext).toHaveBeenLastCalledWith(1, undefined);
    expect(component.context).toBeUndefined();
    expect(component.allocationForm.controls.currencyCode.value).toBe('');
    slow.next({ ...context, currencies: [] });
    slow.complete();
    expect(component.context?.currencies).toEqual([]);
  });

  it('rejects a slow response if the tenant changed while it was pending', () => {
    const slow = new Subject<CashAllocationContext>();
    service.getCashAllocationContext.mockReturnValueOnce(slow);
    selectCurrency('JPY');
    settings.tenantIdentifier = 'another-tenant';
    slow.next({ ...context, currencyCode: 'JPY', currencies: [context.currencies[1]] });
    slow.complete();
    expect(component.context).toBeUndefined();
    expect(component.errorMessage).toBe('cashAllocation.errors.office');
    expect(component.isLoading).toBe(false);
  });
});
