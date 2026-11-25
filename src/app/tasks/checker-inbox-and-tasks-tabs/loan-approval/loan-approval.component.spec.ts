/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of, Subject, throwError } from 'rxjs';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import { TasksService } from '../../tasks.service';
import { LoanApprovalDataService } from './loan-approval-data.service';
import { LoanApprovalComponent } from './loan-approval.component';
import {
  ApprovalLoan,
  calendarDate,
  commandOutcome,
  highValue,
  minorUnits,
  missingPurpose,
  reviewLoan,
  totals
} from './loan-approval.models';

export function loan(id = 1, patch: Partial<ApprovalLoan> = {}): ApprovalLoan {
  return {
    id,
    accountNo: String(id).padStart(9, '0'),
    clientId: id,
    clientName: 'Synthetic Élise ' + id,
    clientOfficeId: 1,
    loanType: { id: 1 },
    multiDisburseLoan: false,
    loanProductId: 1,
    loanProductName: 'Synthetic PyME Ágil',
    principal: '100.10',
    currency: { code: 'MXN', decimalPlaces: 2 },
    status: { id: 100, pendingApproval: true },
    timeline: { submittedOnDate: [
        2026,
        11,
        10
      ], expectedDisbursementDate: [
        2026,
        11,
        20
      ] },
    ...patch
  };
}
const businessDate = new Date(2026, 10, 18);
describe('Loan approval workspace', () => {
  let component: LoanApprovalComponent;
  let data: {
    page: jest.Mock;
    review: jest.Mock;
    detail: jest.Mock;
    locked: jest.Mock;
    lock: jest.Mock;
    unlock: jest.Mock;
  };
  let tasks: { getAllOffices: jest.Mock; submitBatchData: jest.Mock };
  let permissions: string[];
  let rows: ApprovalLoan[];
  let dialog: { open: jest.Mock };
  let locks: Set<number>;
  function create(initialRows = Array.from({ length: 27 }, (_, i) => loan(i + 1))) {
    rows = initialRows;
    permissions = ['ALL_FUNCTIONS'];
    locks = new Set();
    data = {
      page: jest.fn(() => of({ rows, total: rows.length, complete: true })),
      review: jest.fn((item) => of({ detail: item, template: { approvalAmount: item.principal } })),
      detail: jest.fn((id) => of(rows.find((item) => item.id === id))),
      locked: jest.fn((id) => locks.has(id)),
      lock: jest.fn((id) => locks.add(id)),
      unlock: jest.fn((id) => locks.delete(id))
    };
    tasks = {
      getAllOffices: jest.fn(() =>
        of([
          { id: 1, name: 'Synthetic office' },
          { id: 2, name: 'Synthetic East' }
        ])
      ),
      submitBatchData: jest.fn(() => of([]))
    };
    dialog = { open: jest.fn(() => ({ afterClosed: () => of(false) })) };
    TestBed.configureTestingModule({
      imports: [LoanApprovalComponent],
      providers: [
        { provide: LoanApprovalDataService, useValue: data },
        { provide: TasksService, useValue: tasks },
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions }) } },
        {
          provide: SettingsService,
          useValue: {
            businessDate,
            maxFutureDate: new Date(2030, 0, 1),
            dateFormat: 'yyyy-MM-dd',
            language: { code: 'en' }
          }
        },
        {
          provide: Dates,
          useValue: { formatDate: (date: Date) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}` }
        },
        { provide: MatDialog, useValue: dialog }
      ]
    }).overrideComponent(LoanApprovalComponent, { set: { template: '', imports: [] } });
    component = TestBed.createComponent(LoanApprovalComponent).componentInstance;
    component.ngOnInit();
  }
  function prepare(ids = [
      1,
      2
    ]) {
    for (const id of ids) component.toggle(rows.find((item) => item.id === id));
    component.prepare();
  }
  it('counts pending scope and computes requested totals only for the visible page', () => {
    create();
    expect(component.total).toBe(27);
    expect(component.pageLoans).toHaveLength(10);
    expect(component.pageRequested).toEqual([{ code: 'MXN', digits: 2, amount: '1001.00' }]);
    component.paginate({ pageIndex: 2, pageSize: 10, length: 27 });
    expect(component.pageRequested[0].amount).toBe('700.70');
    expect(component.pageCount).toBe(3);
  });
  it.each([
    'ÉLISE 1',
    '000000001',
    'pyme ágil'
  ])('searches normalized names, accounts and products: %s', (search) => {
    create();
    component.filters.patchValue({ search: '  ' + search + '  ' });
    expect(component.pageLoans.length).toBeGreaterThan(0);
    expect(component.pageLoans[0].id).toBe(1);
  });
  it('filters by stable office, product, purpose and currency-specific exact ranges', () => {
    create([
      loan(1),
      loan(2, { clientOfficeId: 2, loanProductId: 2, principal: '500.00', loanPurposeName: 'Equipment' }),
      loan(3, { principal: '150.00' })
    ]);
    component.filters.patchValue({
      office: '2',
      product: '2',
      purpose: 'specified',
      currency: 'MXN',
      minimum: '400',
      maximum: '600'
    });
    expect(component.filtered.map((item) => item.id)).toEqual([2]);
    component.filters.patchValue({ minimum: '700' });
    expect(component.filters.invalid).toBe(true);
    expect(component.filtered).toEqual([]);
    component.reset();
    expect(component.filtered).toHaveLength(3);
    component.filters.patchValue({ minimum: '10' });
    expect(component.filters.invalid).toBe(true);
  });
  it('rejects fractional precision, negative and nonnumeric amount bounds', () => {
    create();
    for (const minimum of [
      '0.001',
      '-1',
      'NaN',
      'Infinity'
    ]) {
      component.filters.patchValue({ currency: 'MXN', minimum });
      expect(component.filters.invalid).toBe(true);
    }
  });
  it('clears selection and resets pagination when filters change', () => {
    create();
    component.toggle(rows[0]);
    component.paginate({ pageIndex: 1, pageSize: 10, length: 27 });
    expect(component.selection.selected).toEqual([1]);
    component.filters.patchValue({ search: '2' });
    expect(component.pageIndex).toBe(0);
    expect(component.selection.isEmpty()).toBe(true);
  });
  it('selects only current office page, supports explicit full-office selection and retains stable IDs across pages', () => {
    create();
    component.togglePage(component.pageLoans);
    expect(component.selection.selected).toHaveLength(10);
    component.paginate({ pageIndex: 1, pageSize: 10, length: 27 });
    component.toggle(rows[10]);
    expect(component.selection.selected).toHaveLength(11);
    component.selectOffice('1');
    expect(component.selection.selected).toHaveLength(27);
    component.selectOffice('1');
    expect(component.selection.isEmpty()).toBe(true);
  });
  it('groups clients by ID and keeps duplicate names separate', () => {
    create([
      loan(1, { clientId: 7, clientName: 'Same name' }),
      loan(2, { clientId: 8, clientName: 'Same name' }),
      loan(3, { clientId: 7 })
    ]);
    expect(component.exposure(rows[0])).toHaveLength(2);
    expect(component.exposure(rows[1])).toHaveLength(1);
    expect(totals(component.exposure(rows[0]))[0].amount).toBe('200.20');
  });
  it('keeps group-office mapping and unknown office records visible', () => {
    create([
      loan(1, { clientOfficeId: undefined, group: { id: 10, officeId: 2, name: 'Group' } }),
      loan(2, { clientOfficeId: undefined })
    ]);
    expect(component.groups.map((group) => group.key)).toEqual([
      '2',
      'unknown'
    ]);
  });
  it('uses business date and real common expected date; rejects date order, future approval and pre-submission approval', () => {
    create();
    prepare();
    expect(component.approval.value.approvedOnDate).toEqual(businessDate);
    expect(component.approval.value.expectedDisbursementDate).toEqual(new Date(2026, 10, 20));
    for (const approvedOnDate of [
      new Date(2026, 10, 9),
      new Date(2026, 10, 19),
      new Date('invalid')
    ]) {
      component.approval.patchValue({ approvedOnDate });
      expect(component.approval.invalid).toBe(true);
    }
    component.approval.patchValue({ approvedOnDate: businessDate, expectedDisbursementDate: new Date(2026, 10, 17) });
    expect(component.approval.invalid).toBe(true);
    component.approval.patchValue({ expectedDisbursementDate: new Date(2031, 0, 1) });
    expect(component.approval.invalid).toBe(true);
  });
  it('uses a newly configured business date for an untouched approval date on selection', () => {
    create();
    const settings = TestBed.inject(SettingsService);
    const updatedBusinessDate = new Date(2026, 10, 19);
    expect(component.approval.value.approvedOnDate).toEqual(businessDate);
    Object.assign(settings, { businessDate: updatedBusinessDate });
    component.toggle(rows[0]);
    expect(component.approval.value.approvedOnDate).toEqual(updatedBusinessDate);
    component.approval.controls.approvedOnDate.markAsDirty();
    component.approval.controls.approvedOnDate.setValue(new Date(2026, 10, 17));
    Object.assign(settings, { businessDate: new Date(2026, 10, 20) });
    component.toggle(rows[1]);
    expect(component.approval.value.approvedOnDate).toEqual(new Date(2026, 10, 17));
  });
  it('does not invent a shared expected date for different loan schedules', () => {
    create([
      loan(1),
      loan(2, { timeline: { submittedOnDate: [
            2026,
            11,
            10
          ], expectedDisbursementDate: [
            2026,
            11,
            21
          ] } })
    ]);
    prepare();
    expect(component.approval.value.expectedDisbursementDate).toBeNull();
    expect(component.approvalDisabled).toBe(true);
  });
  it('excludes unsupported or unverifiable loans from bulk without issuing writes', () => {
    create([
      loan(1),
      loan(2, { multiDisburseLoan: true }),
      loan(3)
    ]);
    data.review.mockImplementation((item) =>
      item.id === 3 ? throwError(() => new Error()) : of({ detail: item, template: { approvalAmount: item.principal } })
    );
    prepare([
      1,
      2,
      3
    ]);
    expect(component.reviews).toHaveLength(1);
    expect(component.excluded.map((item) => item.id)).toEqual([
      2,
      3
    ]);
    expect(component.selection.selected).toEqual([1]);
    expect(tasks.submitBatchData).not.toHaveBeenCalled();
  });
  it('does not post before explicit confirmation and cancellation is harmless', () => {
    create();
    prepare();
    component.approve();
    expect(dialog.open).toHaveBeenCalled();
    expect(tasks.submitBatchData).not.toHaveBeenCalled();
    expect(component.busy).toBe(false);
  });
  it('preserves backend principal without an amount override and sends both chosen dates exactly once', () => {
    create([loan(1, { principal: '1234567890123.45' })]);
    prepare([1]);
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });
    const pending = new Subject<any>();
    tasks.submitBatchData.mockReturnValue(pending);
    component.approve();
    component.approve();
    expect(tasks.submitBatchData).toHaveBeenCalledTimes(1);
    const batch = tasks.submitBatchData.mock.calls[0][0];
    expect(batch[0].relativeUrl).toBe('loans/1?command=approve');
    expect(JSON.parse(batch[0].body)).not.toHaveProperty('approvedLoanAmount');
    expect(component.selectedRequested[0].amount).toBe('1234567890123.45');
    expect(JSON.parse(batch[0].body)).toMatchObject({
      approvedOnDate: '2026-11-18',
      expectedDisbursementDate: '2026-11-20',
      locale: 'en',
      dateFormat: 'yyyy-MM-dd'
    });
    pending.next([{ requestId: 1, statusCode: 200, body: '{"resourceId":1}' }]);
    pending.complete();
  });
  it('aborts a superseded amount review and requires a fresh selection and confirmation', () => {
    create([loan(1, { principal: '100.00' })]);
    prepare([1]);
    const closed = new Subject<boolean>();
    dialog.open.mockReturnValueOnce({ afterClosed: () => closed });
    component.approve();
    rows = [loan(1, { principal: '120.00' })];
    data.review.mockReturnValue(of({ detail: rows[0], template: { approvalAmount: '120.00' } }));
    closed.next(true);
    closed.complete();
    expect(tasks.submitBatchData).not.toHaveBeenCalled();
    expect(data.lock).not.toHaveBeenCalled();
    expect(component.reviewChanged).toBe(true);
    expect(component.prepared).toBe(false);
    expect(component.selection.isEmpty()).toBe(true);
    expect(component.loans[0].principal).toBe('120.00');
    expect(dialog.open).toHaveBeenCalledTimes(1);
    component.toggle(component.loans[0]);
    component.prepare();
    expect(component.reviewChanged).toBe(false);
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });
    component.approve();
    expect(dialog.open).toHaveBeenCalledTimes(2);
    expect(tasks.submitBatchData).toHaveBeenCalledTimes(1);
    expect(JSON.parse(tasks.submitBatchData.mock.calls[0][0][0].body)).not.toHaveProperty('approvedLoanAmount');
  });
  it.each([
    { detail: { currency: { code: 'USD', decimalPlaces: 2 } } },
    { detail: { loanProductName: 'Changed product' } },
    { detail: { interestRatePerPeriod: 12 } },
    { detail: { multiDisburseLoan: true } },
    { detail: { status: { id: 200, pendingApproval: false } } },
    { template: { approvalAmount: '120.00' } },
    { template: { expectedDisbursementDate: [
          2026,
          11,
          21
        ] } }
  ])('aborts the whole confirmed batch when reviewed data changes: %j', (patch) => {
    create([
      loan(1),
      loan(2)
    ]);
    prepare();
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });
    data.review.mockImplementation((item) =>
      of({
        detail: { ...item, ...(item.id === 2 ? patch.detail : {}) },
        template: { approvalAmount: item.principal, ...(item.id === 2 ? patch.template : {}) }
      })
    );
    component.approve();
    expect(tasks.submitBatchData).not.toHaveBeenCalled();
    expect(data.lock).not.toHaveBeenCalled();
    expect(component.reviewChanged).toBe(true);
    expect(component.busy).toBe(false);
    expect(component.prepared).toBe(false);
  });
  it('requires re-review when a confirmed loan cannot be revalidated', () => {
    create();
    prepare();
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });
    data.review.mockReturnValue(throwError(() => new Error('unavailable')));
    component.approve();
    expect(tasks.submitBatchData).not.toHaveBeenCalled();
    expect(data.lock).not.toHaveBeenCalled();
    expect(component.reviewChanged).toBe(true);
    expect(component.busy).toBe(false);
  });
  it('waits for every confirmed loan to be revalidated before sending any command', () => {
    create();
    prepare();
    const first = new Subject<any>(),
      second = new Subject<any>();
    data.review.mockImplementation((item) => (item.id === 1 ? first : second));
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });
    component.approve();
    second.next({ detail: rows[1], template: { approvalAmount: rows[1].principal } });
    second.complete();
    expect(tasks.submitBatchData).not.toHaveBeenCalled();
    expect(data.lock).not.toHaveBeenCalled();
    expect(component.busy).toBe(true);
    first.next({ detail: rows[0], template: { approvalAmount: rows[0].principal } });
    first.complete();
    expect(tasks.submitBatchData).toHaveBeenCalledTimes(1);
  });
  it.each([
    'permission',
    'lock'
  ])('checks %s again after asynchronous revalidation', (changed) => {
    create([loan(1)]);
    prepare([1]);
    const request = new Subject<any>();
    data.review.mockReturnValue(request);
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });
    component.approve();
    if (changed === 'permission') permissions = ['READ_LOAN'];
    else locks.add(1);
    request.next({ detail: rows[0], template: { approvalAmount: rows[0].principal } });
    request.complete();
    expect(tasks.submitBatchData).not.toHaveBeenCalled();
    expect(data.lock).not.toHaveBeenCalled();
    expect(component.busy).toBe(false);
  });
  it('prevents duplicate confirmation dialogs while the first remains open', () => {
    create();
    prepare();
    const closed = new Subject<boolean>();
    dialog.open.mockReturnValue({ afterClosed: () => closed });
    component.approve();
    component.approve();
    expect(dialog.open).toHaveBeenCalledTimes(1);
    closed.next(false);
    closed.complete();
  });
  it.each([
    ['READ_LOAN'],
    [
      'READ_LOAN',
      'APPROVE_LOAN_CHECKER'
    ]
  ])('does not grant command permission to %s', (...grants: string[]) => {
    create();
    permissions = grants;
    component.toggle(rows[0]);
    component.prepare();
    component.approve();
    expect(component.selection.hasValue()).toBe(false);
    expect(data.review).not.toHaveBeenCalled();
    expect(tasks.submitBatchData).not.toHaveBeenCalled();
  });
  it('checks permission again when confirmation closes', () => {
    create();
    prepare();
    const closed = new Subject<boolean>();
    dialog.open.mockReturnValue({ afterClosed: () => closed });
    component.approve();
    permissions = ['READ_LOAN'];
    closed.next(true);
    closed.complete();
    expect(tasks.submitBatchData).not.toHaveBeenCalled();
  });
  it('correlates mixed item results, verifies state and never resubmits locked commands', () => {
    create([
      loan(1),
      loan(2),
      loan(3),
      loan(4)
    ]);
    prepare([
      1,
      2,
      3,
      4
    ]);
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });
    tasks.submitBatchData.mockImplementation(() => {
      rows[0].status = { id: 200, waitingForDisbursal: true };
      return of([
        { requestId: 4, statusCode: 200, body: '{"commandId":40}' },
        { requestId: 2, statusCode: '400', body: '{}' },
        { requestId: 1, statusCode: '200', body: '{"resourceId":1}' }
      ]);
    });
    component.approve();
    expect(component.results.map((result) => result.outcome)).toEqual([
      'approved',
      'failed',
      'uncertain',
      'review'
    ]);
    expect(data.detail).toHaveBeenCalledTimes(4);
    expect(component.selection.isEmpty()).toBe(true);
    component.toggle(rows[2]);
    component.prepare();
    component.approve();
    expect(tasks.submitBatchData).toHaveBeenCalledTimes(1);
  });
  it('keeps transport failures uncertain and never retries a POST, including after reload', () => {
    create([loan(1)]);
    prepare([1]);
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });
    tasks.submitBatchData.mockReturnValue(throwError(() => new Error('network')));
    component.approve();
    expect(component.results[0].outcome).toBe('uncertain');
    component.load();
    component.toggle(rows[0]);
    component.prepare();
    expect(component.selection.hasValue()).toBe(false);
    expect(tasks.submitBatchData).toHaveBeenCalledTimes(1);
  });
  it('does not mistake batch item HTTP success for an authoritative approved state', () => {
    create([loan(1)]);
    prepare([1]);
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });
    tasks.submitBatchData.mockReturnValue(of([{ requestId: 1, statusCode: 200, body: '{"resourceId":1}' }]));
    component.approve();
    expect(component.results[0].outcome).toBe('uncertain');
  });
  it('reports a refresh failure without unlocking submitted loans', () => {
    create([loan(1)]);
    prepare([1]);
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });
    data.page.mockReturnValue(throwError(() => new Error()));
    component.approve();
    expect(component.refreshError).toBe(true);
    expect(locks.has(1)).toBe(true);
  });
  it('uses server page offsets for incomplete lists without offering global selection', () => {
    create();
    data.page.mockImplementation((limit, offset) =>
      of({ rows: Array.from({ length: limit }, (_, i) => loan(offset + i + 1)), total: 12005, complete: false })
    );
    component.load();
    expect(component.total).toBe(12005);
    expect(component.pageLoans).toHaveLength(10);
    expect(component.pageCount).toBe(1201);
    component.selectOffice('1');
    expect(component.selection.hasValue()).toBe(false);
    component.paginate({ pageIndex: 1200, pageSize: 10, length: 12005 });
    expect(data.page).toHaveBeenLastCalledWith(10, 12000);
  });
  it('recovers the last valid server page when pending records shrink', () => {
    create();
    component.complete = false;
    component.pageIndex = 12;
    data.page.mockImplementation((limit, offset) =>
      of({
        rows: offset >= 100 ? [] : Array.from({ length: limit }, (_, index) => loan(offset + index + 1)),
        total: 100,
        complete: false
      })
    );
    component.paginate({ pageIndex: 12, pageSize: 10, length: 130 });
    expect(component.pageIndex).toBe(9);
    expect(data.page).toHaveBeenLastCalledWith(10, 90);
    expect(component.pageLoans).toHaveLength(10);
  });
  it('revalidates amount filters as a server page removes and restores its currency, without emitting another edit', () => {
    create([loan(1, { principal: '15.00', currency: { code: 'USD', decimalPlaces: 2 } })]);
    component.complete = false;
    component.filters.patchValue({ currency: 'USD', minimum: '10', maximum: '20' });
    expect(component.filters.valid).toBe(true);
    const edits = jest.fn();
    component.filters.valueChanges.subscribe(edits);
    data.page.mockReturnValue(of({ rows: [loan(2)], total: 30, complete: false }));
    component.paginate({ pageIndex: 1, pageSize: 10, length: 30 });
    expect(component.filters.invalid).toBe(true);
    data.page.mockReturnValue(
      of({
        rows: [loan(3, { principal: '15.00', currency: { code: 'USD', decimalPlaces: 2 } })],
        total: 30,
        complete: false
      })
    );
    component.paginate({ pageIndex: 2, pageSize: 10, length: 30 });
    expect(component.filters.valid).toBe(true);
    expect(component.pageLoans.map((item) => item.id)).toEqual([3]);
    expect(edits).not.toHaveBeenCalled();
    component.filters.patchValue({ minimum: '30' });
    expect(component.filters.invalid).toBe(true);
  });
  it.each([
    false,
    true
  ])('replaces automatic expected dates from reviewed templates (different dates: %s)', (disagree) => {
    create();
    component.toggle(rows[0]);
    component.toggle(rows[1]);
    expect(component.approval.value.expectedDisbursementDate).toEqual(new Date(2026, 10, 20));
    data.review.mockImplementation((item) =>
      of({ detail: item, template: { approvalAmount: item.principal, expectedDisbursementDate: [
            2026,
            11,
            disagree && item.id === 2 ? 22 : 21
          ] } })
    );
    component.prepare();
    expect(component.approval.value.expectedDisbursementDate).toEqual(disagree ? null : new Date(2026, 10, 21));
    expect(component.approvalDisabled).toBe(disagree);
  });
  it('preserves a user-edited expected date, including edits during review and later selection changes', () => {
    create();
    component.toggle(rows[0]);
    const request = new Subject<any>();
    data.review.mockReturnValue(request);
    component.prepare();
    const control = component.approval.controls.expectedDisbursementDate;
    control.setValue(new Date(2026, 10, 24));
    control.markAsDirty();
    request.next({ detail: rows[0], template: { approvalAmount: rows[0].principal, expectedDisbursementDate: [
          2026,
          11,
          21
        ] } });
    request.complete();
    expect(control.value).toEqual(new Date(2026, 10, 24));
    component.toggle(rows[1]);
    expect(control.value).toEqual(new Date(2026, 10, 24));
  });
  it.each([
    false,
    true
  ])('ignores in-flight review results only for a superseded selection (filter edited: %s)', (superseded) => {
    create();
    component.toggle(rows[0]);
    const request = new Subject<any>();
    data.review.mockReturnValue(request);
    component.prepare();
    if (superseded) component.filters.patchValue({ search: '2' });
    request.next({ detail: rows[0], template: { approvalAmount: rows[0].principal } });
    request.complete();
    expect(component.busy).toBe(false);
    expect(component.prepared).toBe(!superseded);
    expect(component.reviews).toHaveLength(superseded ? 0 : 1);
    expect(component.excluded).toEqual([]);
    expect(tasks.submitBatchData).not.toHaveBeenCalled();
  });
  it.each([
    false,
    true
  ])('uses the correct paging scope when an approval refresh remains complete: %s', (complete) => {
    create();
    component.toggle(rows[0]);
    component.paginate({ pageIndex: 2, pageSize: 10, length: 27 });
    component.prepare();
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });
    const refreshed = complete ? rows : Array.from({ length: 1000 }, (_, index) => loan(index + 1));
    data.page.mockReturnValue(of({ rows: refreshed, total: complete ? rows.length : 1001, complete }));
    component.approve();
    expect(component.complete).toBe(complete);
    expect(component.pageIndex).toBe(complete ? 2 : 0);
    expect(component.loans).toHaveLength(complete ? 27 : 10);
    expect(component.pageLoans).toHaveLength(complete ? 7 : 10);
    if (!complete) {
      data.page.mockReturnValue(of({ rows: refreshed.slice(10, 20), total: 1001, complete: false }));
      component.paginate({ pageIndex: 1, pageSize: 10, length: 1001 });
      expect(data.page).toHaveBeenLastCalledWith(10, 10);
    }
  });
  it('unlocks only a confirmed failed item whose identity-matched detail is still pending', () => {
    create([
      loan(1),
      loan(2),
      loan(3)
    ]);
    prepare([
      1,
      2,
      3
    ]);
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });
    tasks.submitBatchData.mockReturnValue(
      of([
        { requestId: 1, statusCode: 400 },
        { requestId: 2, statusCode: 400 }
      ])
    );
    data.detail.mockImplementation((id) =>
      id === 2 ? throwError(() => new Error('unavailable')) : of(rows.find((row) => row.id === id))
    );
    component.approve();
    expect(data.unlock).toHaveBeenCalledTimes(1);
    expect(data.unlock).toHaveBeenCalledWith(1);
    expect(locks.has(1)).toBe(false);
    expect(locks.has(2)).toBe(true);
    expect(locks.has(3)).toBe(true);
    expect(component.selectable(rows[0])).toBe(true);
    expect(component.selectable(rows[2])).toBe(false);
  });
  it('retains a failure lock when the follow-up detail identity does not match', () => {
    create([loan(1)]);
    prepare([1]);
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });
    tasks.submitBatchData.mockReturnValue(of([{ requestId: 1, statusCode: 400 }]));
    data.detail.mockReturnValue(of(loan(2)));
    component.approve();
    expect(data.unlock).not.toHaveBeenCalled();
    expect(locks.has(1)).toBe(true);
  });
  it('does not submit any commands if an attempt marker cannot be persisted', () => {
    create();
    prepare();
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });
    data.lock.mockImplementation((id) => (id === 1 ? locks.add(id) : false));
    component.approve();
    expect(tasks.submitBatchData).not.toHaveBeenCalled();
    expect(locks.has(1)).toBe(false);
    expect(component.busy).toBe(false);
    expect(component.excluded).toHaveLength(2);
  });
  it('does not approve when count completeness is unknown', () => {
    create();
    component.total = null;
    component.toggle(rows[0]);
    component.prepare();
    expect(data.review).not.toHaveBeenCalled();
  });
  it('shows loading, empty and error states and can recover with a read-only retry', () => {
    create([]);
    expect(component.groups).toEqual([]);
    const request = new Subject<any>();
    data.page.mockReturnValue(request);
    component.load();
    expect(component.loading).toBe(true);
    request.error(new Error());
    expect(component.error).toBe(true);
    expect(component.loading).toBe(false);
    data.page.mockReturnValue(of({ rows: [loan()], total: 1, complete: true }));
    component.load();
    expect(component.error).toBe(false);
    expect(component.groups).toHaveLength(1);
    expect(tasks.submitBatchData).not.toHaveBeenCalled();
  });
});

describe('Exact loan approval models', () => {
  it('adds decimals exactly and separates currencies and precision', () => {
    expect(
      totals([
        loan(1, { principal: '0.10' }),
        loan(2, { principal: '0.20' }),
        loan(3, { principal: '5', currency: { code: 'JPY', decimalPlaces: 0 } })
      ])
    ).toEqual([
      { code: 'MXN', digits: 2, amount: '0.30' },
      { code: 'JPY', digits: 0, amount: '5' }
    ]);
    expect(totals([loan(1, { principal: '1.001' })])).toBeNull();
    expect(minorUnits('1.000', 2)).toBe(100n);
  });
  it('uses the MXN threshold only for MXN, including the exact boundary', () => {
    expect(highValue(loan(1, { principal: '1000000.00' }))).toBe(true);
    expect(highValue(loan(1, { principal: '999999.99' }))).toBe(false);
    expect(highValue(loan(1, { principal: '1000000.00', currency: { code: 'USD', decimalPlaces: 2 } }))).toBe(false);
  });
  it.each([
    null,
    undefined,
    '',
    '   '
  ])('recognizes truly missing purpose %s', (purpose) =>
    expect(missingPurpose(loan(1, { loanPurposeName: purpose }))).toBe(true)
  );
  it.each([
    false,
    0,
    'Equipment'
  ])('does not classify a real value as missing: %s', (purpose) =>
    expect(missingPurpose(loan(1, { loanPurposeName: purpose }))).toBe(false)
  );
  it('rejects impossible calendar dates rather than normalizing them', () => {
    expect(
      calendarDate([
        2026,
        2,
        30
      ])
    ).toBeNull();
    expect(calendarDate('2026-13-01')).toBeNull();
    expect(
      calendarDate([
        2028,
        2,
        29
      ])
    ).toEqual(new Date(2028, 1, 29));
  });
  it.each([
    { multiDisburseLoan: true },
    { multiDisburseLoan: undefined },
    { loanType: { id: 4 } },
    { isTopup: true },
    { principal: '100.11' },
    { status: { id: 200, pendingApproval: false } }
  ])('refuses unsupported or stale preflight details %s', (patch) => {
    expect(reviewLoan(loan(), loan(1, patch), { approvalAmount: '100.10' })).toBeNull();
  });
  it.each([
    null,
    {},
    [],
    [{ requestId: 1, statusCode: 500 }],
    [{ requestId: 1, statusCode: 202 }],
    [{ requestId: 1, statusCode: 200, body: 'bad' }],
    [{ requestId: 1, statusCode: 200, body: '{}' }],
    [
      { requestId: 1, statusCode: 200 },
      { requestId: 1, statusCode: 200 }
    ]
  ])('keeps malformed and uncertain outcomes unresolved: %j', (response) =>
    expect(commandOutcome(response, 1, 10)).toBe('uncertain')
  );
  it.each([
    { commandId: true },
    { commandId: false, resourceId: 10 },
    { commandId: [] },
    { commandId: {} },
    { commandId: '' },
    { commandId: 0 },
    { commandId: -1 },
    { commandId: 1.5 },
    { commandId: '1e2' },
    { commandId: '9223372036854775808' },
    { commandId: 9007199254740992 },
    { resourceId: [10] },
    { resourceId: true },
    { resourceId: {} },
    { resourceId: '10.0' },
    { commandId: 12, resourceId: [] },
    { commandId: 12, resourceId: 0 }
  ])('leaves malformed API identifiers uncertain: %j', (body) =>
    expect(commandOutcome([{ requestId: 1, statusCode: 200, body: JSON.stringify(body) }], 1, 10)).toBe('uncertain')
  );
  it.each([
    12,
    '12',
    '9223372036854775807'
  ])('accepts a valid command-only Long ID: %s', (commandId) =>
    expect(commandOutcome([{ requestId: 1, statusCode: 200, body: { commandId, resourceId: null } }], 1, 10)).toBe(
      'review'
    )
  );
  it('compares only valid numeric or decimal-string resource IDs', () => {
    expect(
      commandOutcome([{ requestId: 1, statusCode: 200, body: { commandId: '12', resourceId: '10' } }], 1, 10)
    ).toBe('approved');
    expect(commandOutcome([{ requestId: 1, statusCode: 200, body: { resourceId: '11' } }], 1, 10)).toBe('uncertain');
  });
  it('captures a stable immutable review fingerprint, independent of object key order', () => {
    const detail = loan();
    const template = { approvalAmount: detail.principal, expectedDisbursementDate: [
        2026,
        11,
        20
      ] };
    const initial = reviewLoan(detail, detail, template);
    const reordered = Object.fromEntries(Object.entries(detail).reverse()) as unknown as ApprovalLoan;
    expect(
      reviewLoan(detail, reordered, { expectedDisbursementDate: [
          2026,
          11,
          20
        ], approvalAmount: detail.principal }).fingerprint
    ).toBe(initial.fingerprint);
    template.approvalAmount = '120.00';
    expect(initial.fingerprint).not.toBe(
      reviewLoan(loan(1, { principal: '120.00' }), loan(1, { principal: '120.00' }), template).fingerprint
    );
  });
  it('understands numeric/string HTTP statuses and command-only maker-checker results', () => {
    expect(commandOutcome([{ requestId: 1, statusCode: '200', body: '{"resourceId":10}' }], 1, 10)).toBe('approved');
    expect(commandOutcome([{ requestId: 1, statusCode: 200, body: '{"commandId":12}' }], 1, 10)).toBe('review');
    expect(commandOutcome([{ requestId: 1, statusCode: 400 }], 1, 10)).toBe('failed');
  });
});
