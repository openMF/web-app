/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { environment } from 'environments/environment';
import { CashInventoryComponent } from './cash-inventory.component';
import { CashInventoryContext, CashInventoryRow, CashInventoryService } from './cash-inventory.service';

describe('CashInventoryComponent', () => {
  let fixture: ComponentFixture<CashInventoryComponent>;
  let component: CashInventoryComponent;
  let service: jest.Mocked<CashInventoryService>;
  let authenticationService: { getCredentials: jest.Mock };

  const context: CashInventoryContext = {
    custodians: [
      { key: 'TELLER:10', type: 'TELLER', resourceId: 10, code: 'ada', name: 'Ada Teller' },
      { key: 'VAULT:1', type: 'VAULT', resourceId: 1, code: '1', name: 'Safe/Vault - Head Office' }
    ],
    transactionTypes: [
      { code: 'CASH', name: 'Cash' },
      { code: 'CHECK', name: 'Check' }
    ],
    currencies: [
      { code: 'MXN', name: 'Mexican Peso', decimalPlaces: 2 },
      { code: 'USD', name: 'US Dollar', decimalPlaces: 2 }
    ]
  };
  const rows: CashInventoryRow[] = [
    {
      custodianKey: 'TELLER:10',
      custodianType: 'TELLER',
      resourceId: 10,
      userId: 7,
      userCode: 'ada',
      name: 'Ada Teller',
      inventoryType: 'CASH',
      currencyCode: 'MXN',
      decimalPlaces: 2,
      initialBalance: 50000,
      accumulatedInflows: 20000,
      accumulatedOutflows: 15000,
      cutOffs: 10000,
      balance: 45000,
      lastCutOffAt: '2026-10-06T08:00:00Z',
      lastCutOffAmount: 10000,
      asOf: '2026-10-06T09:00:00Z'
    },
    {
      custodianKey: 'TELLER:10',
      custodianType: 'TELLER',
      resourceId: 10,
      userId: 7,
      userCode: 'ada',
      name: 'Ada Teller',
      inventoryType: 'CHECK',
      currencyCode: 'USD',
      decimalPlaces: 2,
      initialBalance: 100,
      accumulatedInflows: 50,
      accumulatedOutflows: 25,
      cutOffs: 10,
      balance: 115,
      lastCutOffAt: null,
      lastCutOffAmount: null,
      asOf: '2026-10-06T09:00:00Z'
    }
  ];

  beforeEach(async () => {
    environment.productionModeEnableRBAC = true;
    service = {
      getContext: jest.fn(() => of(context)),
      getInventory: jest.fn(() => of(rows))
    } as unknown as jest.Mocked<CashInventoryService>;
    authenticationService = {
      getCredentials: jest.fn(() => ({ permissions: ['READ_BASE_TELLER_CASH_INVENTORY'] }))
    };

    await TestBed.configureTestingModule({
      imports: [
        CashInventoryComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: CashInventoryService, useValue: service },
        { provide: AuthenticationService, useValue: authenticationService },
        provideNoopAnimations()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CashInventoryComponent);
    component = fixture.componentInstance;
  });

  it('loads context options and the unfiltered inventory', () => {
    fixture.detectChanges();
    fixture.detectChanges();

    expect(service.getContext).toHaveBeenCalledTimes(1);
    expect(service.getInventory).toHaveBeenCalledWith({
      custodianKey: null,
      transactionType: null,
      currencyCode: null,
      showLastCutOff: false
    });
    expect(fixture.nativeElement.textContent).toContain('Ada Teller');
    expect(component.context?.currencies).toEqual(context.currencies);
    expect(component.context?.transactionTypes).toEqual(context.transactionTypes);
  });

  it('uses null for All and sends selected context values', () => {
    fixture.detectChanges();
    component.filterForm.setValue({
      custodianKey: 'VAULT:1',
      transactionType: 'CHECK',
      currencyCode: 'USD',
      showLastCutOff: true
    });
    component.applyFilters();

    expect(service.getInventory).toHaveBeenLastCalledWith({
      custodianKey: 'VAULT:1',
      transactionType: 'CHECK',
      currencyCode: 'USD',
      showLastCutOff: true
    });
    component.filterForm.reset({
      custodianKey: null,
      transactionType: null,
      currencyCode: null,
      showLastCutOff: false
    });
    component.applyFilters();
    expect(service.getInventory).toHaveBeenLastCalledWith({
      custodianKey: null,
      transactionType: null,
      currencyCode: null,
      showLastCutOff: false
    });
  });

  it('renders separate cash and check rows, currencies, all movements, backend balance, and as-of time', () => {
    fixture.detectChanges();
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent.replace(/\s+/g, ' ');

    expect(fixture.nativeElement.querySelectorAll('tr.mat-mdc-row')).toHaveLength(2);
    expect(text).toContain('cashInventory.types.CASH');
    expect(text).toContain('cashInventory.types.CHECK');
    expect(text).toContain('MXN');
    expect(text).toContain('USD');
    expect(text).toContain('50,000.00');
    expect(text).toContain('20,000.00');
    expect(text).toContain('15,000.00');
    expect(text).toContain('10,000.00');
    expect(text).toContain('45,000.00');
    expect(text).toContain('cashInventory.lastUpdated');
  });

  it('keeps the loading state separate from the empty state', () => {
    const pending = new Subject<CashInventoryRow[]>();
    service.getInventory.mockReturnValue(pending);
    fixture.detectChanges();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('cashInventory.states.loadingInventory');
    expect(fixture.nativeElement.textContent).not.toContain('cashInventory.states.empty');

    pending.next([]);
    pending.complete();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('cashInventory.states.empty');
  });

  it('disables filters while context is loading', () => {
    const pending = new Subject<CashInventoryContext>();
    service.getContext.mockReturnValue(pending);
    fixture.detectChanges();
    fixture.detectChanges();

    expect(component.filterForm.disabled).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('cashInventory.states.loadingFilters');
    expect(fixture.nativeElement.textContent).not.toContain('cashInventory.states.empty');

    pending.next(context);
    pending.complete();
    fixture.detectChanges();
    expect(component.filterForm.enabled).toBe(true);
  });

  it('shows backend last-cutoff metadata only when requested', () => {
    fixture.detectChanges();
    component.filterForm.controls.showLastCutOff.setValue(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('cashInventory.lastCutOff');
    expect(fixture.nativeElement.textContent).toContain('10,000.00');
  });

  it('shows an inventory error and retries with the selected filters', () => {
    service.getInventory.mockReturnValueOnce(throwError(() => new Error('server details'))).mockReturnValue(of(rows));
    fixture.detectChanges();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('cashInventory.errors.inventory');
    expect(fixture.nativeElement.textContent).not.toContain('server details');

    component.retryInventory();
    fixture.detectChanges();
    expect(service.getInventory).toHaveBeenCalledTimes(2);
    expect(component.rows).toEqual(rows);
  });

  it('shows a context error and retries context loading', () => {
    service.getContext.mockReturnValueOnce(throwError(() => new Error('failure'))).mockReturnValue(of(context));
    fixture.detectChanges();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('cashInventory.errors.context');

    component.loadContext();
    expect(service.getContext).toHaveBeenCalledTimes(2);
    expect(service.getInventory).toHaveBeenCalledTimes(1);
  });

  it('handles backend 403 separately from an empty result', () => {
    service.getInventory.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 403, error: { developerMessage: 'sensitive' } }))
    );
    fixture.detectChanges();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('cashInventory.errors.forbidden');
    expect(fixture.nativeElement.textContent).not.toContain('cashInventory.states.empty');
    expect(fixture.nativeElement.textContent).not.toContain('sensitive');
  });

  it('does not load backend data without the required permission', () => {
    authenticationService.getCredentials.mockReturnValue({ permissions: ['READ_TELLER'] });
    fixture.detectChanges();

    expect(service.getContext).not.toHaveBeenCalled();
    expect(service.getInventory).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('cashInventory.errors.forbidden');
  });
});
