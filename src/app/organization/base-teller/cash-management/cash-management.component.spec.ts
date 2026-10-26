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
import { Subject, of } from 'rxjs';

import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { SettingsService } from 'app/settings/settings.service';
import { environment } from 'environments/environment';
import { BaseTellerService } from '../base-teller.service';
import { CashManagementComponent } from './cash-management.component';
import {
  CashierClosingContext,
  CashierClosingReceipt,
  CashierClosingRequest,
  CashOperation,
  CashOperationRequest
} from './cash-management.models';

describe('CashManagementComponent', () => {
  const originalRbac = environment.productionModeEnableRBAC;

  const context = (currencyCode = 'USD'): CashierClosingContext => ({
    businessDate: '2026-09-23',
    officeId: 1,
    officeName: 'Head Office',
    tellerId: 2,
    tellerName: 'Main Teller',
    cashierId: 3,
    cashierName: 'Cashier',
    currencyCode,
    openingBalance: 0,
    cashInflows: 100,
    cashOutflows: 0,
    previousSettlements: 0,
    expectedAmount: 100,
    eligibleChecks: [],
    status: 'OPEN'
  });

  const receipt = (status: 'OPEN' | 'COMPLETED'): CashierClosingReceipt => ({
    id: 4,
    reference: 'CLOSE-4',
    businessDate: '2026-09-23',
    officeId: 1,
    officeName: 'Head Office',
    tellerId: 2,
    tellerName: 'Main Teller',
    cashierId: 3,
    cashierName: 'Cashier',
    currencyCode: 'USD',
    cashTotal: 100,
    checkTotal: 0,
    expectedAmount: 100,
    actualAmount: 100,
    difference: 0,
    differenceType: 'BALANCED',
    authorizedBy: 5,
    authorizedByUsername: 'head-cashier',
    status,
    denominations: [],
    checks: []
  });

  afterEach(() => {
    environment.productionModeEnableRBAC = originalRbac;
    TestBed.resetTestingModule();
  });

  function createComponent(service: Record<string, jest.Mock>, view = 'closing', permissions = [
      'CREATE_CASHIER_CLOSING',
      'AUTHORIZE_CASHIER_CLOSING'
    ]): CashManagementComponent {
    environment.productionModeEnableRBAC = true;
    TestBed.configureTestingModule({
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { data: { view } } } },
        { provide: BaseTellerService, useValue: service },
        {
          provide: AuthenticationService,
          useValue: { getCredentials: () => ({ permissions }) }
        },
        { provide: SettingsService, useValue: { businessDate: '2026-09-23' } },
        { provide: MatDialog, useValue: { open: jest.fn() } },
        { provide: TranslateService, useValue: { instant: (key: string) => key } },
        { provide: ChangeDetectorRef, useValue: { markForCheck: jest.fn() } }
      ]
    });
    return TestBed.runInInjectionContext(() => new CashManagementComponent());
  }

  it('rotates the idempotency key after a completed closing', () => {
    const keys: string[] = [];
    const closeCashier = jest.fn((payload: CashierClosingRequest) => {
      keys.push(payload.idempotencyKey);
      return of(receipt('COMPLETED'));
    });
    const component = createComponent({ closeCashier });
    component.closingContext = context();

    component.submitClosing();
    component.submitClosing();

    expect(keys[0]).not.toBe(keys[1]);
  });

  it('retains the idempotency key while a closing remains unresolved', () => {
    const keys: string[] = [];
    const closeCashier = jest.fn((payload: CashierClosingRequest) => {
      keys.push(payload.idempotencyKey);
      return of(receipt('OPEN'));
    });
    const component = createComponent({ closeCashier });
    component.closingContext = context();

    component.submitClosing();
    component.submitClosing();

    expect(keys[0]).toBe(keys[1]);
  });

  it('rotates the idempotency key after a completed cash operation', () => {
    const keys: string[] = [];
    const operationReceipt: CashOperation = {
      id: 5,
      reference: 'DEPOSIT-5',
      transactionType: 'BANK_DEPOSIT',
      businessDate: '2026-09-23',
      currencyCode: 'USD',
      amount: 100,
      cashTotal: 100,
      checkTotal: 0,
      officeId: 1,
      tellerId: 2,
      cashierId: 3,
      cashierName: 'Cashier',
      actorId: 5,
      actorUsername: 'head-cashier',
      status: 'COMPLETED'
    };
    const createCashOperation = jest.fn((payload: CashOperationRequest) => {
      keys.push(payload.idempotencyKey);
      return of(operationReceipt);
    });
    const component = createComponent({ createCashOperation }, 'bank-deposit', ['CREATE_CASH_DEPOSIT']);
    component.closingContext = context();

    component.submitOperation();
    component.submitOperation();

    expect(keys[0]).not.toBe(keys[1]);
  });

  it('ignores a context response after a filter changes', () => {
    const firstResponse = new Subject<CashierClosingContext>();
    const secondResponse = new Subject<CashierClosingContext>();
    const getCashierClosingContext = jest
      .fn()
      .mockReturnValueOnce(firstResponse.asObservable())
      .mockReturnValueOnce(secondResponse.asObservable());
    const component = createComponent({
      getCashManagementTellers: jest.fn(() => of([])),
      getCashManagementCurrencies: jest.fn(() => of({ selectedCurrencyOptions: [] })),
      getCashierClosingContext
    });
    component.ngOnInit();
    component.contextForm.setValue({
      businessDate: '2026-09-23',
      tellerId: 2,
      cashierId: 3,
      currencyCode: 'USD'
    });

    component.loadContext();
    expect(component.isLoading).toBe(true);
    component.contextForm.controls.currencyCode.setValue('EUR');
    expect(component.isLoading).toBe(false);
    firstResponse.next(context('USD'));
    expect(component.closingContext).toBeUndefined();

    component.loadContext();
    secondResponse.next(context('EUR'));
    expect(component.closingContext?.currencyCode).toBe('EUR');
  });
});
