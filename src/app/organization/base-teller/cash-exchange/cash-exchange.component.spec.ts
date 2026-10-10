/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { of, Subject, throwError } from 'rxjs';
import { beforeEach, afterEach, describe, expect, it, jest } from '@jest/globals';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { CashExchangeComponent } from './cash-exchange.component';
import { CashExchangeService } from './cash-exchange.service';
import { CashExchangeConfirmDialogComponent } from './cash-exchange-confirm-dialog.component';
import { ExchangeContext, ExchangeInventory, ExchangePreview, ExchangeRecord } from './cash-exchange.models';
import { environment } from 'environments/environment';

const context: ExchangeContext = {
  tellers: [{ id: 7, tellerId: 2, name: 'Cashier', code: 'cashier', officeId: 1 }],
  currencies: [{ code: 'EUR', name: 'Euro', decimalPlaces: 2 }]
};
const inventory: ExchangeInventory = {
  cashierId: 7,
  currencyCode: 'EUR',
  decimalPlaces: 2,
  denominations: [
    { denominationId: 'a', type: 'COIN', value: '0.30', availableQuantity: 5 },
    { denominationId: 'b', type: 'COIN', value: '0.10', availableQuantity: 20 }
  ]
};
const preview: ExchangePreview = {
  cashierId: 7,
  currencyCode: 'EUR',
  receivedAmount: '0.30',
  deliveredAmount: '0.30',
  balanced: true,
  netMonetaryEffect: 0,
  receivedDenominations: [{ denominationId: 'a', type: 'COIN', value: '.30', quantity: 1, amount: '.30' }],
  deliveredDenominations: [{ denominationId: 'b', type: 'COIN', value: '.10', quantity: 3, amount: '.30' }]
};
const record: ExchangeRecord = {
  id: 42,
  receiptNumber: 'CE-42',
  status: 'COMPLETED',
  businessDate: '2026-10-09',
  officeId: 1,
  tellerId: 2,
  cashierId: 7,
  tellerName: 'Cashier',
  currencyCode: 'EUR',
  receivedAmount: '.30',
  deliveredAmount: '.30',
  processedBy: 1,
  processedByUsername: 'operator',
  processedAt: '2026-10-09T10:00:00Z',
  receivedDenominations: preview.receivedDenominations,
  deliveredDenominations: preview.deliveredDenominations
};

