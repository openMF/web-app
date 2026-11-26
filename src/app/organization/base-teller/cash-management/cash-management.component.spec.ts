/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectorRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { Subject, of, throwError } from 'rxjs';

import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { SettingsService } from 'app/settings/settings.service';
import { environment } from 'environments/environment';
import { BaseTellerService } from '../base-teller.service';
import { CashManagementComponent } from './cash-management.component';
import { CashierClosingContext, CashierClosingReceipt, CashOperation } from './cash-management.models';

describe('CashManagementComponent closing eligibility', () => {
  const originalRbac = environment.productionModeEnableRBAC;
  const context = (): CashierClosingContext => ({
    businessDate: '2026-11-26',
    officeId: 1,
    officeName: 'Office',
    tellerId: 2,
    tellerName: 'Teller',
    cashierId: 3,
    cashierName: 'Cashier',
    currencyCode: 'USD',
    openingBalance: 100,
    cashInflows: 0,
    cashOutflows: 0,
    previousSettlements: 0,
    expectedAmount: 100,
    eligibleChecks: [],
    status: 'OPEN',
    registerStatus: 'OPEN'
  });
  const receipt = (): CashierClosingReceipt => ({
    ...context(),
    id: 4,
    reference: 'CCR-4',
    cashTotal: 100,
    checkTotal: 0,
    actualAmount: 100,
    difference: 0,
    differenceType: 'BALANCED',
    authorizedBy: 5,
    authorizedByUsername: 'authorizer',
    authorizedOn: '2026-11-26T10:00:00Z',
    denominations: [],
    checks: [],
    status: 'COMPLETED'
  });
  function setup(permissions = [
      'READ_CASHIER_CLOSING',
      'CREATE_CASHIER_CLOSING',
      'AUTHORIZE_CASHIER_CLOSING'
    ], view = 'closing') {
    environment.productionModeEnableRBAC = true;
    const service = {
      getCashManagementTellers: jest.fn(() => of([])),
      getCashManagementCurrencies: jest.fn(() => of({ selectedCurrencyOptions: [] })),
      getCashierClosingContext: jest.fn(() => of(context())),
      closeCashier: jest.fn(() => of(receipt())),
      getCashierClosing: jest.fn(() => of(receipt())),
      createCashOperation: jest.fn()
    };
    const confirmation = new Subject<{ confirm?: boolean } | undefined>();
    const close = jest.fn(() => confirmation.next(undefined));
    const open = jest.fn(() => ({ afterClosed: () => confirmation.asObservable(), close }));
    const settings = { businessDate: '2026-11-26', server: 'synthetic', tenantIdentifier: 'test' };
    TestBed.configureTestingModule({
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { data: { view } } } },
        { provide: BaseTellerService, useValue: service },
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions, userId: 5 }) } },
        { provide: SettingsService, useValue: settings },
        { provide: MatDialog, useValue: { open } },
        { provide: TranslateService, useValue: { instant: (key: string) => key } },
        { provide: ChangeDetectorRef, useValue: { markForCheck: jest.fn() } }
      ]
    });
    const component = TestBed.runInInjectionContext(() => new CashManagementComponent());
    component.ngOnInit();
    component.contextForm.setValue({ businessDate: '2026-11-26', tellerId: 2, cashierId: 3, currencyCode: 'USD' });
    component.loadContext();
    component.denominations.at(0)?.setValue({ value: 1, quantity: 100 });
    return { component, service, confirmation, open, settings };
  }
  afterEach(() => {
    environment.productionModeEnableRBAC = originalRbac;
    sessionStorage.clear();
    TestBed.resetTestingModule();
  });

  it.each([
    'NOT_OPENED',
    undefined,
    'UNKNOWN'
  ])('blocks buttons, review and direct submission for %s', (status) => {
    const { component, service, open } = setup();
    component.closingContext = { ...context(), registerStatus: status as CashierClosingContext['registerStatus'] };
    expect(component.canFinalizeClosing).toBe(false);
    expect(component.closingInputsDisabled).toBe(true);
    component.reviewAndSubmit();
    component.submitClosing();
    expect(open).not.toHaveBeenCalled();
    expect(service.closeCashier).not.toHaveBeenCalled();
  });
  it('fails safely before context loads and for malformed positions', () => {
    const { component, service } = setup();
    component.hasLoaded = false;
    component.submitClosing();
    component.hasLoaded = true;
    component.closingContext = { ...context(), expectedAmount: NaN };
    component.submitClosing();
    expect(service.closeCashier).not.toHaveBeenCalled();
    expect(component.registerStatus).toBe('UNAVAILABLE');
  });
  it('closes an eligible register, immediately keeps the receipt and blocks a second command', () => {
    const { component, service } = setup();
    component.submitClosing();
    component.submitClosing();
    expect(service.closeCashier).toHaveBeenCalledTimes(1);
    expect(component.registerStatus).toBe('COMPLETED');
    expect(component.closingReceipt?.reference).toBe('CCR-4');
    expect(component.canFinalizeClosing).toBe(false);
    expect(service.getCashierClosingContext).toHaveBeenCalledTimes(3);
  });
  it('permits an opened zero-balance register', () => {
    const { component, service } = setup();
    const zero = { ...context(), expectedAmount: 0, cashOutflows: 100 };
    component.closingContext = zero;
    component.denominations.clear();
    service.getCashierClosingContext.mockReturnValue(of(zero));
    component.submitClosing();
    expect(service.closeCashier).toHaveBeenCalledTimes(1);
  });
  it('does not POST when confirmation is cancelled and prevents duplicate dialogs', () => {
    const { component, service, confirmation, open } = setup();
    component.reviewAndSubmit();
    component.reviewAndSubmit();
    expect(open).toHaveBeenCalledTimes(1);
    confirmation.next(undefined);
    expect(service.closeCashier).not.toHaveBeenCalled();
  });
  it.each([
    'NOT_OPENED',
    'COMPLETED'
  ])('aborts when eligibility changes to %s during confirmation', (status) => {
    const { component, service, confirmation } = setup();
    component.reviewAndSubmit();
    service.getCashierClosingContext.mockReturnValue(
      of({
        ...context(),
        registerStatus: status as 'NOT_OPENED' | 'COMPLETED',
        status: status === 'COMPLETED' ? 'COMPLETED' : 'OPEN'
      })
    );
    confirmation.next({ confirm: true });
    expect(service.closeCashier).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('web1232.closing.contextChanged');
  });
  it('aborts for a changed financial position and requires a new review', () => {
    const { component, service, confirmation } = setup();
    component.reviewAndSubmit();
    service.getCashierClosingContext.mockReturnValue(of({ ...context(), expectedAmount: 200, cashInflows: 100 }));
    confirmation.next({ confirm: true });
    expect(service.closeCashier).not.toHaveBeenCalled();
    expect(component.closingContext?.expectedAmount).toBe(200);
  });
  it('invalidates confirmation when declarations change', () => {
    const { component, service, confirmation } = setup();
    component.reviewAndSubmit();
    component.denominations.at(0).controls.quantity.setValue(99);
    confirmation.next({ confirm: true });
    expect(service.closeCashier).not.toHaveBeenCalled();
  });
  it('invalidates stale eligibility on cashier, teller, currency or date changes', () => {
    const { component, service } = setup();
    component.contextForm.controls.cashierId.setValue(99);
    component.submitClosing();
    expect(component.closingContext).toBeUndefined();
    expect(service.closeCashier).not.toHaveBeenCalled();
  });
  it('rejects mismatched context responses even when form events are suppressed', () => {
    const { component, service } = setup();
    component.contextForm.controls.currencyCode.setValue('EUR', { emitEvent: false });
    component.submitClosing();
    expect(service.closeCashier).not.toHaveBeenCalled();
  });
  it('rechecks permissions and business date after confirmation', () => {
    const permissions = [
      'READ_CASHIER_CLOSING',
      'CREATE_CASHIER_CLOSING',
      'AUTHORIZE_CASHIER_CLOSING'
    ];
    const { component, service, confirmation, settings } = setup(permissions);
    component.reviewAndSubmit();
    permissions.pop();
    settings.businessDate = '2026-11-27';
    confirmation.next({ confirm: true });
    expect(service.closeCashier).not.toHaveBeenCalled();
  });
  it('retains a confirmed receipt when the status refresh fails', () => {
    const { component, service } = setup();
    service.getCashierClosingContext
      .mockReturnValueOnce(of(context()))
      .mockReturnValue(throwError(() => new Error('network')));
    component.submitClosing();
    expect(component.registerStatus).toBe('COMPLETED');
    expect(component.closingReceipt?.id).toBe(4);
    expect(component.errorMessage).toBe('web1232.closing.refreshFailed');
    component.submitClosing();
    expect(service.closeCashier).toHaveBeenCalledTimes(1);
  });
  it('loads the completed receipt from persisted authoritative context', () => {
    const { component, service } = setup();
    service.getCashierClosingContext.mockReturnValue(
      of({ ...context(), status: 'COMPLETED', registerStatus: 'COMPLETED', closingId: 4 })
    );
    component.loadContext();
    expect(service.getCashierClosing).toHaveBeenCalledWith(4);
    expect(component.registerStatus).toBe('COMPLETED');
    expect(component.closingReceipt?.id).toBe(4);
  });
  it('never marks unknown or mismatched receipts completed', () => {
    const { component, service } = setup();
    service.closeCashier.mockReturnValue(of({ ...receipt(), cashierId: 99 }));
    component.submitClosing();
    expect(component.closingReceipt).toBeUndefined();
    expect(component.closingUnresolved).toBe(true);
    expect(component.canFinalizeClosing).toBe(false);
  });
  it('freezes an uncertain request across edits and read-only retries', () => {
    const { component, service } = setup();
    service.closeCashier.mockReturnValue(throwError(() => new Error('timeout')));
    component.submitClosing();
    const original = service.closeCashier.mock.calls[0];
    expect(component.contextForm.disabled).toBe(true);
    expect(component.assetForm.disabled).toBe(true);
    component.loadContext();
    component.submitClosing();
    component.retry();
    expect(service.closeCashier).toHaveBeenCalledTimes(1);
    expect(service.closeCashier.mock.calls[0]).toEqual(original);
    expect(sessionStorage.setItem).toHaveBeenCalledWith(
      expect.stringContaining('cashier-closing:'),
      expect.stringContaining('idempotencyKey')
    );
  });
  it('ignores stale context responses', () => {
    const { component, service } = setup();
    const response = new Subject<CashierClosingContext>();
    service.getCashierClosingContext.mockReturnValue(response);
    component.loadContext();
    component.contextForm.controls.currencyCode.setValue('EUR');
    response.next(context());
    expect(component.closingContext).toBeUndefined();
  });
  it.each([
    'mismatched cashier',
    'malformed position'
  ])('retries the context GET after a %s response', (failure) => {
    const { component, service } = setup();
    const invalid =
      failure === 'mismatched cashier' ? { ...context(), cashierId: 99 } : { ...context(), expectedAmount: NaN };
    service.getCashierClosingContext.mockReturnValueOnce(of(invalid)).mockReturnValue(of(context()));
    component.loadContext();
    expect(component.errorMessage).toBe('web1232.closing.statusUnavailable');
    expect(component.hasRetryAction).toBe(true);
    expect(component.closingContext).toBeUndefined();

    component.retry();

    expect(service.getCashierClosingContext).toHaveBeenCalledTimes(3);
    expect(component.closingContext).toEqual(context());
    expect(component.errorMessage).toBe('');
    expect(component.hasRetryAction).toBe(false);
    expect(service.closeCashier).not.toHaveBeenCalled();
  });
  it('keeps an unresolved-result error when no retry action is available', () => {
    const { component, service } = setup();
    service.closeCashier.mockReturnValue(of({ ...receipt(), cashierId: 99 }));
    component.submitClosing();
    expect(component.hasRetryAction).toBe(false);
    const reads = service.getCashierClosingContext.mock.calls.length;

    component.retry();

    expect(component.errorMessage).toBe('web1232.closing.unresolved');
    expect(service.getCashierClosingContext).toHaveBeenCalledTimes(reads);
    expect(service.closeCashier).toHaveBeenCalledTimes(1);
  });
  it('blocks simultaneous POSTs while the first is in flight', () => {
    const { component, service } = setup();
    const response = new Subject<CashierClosingReceipt>();
    service.closeCashier.mockReturnValue(response);
    component.submitClosing();
    component.submitClosing();
    expect(service.closeCashier).toHaveBeenCalledTimes(1);
  });
  it('keeps deposit eligibility independent of the closing opening status', () => {
    const { component, service } = setup(['CREATE_CASH_DEPOSIT'], 'bank-deposit');
    component.closingContext = { ...context(), registerStatus: 'NOT_OPENED' };
    service.createCashOperation.mockReturnValue(of({ status: 'COMPLETED' } as CashOperation));
    component.submitOperation();
    expect(service.createCashOperation).toHaveBeenCalledTimes(1);
    expect(component.closingInputsDisabled).toBe(false);
  });
  it('keeps an unresolved deposit identity bound to its original declarations', () => {
    const { component, service } = setup(['CREATE_CASH_DEPOSIT'], 'bank-deposit');
    service.createCashOperation.mockReturnValue(throwError(() => new Error('timeout')));
    component.submitOperation();
    component.denominations.at(0).controls.quantity.setValue(99);
    component.submitOperation();
    expect(service.createCashOperation).toHaveBeenCalledTimes(1);
    component.denominations.at(0).controls.quantity.setValue(100);
    component.submitOperation();
    expect(service.createCashOperation).toHaveBeenCalledTimes(2);
    expect(service.createCashOperation.mock.calls[0]).toEqual(service.createCashOperation.mock.calls[1]);
  });
  it('resolves a structured no-opening rejection without false success or unsafe retries', () => {
    const { component, service } = setup();
    service.closeCashier.mockReturnValue(
      throwError(() => ({
        error: { errors: [{ userMessageGlobalisationCode: 'error.msg.base.teller.closing.not.opened' }] }
      }))
    );
    service.getCashierClosingContext
      .mockReturnValueOnce(of(context()))
      .mockReturnValue(of({ ...context(), registerStatus: 'NOT_OPENED' }));
    component.submitClosing();
    expect(component.registerStatus).toBe('NOT_OPENED');
    expect(component.closingUnresolved).toBe(false);
    expect(component.closingReceipt).toBeUndefined();
    component.submitClosing();
    expect(service.closeCashier).toHaveBeenCalledTimes(1);
  });
});
