/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { provideNativeDateAdapter } from '@angular/material/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { of, Subject, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

import {
  TransactionHistoryContext,
  TransactionHistoryDenominations,
  TransactionHistoryDetail,
  TransactionHistoryItem,
  TransactionHistoryReceipt,
  TransactionHistorySearch
} from './transaction-history.models';
import { TransactionHistoryComponent } from './transaction-history.component';
import { TransactionHistoryService } from './transaction-history.service';

describe('TransactionHistoryComponent', () => {
  let fixture: ComponentFixture<TransactionHistoryComponent>;
  let component: TransactionHistoryComponent;
  let service: jest.Mocked<TransactionHistoryService>;

  const context: TransactionHistoryContext = {
    tellers: [{ id: 9, tellerId: 4, code: 'T-9', name: 'Main Teller', officeId: 1, officeName: 'Head Office' }],
    currencies: [{ code: 'CRC', name: 'Costa Rican Colón', decimalPlaces: 2 }],
    statuses: [{ code: 'COMPLETED', label: 'Completed' }],
    types: [{ code: 'CASH', label: 'Cash' }],
    operations: [{ code: 'PAY_SERVICE', label: 'Pay Service' }],
    concepts: [{ code: 'POWER', label: 'Power' }]
  };
  const item: TransactionHistoryItem = {
    historyId: 'SERVICE_PAYMENT:7',
    transactionDate: '2026-10-07T10:00:00Z',
    operation: 'PAY_SERVICE',
    inflow: 90,
    outflow: 0,
    currencyCode: 'CRC',
    decimalPlaces: 2,
    concept: 'POWER',
    status: 'COMPLETED',
    reference: 'SP-7',
    tellerId: 9,
    clientId: 44
  };
  const searchResult: TransactionHistorySearch = {
    items: [item],
    totalFilteredRecords: 200,
    offset: 0,
    limit: 25,
    totalsByCurrency: [
      { currencyCode: 'CRC', decimalPlaces: 2, totalInflows: 25000, totalOutflows: 3000, total: 22000 }
    ]
  };
  const detail: TransactionHistoryDetail = {
    historyId: item.historyId,
    transactionDate: item.transactionDate,
    client: { id: 44, displayName: 'Ada Client', identification: 'ID-44' },
    operation: item.operation,
    concept: item.concept,
    reference: item.reference,
    teller: context.tellers[0],
    status: item.status,
    currencyCode: item.currencyCode,
    decimalPlaces: 2,
    cashReceived: 100,
    checksReceived: null,
    change: 10,
    adjustment: null,
    total: 90,
    cancellation: null,
    receiptSupported: true
  };
  const denominations: TransactionHistoryDenominations = {
    historyId: item.historyId,
    operationDenominationsSupported: true,
    operationDenominations: [
      {
        currencyCode: 'CRC',
        denominationId: 'note-50',
        denominationValue: 50,
        quantity: 2,
        amount: 100,
        denominationType: 'BANKNOTE'
      },
      {
        currencyCode: 'USD',
        denominationId: 'coin-1',
        denominationValue: 1,
        quantity: 1,
        amount: 1,
        denominationType: 'COIN'
      }
    ],
    changeDenominationsSupported: true,
    changeDenominations: [
      {
        currencyCode: 'CRC',
        denominationId: 'note-10',
        denominationValue: 10,
        quantity: 1,
        amount: 10,
        denominationType: 'BANKNOTE'
      }
    ]
  };

  beforeEach(async () => {
    service = {
      getContext: jest.fn(() => of(context)),
      search: jest.fn(() => of(searchResult)),
      getDetail: jest.fn(() => of(detail)),
      getDenominations: jest.fn(() => of(denominations)),
      getReceipt: jest.fn(() =>
        of({
          historyId: item.historyId,
          sourceType: 'SERVICE_PAYMENT',
          sourceId: 7,
          receipt: { receiptNumber: 'SP-7' }
        })
      ),
      getReport: jest.fn(() =>
        of({
          generatedAt: '2026-10-07T11:00:00Z',
          items: [item],
          totalFilteredRecords: 1,
          totalsByCurrency: searchResult.totalsByCurrency
        })
      )
    } as unknown as jest.Mocked<TransactionHistoryService>;

    await TestBed.configureTestingModule({
      imports: [
        TransactionHistoryComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: TransactionHistoryService, useValue: service },
        provideNativeDateAdapter(),
        provideNoopAnimations()
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(TransactionHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => jest.restoreAllMocks());

  it('loads context, renders all filters, and performs the default server search', () => {
    expect(service.getContext).toHaveBeenCalledTimes(1);
    expect(service.search).toHaveBeenCalledWith({
      fromDate: undefined,
      toDate: undefined,
      tellerId: undefined,
      currencyCode: undefined,
      status: undefined,
      type: undefined,
      operation: undefined,
      concept: undefined,
      reference: undefined,
      offset: 0,
      limit: 25,
      sort: 'transactionDate',
      order: 'DESC'
    });
    expect(fixture.nativeElement.querySelectorAll('.filter-grid mat-form-field')).toHaveLength(9);
  });

  it('applies every filter with ISO dates and resets to the first page', () => {
    component.pageIndex = 3;
    component.filtersForm.setValue({
      fromDate: new Date(2026, 9, 1),
      toDate: new Date(2026, 9, 7),
      tellerId: 9,
      currencyCode: 'CRC',
      status: 'COMPLETED',
      type: 'CASH',
      operation: 'PAY_SERVICE',
      concept: 'POWER',
      reference: 'SP-7'
    });
    component.applyFilters();

    expect(service.search).toHaveBeenLastCalledWith({
      fromDate: '2026-10-01',
      toDate: '2026-10-07',
      tellerId: 9,
      currencyCode: 'CRC',
      status: 'COMPLETED',
      type: 'CASH',
      operation: 'PAY_SERVICE',
      concept: 'POWER',
      reference: 'SP-7',
      offset: 0,
      limit: 25,
      sort: 'transactionDate',
      order: 'DESC'
    });
  });

  it('rejects an inverted date range without calling the API', () => {
    component.filtersForm.patchValue({ fromDate: new Date(2026, 9, 8), toDate: new Date(2026, 9, 7) });
    component.applyFilters();
    expect(service.search).toHaveBeenCalledTimes(1);
    expect(component.filtersForm.hasError('dateRange')).toBe(true);
  });

  it('clears controls, pagination, and sorting before reloading', () => {
    component.pageIndex = 2;
    component.sort = 'reference';
    component.order = 'ASC';
    component.filtersForm.patchValue({ tellerId: 9, reference: 'SP-7' });
    component.clearFilters();

    expect(component.filtersForm.controls.tellerId.value).toBeNull();
    expect(component.filtersForm.controls.reference.value).toBe('');
    expect(component.pageIndex).toBe(0);
    expect(service.search).toHaveBeenLastCalledWith(
      expect.objectContaining({ offset: 0, sort: 'transactionDate', order: 'DESC' })
    );
  });

  it('preserves active filters during server-side pagination', () => {
    component.filtersForm.patchValue({ currencyCode: 'CRC' });
    component.changePage({ pageIndex: 2, pageSize: 50, length: 200 });
    expect(service.search).toHaveBeenLastCalledWith(
      expect.objectContaining({ currencyCode: 'CRC', offset: 100, limit: 50 })
    );
  });

  it('displays backend totals rather than reducing the current page', () => {
    expect(component.items).toHaveLength(1);
    expect(component.totals[0].totalInflows).toBe(25000);
    expect(component.totals[0].total).toBe(22000);
    expect(fixture.nativeElement.textContent).toContain('25,000.00 CRC');
  });

  it('ignores an older search response when a newer search starts', () => {
    const firstSearch = new Subject<TransactionHistorySearch>();
    const secondSearch = new Subject<TransactionHistorySearch>();
    const newerResult = { ...searchResult, totalFilteredRecords: 1 };
    service.search.mockReturnValueOnce(firstSearch).mockReturnValueOnce(secondSearch);
    component.items = [];

    component.search();
    component.search();
    firstSearch.next(searchResult);

    expect(component.items).toEqual([]);
    expect(component.searchLoading).toBe(true);

    secondSearch.next(newerResult);
    secondSearch.complete();

    expect(component.items).toEqual(newerResult.items);
    expect(component.totalFilteredRecords).toBe(1);
    expect(component.searchLoading).toBe(false);
  });

  it('loads source-authoritative detail by historyId', () => {
    component.openDetail(item);
    fixture.detectChanges();
    expect(service.getDetail).toHaveBeenCalledWith('SERVICE_PAYMENT:7');
    expect(component.detail?.client?.displayName).toBe('Ada Client');
    expect(fixture.nativeElement.textContent).toContain('Ada Client');
  });

  it('ignores an older detail response when a newer row is selected', () => {
    const firstDetail = new Subject<TransactionHistoryDetail>();
    const secondDetail = new Subject<TransactionHistoryDetail>();
    const newerItem = { ...item, historyId: 'SERVICE_PAYMENT:8' };
    const newerDetail = { ...detail, historyId: newerItem.historyId };
    service.getDetail.mockReturnValueOnce(firstDetail).mockReturnValueOnce(secondDetail);

    component.openDetail(item);
    component.openDetail(newerItem);
    firstDetail.next(detail);

    expect(component.detail).toBeUndefined();
    expect(component.detailLoading).toBe(true);

    secondDetail.next(newerDetail);
    secondDetail.complete();

    expect(component.detail?.historyId).toBe(newerItem.historyId);
    expect(component.detailLoading).toBe(false);
  });

  it('keeps operation and change denominations separate and grouped by currency', () => {
    component.detail = detail;
    component.loadDenominations();
    fixture.detectChanges();
    expect(service.getDenominations).toHaveBeenCalledWith(item.historyId);
    expect(component.denominationCurrencies('operation')).toEqual([
      'CRC',
      'USD'
    ]);
    expect(component.denominationLines('change', 'CRC')).toHaveLength(1);
    expect(fixture.nativeElement.textContent).toContain('transactionHistory.sections.operationDenominations');
    expect(fixture.nativeElement.textContent).toContain('transactionHistory.sections.changeGiven');
  });

  it('ignores denominations from a previously selected row', () => {
    const pendingDenominations = new Subject<TransactionHistoryDenominations>();
    const newerItem = { ...item, historyId: 'SERVICE_PAYMENT:8' };
    const newerDetail = { ...detail, historyId: newerItem.historyId };
    service.getDenominations.mockReturnValueOnce(pendingDenominations);
    service.getDetail.mockReturnValueOnce(of(newerDetail));
    component.detail = detail;

    component.loadDenominations();
    component.openDetail(newerItem);
    pendingDenominations.next(denominations);

    expect(component.detail?.historyId).toBe(newerItem.historyId);
    expect(component.denominations).toBeUndefined();
    expect(component.denominationLoading).toBe(false);
  });

  it('retrieves and prints the authoritative receipt', () => {
    jest.useFakeTimers();
    const print = jest.spyOn(window, 'print').mockImplementation(() => undefined);
    component.detail = detail;
    component.reprintReceipt();
    fixture.detectChanges();
    jest.runOnlyPendingTimers();
    expect(service.getReceipt).toHaveBeenCalledWith(item.historyId);
    expect(component.receipt?.receipt).toEqual({ receiptNumber: 'SP-7' });
    expect(print).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  it('does not apply or print a receipt from a previously selected row', () => {
    jest.useFakeTimers();
    const print = jest.spyOn(window, 'print').mockImplementation(() => undefined);
    const pendingReceipt = new Subject<TransactionHistoryReceipt>();
    const newerItem = { ...item, historyId: 'SERVICE_PAYMENT:8' };
    const newerDetail = { ...detail, historyId: newerItem.historyId };
    service.getReceipt.mockReturnValueOnce(pendingReceipt);
    service.getDetail.mockReturnValueOnce(of(newerDetail));
    component.detail = detail;

    component.reprintReceipt();
    component.openDetail(newerItem);
    pendingReceipt.next({
      historyId: item.historyId,
      sourceType: 'SERVICE_PAYMENT',
      sourceId: 7,
      receipt: { receiptNumber: 'SP-7' }
    });
    jest.runOnlyPendingTimers();

    expect(component.detail?.historyId).toBe(newerItem.historyId);
    expect(component.receipt).toBeUndefined();
    expect(component.receiptLoading).toBe(false);
    expect(print).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('handles unsupported receipt and search errors without fake data', () => {
    service.getReceipt.mockReturnValue(throwError(() => ({ status: 403 })));
    component.detail = detail;
    component.reprintReceipt();
    expect(component.receiptError).toBe('transactionHistory.errors.receiptUnavailable');

    service.search.mockReturnValue(throwError(() => ({ status: 500 })));
    component.search();
    expect(component.items).toEqual([]);
    expect(component.searchError).toBe('transactionHistory.errors.search');
  });

  it('requests a complete report with active filters and no pagination', () => {
    jest.useFakeTimers();
    jest.spyOn(window, 'print').mockImplementation(() => undefined);
    component.filtersForm.patchValue({ status: 'COMPLETED' });
    component.printResults();
    jest.runOnlyPendingTimers();
    expect(service.getReport).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'COMPLETED', offset: undefined, limit: undefined })
    );
    expect(component.report?.totalFilteredRecords).toBe(1);
    jest.useRealTimers();
  });
});