describe('CashExchangeComponent', () => {
  let fixture: ComponentFixture<CashExchangeComponent>;
  let component: CashExchangeComponent;
  let service: {
    context: jest.MockedFunction<CashExchangeService['context']>;
    denominations: jest.MockedFunction<CashExchangeService['denominations']>;
    preview: jest.MockedFunction<CashExchangeService['preview']>;
    create: jest.MockedFunction<CashExchangeService['create']>;
    receipt: jest.MockedFunction<CashExchangeService['receipt']>;
  };
  let closed: Subject<boolean>;
  let dialog: { open: jest.Mock };
  const rbac = environment.productionModeEnableRBAC;
  beforeEach(async () => {
    environment.productionModeEnableRBAC = true;
    closed = new Subject<boolean>();
    service = {
      context: jest.fn(() => of(context)),
      denominations: jest.fn(() => of(inventory)),
      preview: jest.fn(() => of(preview)),
      create: jest.fn(() => of(record)),
      receipt: jest.fn(() => of(record))
    };
    dialog = { open: jest.fn(() => ({ afterClosed: () => closed })) };
    await TestBed.configureTestingModule({ imports: [
        CashExchangeComponent,
        TranslateModule.forRoot()
      ], providers: [
        provideNoopAnimations(),
        { provide: CashExchangeService, useValue: service },
        { provide: MatDialog, useValue: dialog },
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions: ['ALL_FUNCTIONS'] }) } }
      ] }).compileComponents();
    fixture = TestBed.createComponent(CashExchangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  afterEach(() => {
    environment.productionModeEnableRBAC = rbac;
    jest.useRealTimers();
    jest.restoreAllMocks();
  });
  function select() {
    component.form.controls.cashierId.setValue(7);
    component.form.controls.currencyCode.setValue('EUR');
  }
  function balance() {
    select();
    component.form.controls.received.at(0).setValue(1);
    component.form.controls.delivered.at(1).setValue(3);
  }
  it('does not allow a read-only user to preview or create', () => {
    jest
      .spyOn(TestBed.inject(AuthenticationService), 'getCredentials')
      .mockReturnValue({ permissions: ['READ_BASE_TELLER_CASH_EXCHANGE'] } as never);
    balance();
    component.finish();
    expect(component.canFinish).toBe(false);
    expect(service.preview).not.toHaveBeenCalled();
    expect(component.hasPermission('REPRINT')).toBe(false);
  });
  it('loads context without hardcoded selection or inventory', () => {
    expect(service.context).toHaveBeenCalledTimes(1);
    expect(component.context).toEqual(context);
    expect(service.denominations).not.toHaveBeenCalled();
  });
  it('loads the selected drawer and currency and resets quantities on a context change', () => {
    balance();
    expect(service.denominations).toHaveBeenCalledWith(7, 'EUR');
    component.form.controls.cashierId.setValue(7);
    expect(component.total('received')).toBe('0.00');
  });
  it('ignores stale inventory responses when selections change', () => {
    const first = new Subject<ExchangeInventory>();
    service.denominations.mockReturnValueOnce(first);
    select();
    component.form.controls.cashierId.setValue(8);
    first.next(inventory);
    expect(component.inventory).toBeUndefined();
  });
  it('requires positive exactly equal totals and valid whole quantities', () => {
    select();
    expect(component.canFinish).toBe(false);
    component.form.controls.received.at(0).setValue(1);
    component.form.controls.delivered.at(1).setValue(2);
    expect(component.total('received')).toBe('0.30');
    expect(component.total('delivered')).toBe('0.20');
    expect(component.canFinish).toBe(false);
    component.form.controls.delivered.at(1).setValue(3);
    expect(component.canFinish).toBe(true);
    component.form.controls.received.at(0).setValue(0.5);
    expect(component.canFinish).toBe(false);
  });
  it('previews once, opens confirmation with backend totals and waits for confirmation', () => {
    balance();
    component.finish();
    component.finish();
    expect(service.preview).toHaveBeenCalledTimes(1);
    expect(dialog.open).toHaveBeenCalledWith(
      CashExchangeConfirmDialogComponent,
      expect.objectContaining({ data: { tellerName: 'Cashier', preview } })
    );
    expect(service.create).not.toHaveBeenCalled();
    closed.next(false);
    expect(component.busy).toBe(false);
    expect(component.form.enabled).toBe(true);
  });
  it('does not show confirmation for an invalid backend preview', () => {
    service.preview.mockReturnValue(of({ ...preview, balanced: false }));
    balance();
    component.finish();
    expect(dialog.open).not.toHaveBeenCalled();
    expect(service.create).not.toHaveBeenCalled();
    expect(component.error).toBe('cashExchange.unavailable');
  });
  it('creates once with the previewed request and reloads authoritative inventory', () => {
    const pending = new Subject<ExchangeRecord>();
    service.create.mockReturnValue(pending);
    balance();
    component.finish();
    closed.next(true);
    closed.complete();
    component.retry();
    component.finish();
    expect(service.create).toHaveBeenCalledTimes(1);
    expect(service.create.mock.calls[0][0]).toEqual(service.preview.mock.calls[0][0]);
    pending.next(record);
    pending.complete();
    expect(component.result).toEqual(record);
    expect(service.denominations).toHaveBeenCalledTimes(2);
    expect(component.total('received')).toBe('0.00');
    expect(component.pendingRequest).toBeUndefined();
  });
  it('retains the exact key and locks editing after an uncertain create outcome', () => {
    service.create.mockReturnValueOnce(throwError(() => ({ status: 0 })));
    balance();
    component.finish();
    closed.next(true);
    closed.complete();
    expect(component.form.disabled).toBe(true);
    const request = component.pendingRequest;
    component.retry();
    expect(service.create.mock.calls[1][0]).toBe(request);
    expect(component.result).toEqual(record);
  });
  it('blocks quantities above available stock before preview', () => {
    balance();
    component.form.controls.received.at(0).setValue(7);
    component.form.controls.delivered.at(1).setValue(21);
    expect(component.balanced).toBe(true);
    expect(component.canFinish).toBe(false);
    component.finish();
    expect(service.preview).not.toHaveBeenCalled();
  });
  it.each([
    [
      403,
      '',
      'forbidden'
    ],
    [
      400,
      'inventory.insufficient',
      'insufficient'
    ],
    [
      400,
      'cashier.forbidden',
      'invalidTeller'
    ],
    [
      400,
      'currency.unsupported',
      'invalidCurrency'
    ],
    [
      409,
      '',
      'conflict'
    ],
    [
      400,
      'idempotency.conflict',
      'duplicate'
    ],
    [
      400,
      'amount.mismatch',
      'notBalanced'
    ],
    [
      500,
      '',
      'unavailable'
    ]
  ])('maps %s / %s to safe localized feedback', (status, code, key) => {
    service.preview.mockReturnValue(
      throwError(() => ({
        status,
        error: {
          developerMessage: 'SQL secret',
          errors: [
            {
              userMessageGlobalisationCode: code
                ? 'error.msg.base.teller.cash.exchange.' + code
                : 'error.msg.not.authorised'
            }
          ]
        }
      }))
    );
    balance();
    component.finish();
    expect(component.error).toBe('cashExchange.' + key);
    expect(component.busy).toBe(false);
  });
  it('retrieves receipt from backend before printing', () => {
    jest.useFakeTimers();
    const print = jest.spyOn(window, 'print').mockImplementation(() => {});
    component.result = record;
    component.printReceipt();
    expect(service.receipt).toHaveBeenCalledWith(42);
    expect(component.receipt).toEqual(record);
    jest.runAllTimers();
    expect(print).toHaveBeenCalledTimes(1);
  });
  it('decodes real backend text errors and preserves domain feedback on HTTP 403', () => {
    service.preview.mockReturnValue(
      throwError(() => ({
        status: 403,
        error: JSON.stringify({
          errors: [{ userMessageGlobalisationCode: 'error.msg.base.teller.cash.exchange.inventory.insufficient' }]
        })
      }))
    );
    balance();
    component.finish();
    expect(component.error).toBe('cashExchange.insufficient');
  });
  it('shows context loading and handles network failure', () => {
    const pending = new Subject<ExchangeContext>();
    service.context.mockReturnValue(pending);
    component.loadContext();
    expect(component.loading).toBe(true);
    pending.error({ status: 0 });
    expect(component.loading).toBe(false);
    expect(component.error).toBe('cashExchange.unavailable');
  });
  it('keeps success and receipt reference if inventory refresh fails', () => {
    balance();
    service.denominations.mockReturnValue(throwError(() => ({ status: 500 })));
    component.finish();
    closed.next(true);
    expect(component.result?.receiptNumber).toBe('CE-42');
    expect(component.inventory).toBeUndefined();
    expect(component.canFinish).toBe(false);
    expect(component.error).toBe('cashExchange.unavailable');
  });
});
