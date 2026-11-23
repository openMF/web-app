/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { provideNativeDateAdapter } from '@angular/material/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of, Subject, throwError } from 'rxjs';
import { Dates } from 'app/core/utils/dates';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { ClientsService } from 'app/clients/clients.service';
import { OrganizationService } from 'app/organization/organization.service';
import { SettingsService } from 'app/settings/settings.service';
import { TasksService } from '../../tasks.service';
import { ClientApprovalDataService } from './client-approval-data.service';
import { ClientApprovalComponent } from './client-approval.component';
import { ClientApprovalConfirmDialogComponent } from './client-approval-confirm-dialog.component';
import { PendingClient, batchOutcome, clientCalendarDate, nameWarning, waitingDays } from './client-approval.models';

const businessDate = new Date(2026, 10, 18);
function client(id = 1, patch: Partial<PendingClient> = {}): PendingClient {
  return {
    id,
    displayName: 'Synthetic Élise ' + id,
    accountNo: String(id).padStart(9, '0'),
    officeId: 1,
    officeName: 'Synthetic office',
    staffId: null,
    active: false,
    status: { id: 100 },
    timeline: { submittedOnDate: [
        2026,
        11,
        10
      ] },
    ...patch
  };
}

describe('ClientApprovalComponent', () => {
  let component: ClientApprovalComponent;
  let data: {
    snapshot: jest.Mock;
    account: jest.Mock;
    activationLocks: Set<number>;
    isActivationLocked: (id: number) => boolean;
    lockActivation: (id: number) => void;
  };
  let tasks: { getPendingClients: jest.Mock; submitBatchData: jest.Mock };
  let clients: { getClientData: jest.Mock; executeClientCommand: jest.Mock };
  let organization: { getOffices: jest.Mock; getStaff: jest.Mock };
  let dialog: { open: jest.Mock };
  let permissions: string[];
  let rows: PendingClient[];

  function create(settingsDate = businessDate, initialRows = [
      client(1),
      client(2),
      client(3)
    ]) {
    rows = initialRows;
    permissions = ['ALL_FUNCTIONS'];
    data = {
      activationLocks: new Set<number>(),
      isActivationLocked: (id) => data.activationLocks.has(id),
      lockActivation: (id) => {
        data.activationLocks.add(id);
      },
      snapshot: jest.fn(() => of({ rows, total: rows.length, complete: true })),
      account: jest.fn((accountNo) => {
        const match = rows.find((row) => row.accountNo === accountNo);
        return of({ rows: match ? [match] : [], total: match ? 1 : 0, complete: true });
      })
    };
    tasks = {
      getPendingClients: jest.fn(() => of({ totalFilteredRecords: rows.length, pageItems: rows.slice(0, 1) })),
      submitBatchData: jest.fn((requests) =>
        of(requests.map((request: any) => ({ requestId: request.requestId, statusCode: 200, body: '{}' })))
      )
    };
    clients = {
      getClientData: jest.fn((id) => of(rows.find((row) => row.id === Number(id)))),
      executeClientCommand: jest.fn(() => of({ resourceId: 1 }))
    };
    organization = {
      getOffices: jest.fn(() => of([{ id: 1, name: 'Synthetic office' }])),
      getStaff: jest.fn(() => of([{ id: 10, displayName: 'Synthetic officer' }]))
    };
    dialog = { open: jest.fn(() => ({ afterClosed: () => of(false) })) };
    TestBed.configureTestingModule({
      imports: [
        ClientApprovalComponent,
        TranslateModule.forRoot(),
        NoopAnimationsModule
      ],
      providers: [
        provideRouter([]),
        provideNativeDateAdapter(),
        { provide: ClientApprovalDataService, useValue: data },
        { provide: TasksService, useValue: tasks },
        { provide: ClientsService, useValue: clients },
        { provide: OrganizationService, useValue: organization },
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions }) } },
        {
          provide: SettingsService,
          useValue: { businessDate: settingsDate, dateFormat: 'dd MMMM yyyy', language: { code: 'en' } }
        },
        {
          provide: Dates,
          useValue: {
            formatDate: jest.fn(() => '18 November 2026'),
            angularToMomentFormat: () => 'DD MMMM YYYY',
            getMomentLocale: () => 'en'
          }
        },
        { provide: MatDialog, useValue: dialog }
      ]
    });
    const fixture = TestBed.createComponent(ClientApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    return fixture;
  }
  afterEach(() => jest.useRealTimers());

  it('uses and caps the inline date at the business date', () => {
    create();
    expect(component.activation.controls.date.value).toBe(businessDate);
    expect(component.maxDate).toBe(businessDate);
    component.activation.controls.date.setValue(new Date(2026, 10, 19));
    expect(component.activation.invalid).toBe(true);
  });
  it('falls back to current date for invalid business dates', () => {
    const now = new Date(2026, 10, 19);
    jest.useFakeTimers({ now });
    create(new Date(NaN));
    expect(component.maxDate).toEqual(now);
    expect(component.activation.controls.date.value).toBe(component.maxDate);
  });
  it('uses complete-scope metrics and office IDs, preserving account zeros and names', () => {
    create(businessDate, [
      client(1),
      client(2, {
        officeId: 2,
        officeName: 'Same label',
        staffId: 10,
        staffName: 'Officer',
        timeline: { submittedOnDate: [
            2026,
            11,
            11
          ] }
      })
    ]);
    expect(component.metrics).toMatchObject({ unassigned: 1, overdue: 1, offices: 2 });
    expect(component.groups).toHaveLength(2);
    expect(component.rows[0].accountNo).toBe('000000001');
    expect(component.rows[0].displayName).toBe('Synthetic Élise 1');
    expect(component.loading).toBe(false);
  });
  it('does not turn missing submission or office metadata into verified counts', () => {
    create(businessDate, [client(1, { officeId: undefined, officeName: undefined, timeline: undefined })]);
    expect(component.metrics.overdue).toBeNull();
    expect(component.metrics.offices).toBeNull();
    expect(component.waiting(component.rows[0])).toBeNull();
  });
  it('handles empty and failed reads as distinct states without a fabricated zero', () => {
    create(businessDate, []);
    expect(component.total).toBe(0);
    expect(component.error).toBe('');
    data.snapshot.mockReturnValue(throwError(() => new Error('offline')));
    tasks.getPendingClients.mockReturnValue(throwError(() => new Error('offline')));
    component.reload();
    expect(component.total).toBeNull();
    expect(component.error).toBe('clientApproval.loadError');
  });
  it('keeps the paginated table usable when the aggregate request fails', () => {
    create();
    data.snapshot.mockReturnValue(throwError(() => new Error('aggregate offline')));
    component.reload();
    expect(component.error).toBe('');
    expect(component.aggregationFailed).toBe(true);
    expect(component.total).toBe(3);
    expect(component.rows).toHaveLength(1);
    expect(component.metrics.unassigned).toBeNull();
    expect(component.complete).toBe(false);
  });
  it('server-paginates beyond 1000 and makes incomplete aggregates unavailable', () => {
    create();
    data.snapshot.mockReturnValue(
      of({ rows: Array.from({ length: 1000 }, (_, i) => client(i + 1)), total: 1200, complete: false })
    );
    component.reload();
    expect(component.total).toBe(1200);
    expect(component.metrics.unassigned).toBeNull();
    expect(component.rows).toHaveLength(10);
    component.toggle(component.rows[0]);
    tasks.getPendingClients.mockReturnValue(of({ totalFilteredRecords: 1200, pageItems: [client(11)] }));
    component.page({ pageIndex: 1, pageSize: 10, length: 1200 });
    expect(tasks.getPendingClients).toHaveBeenLastCalledWith(expect.objectContaining({ offset: 10, limit: 10 }));
    expect(component.selection.size).toBe(0);
    expect(component.rows[0].id).toBe(11);
  });
  it('recovers the last valid server page before publishing a shrunken result and resets an empty queue', () => {
    create();
    data.snapshot.mockReturnValue(of({ rows, total: 1200, complete: false }));
    component.reload();
    const corrected = new Subject<any>();
    tasks.getPendingClients.mockImplementation(({ offset }) =>
      offset === 1190 ? of({ totalFilteredRecords: 23, pageItems: [] }) : corrected
    );
    component.page({ pageIndex: 119, pageSize: 10, length: 1200 });
    expect(tasks.getPendingClients).toHaveBeenLastCalledWith(expect.objectContaining({ offset: 20, limit: 10 }));
    expect(component.total).toBe(1200);
    corrected.next({ totalFilteredRecords: 23, pageItems: [
        client(21),
        client(22),
        client(23)
      ] });
    corrected.complete();
    expect(component.pageIndex).toBe(2);
    expect(component.total).toBe(23);
    expect(component.rows.map((row) => row.id)).toEqual([
      21,
      22,
      23
    ]);
    tasks.getPendingClients.mockClear();
    tasks.getPendingClients.mockReturnValue(of({ totalFilteredRecords: 0, pageItems: [] }));
    component.page({ pageIndex: 1, pageSize: 10, length: 23 });
    expect(component.pageIndex).toBe(0);
    expect(component.total).toBe(0);
    expect(component.rows).toEqual([]);
    expect(tasks.getPendingClients).toHaveBeenCalledTimes(1);
  });
  it('refreshes the queue count only on entry, explicit refresh and once after processing', fakeAsync(() => {
    create();
    const countReads = () => tasks.getPendingClients.mock.calls.filter(([params]) => params.limit === 1).length;
    expect(countReads()).toBe(1);
    component.filters.controls.search.setValue('Élise');
    tick(300);
    component.filters.controls.officeId.setValue(1);
    component.filters.controls.staffId.setValue(10);
    component.reset();
    expect(countReads()).toBe(1);
    component.reload();
    expect(countReads()).toBe(2);
    component.toggle(component.rows[0]);
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });
    component.approveClients();
    expect(countReads()).toBe(3);
  }));
  it('cancels stale HTTP requests immediately, debounces names, and preserves accents', fakeAsync(() => {
    create();
    const old = new Subject<any>();
    data.snapshot.mockReturnValueOnce(old);
    component.reload();
    expect(old.observed).toBe(true);
    component.filters.controls.search.setValue('Élise');
    expect(old.observed).toBe(false);
    tick(299);
    expect(component.loading).toBe(true);
    tick(1);
    expect(data.snapshot).toHaveBeenLastCalledWith(expect.objectContaining({ displayName: 'Élise' }));
    old.next({ rows: [client(99)], total: 1, complete: true });
    expect(component.rows[0].id).toBe(1);
  }));
  it('looks up an exact account with leading zeros and clears selection on scope changes', fakeAsync(() => {
    create();
    component.toggle(component.rows[0]);
    component.filters.controls.search.setValue('000000001');
    expect(component.selection.size).toBe(0);
    tick(300);
    expect(data.account).toHaveBeenLastCalledWith('000000001', expect.anything());
    component.filters.controls.officeId.setValue(1);
    expect(organization.getStaff).toHaveBeenCalledWith(1);
    component.filters.controls.staffId.setValue(10);
    expect(data.account).toHaveBeenLastCalledWith('000000001', { officeId: 1, staffId: 10, displayName: undefined });
  }));
  it('routes alphanumeric account numbers unchanged to exact lookup before name search', fakeAsync(() => {
    create(businessDate, [client(1, { accountNo: 'HQ-00001' })]);
    component.filters.controls.search.setValue('HQ-00001');
    tick(300);
    expect(data.account).toHaveBeenLastCalledWith('HQ-00001', expect.anything());
    expect(data.snapshot).toHaveBeenCalledTimes(1);
    expect(component.rows[0].accountNo).toBe('HQ-00001');
  }));
  it('falls back to a name query after an exact lookup error but keeps numeric-account errors explicit', fakeAsync(() => {
    create();
    data.account.mockReturnValue(throwError(() => new Error('lookup unavailable')));
    component.filters.controls.search.setValue('Élise');
    tick(300);
    expect(data.snapshot).toHaveBeenLastCalledWith(expect.objectContaining({ displayName: 'Élise' }));
    expect(component.error).toBe('');
    expect(component.rows).toHaveLength(3);
    const nameReads = data.snapshot.mock.calls.length;
    component.filters.controls.search.setValue('000000001');
    tick(300);
    expect(component.error).toBe('clientApproval.loadError');
    expect(component.total).toBeNull();
    expect(data.snapshot).toHaveBeenCalledTimes(nameReads);
  }));
  it('keeps the shared date editor visible without selection and preserves a valid entered date for rows', () => {
    const fixture = create();
    expect(fixture.nativeElement.querySelector('.activation-date')).not.toBeNull();
    component.activation.controls.date.setValue(new Date(2026, 10, 19));
    expect(component.canApproveRow(component.rows[0])).toBe(false);
    const entered = new Date(2026, 10, 17);
    component.activation.controls.date.setValue(entered);
    expect(component.canApproveRow(component.rows[0])).toBe(true);
    component.clearSelection();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.activation-date')).not.toBeNull();
    expect(component.activation.controls.date.value).toBe(entered);
  });
  it('renders date-filtered rows immediately when an invalid submitted-from control is corrected', () => {
    const fixture = create();
    const start = component.filters.controls.submittedFrom;
    start.setValidators(Validators.required);
    start.setValue(null);
    expect(start.invalid).toBe(true);
    expect(component.rows).toHaveLength(0);
    start.setValue(new Date(2026, 10, 10));
    fixture.detectChanges();
    expect(component.filters.valid).toBe(true);
    expect(component.invalidRange).toBe(false);
    expect(component.rows).toHaveLength(3);
    expect(fixture.nativeElement.querySelectorAll('tbody tr')).toHaveLength(3);
  });
  it('filters full-scope dates inclusively, handles invalid ranges, and resets pagination', () => {
    create(businessDate, [
      client(1),
      client(2, { timeline: { submittedOnDate: [
            2026,
            11,
            12
          ] } })
    ]);
    component.filters.controls.submittedFrom.setValue(new Date(2026, 10, 12));
    expect(component.rows.map((row) => row.id)).toEqual([2]);
    component.filters.controls.submittedTo.setValue(new Date(2026, 10, 11));
    expect(component.invalidRange).toBe(true);
    expect(component.rows).toEqual([]);
    component.clearDates();
    expect(component.total).toBe(2);
    component.reset();
    expect(component.pageIndex).toBe(0);
  });
  it('selects only eligible current-page IDs and clears on collapse/page changes', () => {
    create(
      businessDate,
      Array.from({ length: 25 }, (_, i) => client(i + 1))
    );
    component.selectGroup(component.groups[0]);
    expect([...component.selection]).toEqual([
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10
    ]);
    expect(component.allSelected(component.groups[0])).toBe(true);
    component.toggleGroup(component.groups[0]);
    expect(component.selection.size).toBe(0);
    component.toggleGroup(component.groups[0]);
    component.selectGroup(component.groups[0]);
    component.page({ pageIndex: 1, pageSize: 10, length: 25 });
    expect(component.selection.size).toBe(0);
    expect(component.rows[0].id).toBe(11);
  });
  it('keeps read-only users from selecting or invoking any commands', () => {
    create();
    permissions = ['ALL_FUNCTIONS_READ'];
    component.toggle(component.rows[0]);
    component.selectGroup(component.groups[0]);
    component.approveClients(component.rows[0]);
    expect(component.selection.size).toBe(0);
    expect(dialog.open).not.toHaveBeenCalled();
    expect(tasks.submitBatchData).not.toHaveBeenCalled();
  });
  it('hides staff assignment without explicit mutation permission and refuses forged staff values', () => {
    const fixture = create();
    permissions = [
      'READ_CLIENT',
      'ACTIVATE_CLIENT'
    ];
    component.filters.controls.officeId.setValue(1);
    component.toggle(component.rows[0]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.assign-staff')).toBeNull();
    component.activation.controls.staffId.setValue(10);
    component.approveClients();
    expect(dialog.open).not.toHaveBeenCalled();
    expect(tasks.submitBatchData).not.toHaveBeenCalled();
  });
  it('requires explicit confirmation after a fresh eligibility read', () => {
    create();
    component.approveClients(component.rows[0]);
    expect(clients.getClientData).toHaveBeenCalledWith('1');
    expect(dialog.open).toHaveBeenCalledWith(
      ClientApprovalConfirmDialogComponent,
      expect.objectContaining({
        data: expect.objectContaining({ activationDate: '18 November 2026', clients: [client(1)] })
      })
    );
    expect(tasks.submitBatchData).not.toHaveBeenCalled();
  });
  it('blocks stale, already-active, invalid-date and unauthorized assignment requests', () => {
    create();
    clients.getClientData.mockReturnValue(of(client(1, { active: true })));
    component.approveClients(component.rows[0]);
    expect(dialog.open).not.toHaveBeenCalled();
    expect(component.error).toBe('clientApproval.staleSelection');
    component.reload();
    clients.getClientData.mockReturnValue(of(client(1)));
    clients.getClientData.mockClear();
    component.activation.controls.date.setValue(new Date(2026, 10, 9));
    component.approveClients(component.rows[0]);
    expect(clients.getClientData).not.toHaveBeenCalled();
    expect(dialog.open).not.toHaveBeenCalled();
  });
  it('restores the forms after the preflight deadline and allows a fresh attempt', fakeAsync(() => {
    create();
    const pending = new Subject<PendingClient>();
    clients.getClientData.mockReturnValue(pending);
    component.approveClients(component.rows[0]);
    expect(component.busy).toBe(true);
    expect(component.filters.disabled).toBe(true);
    tick(59999);
    expect(component.busy).toBe(true);
    tick(1);
    expect(component.error).toBe('clientApproval.preflightError');
    expect(component.busy).toBe(false);
    expect(component.filters.enabled).toBe(true);
    expect(component.activation.enabled).toBe(true);
    expect(pending.observed).toBe(false);
    expect(dialog.open).not.toHaveBeenCalled();
    expect(tasks.submitBatchData).not.toHaveBeenCalled();
    clients.getClientData.mockReturnValue(of(client(1)));
    component.reload();
    component.approveClients(component.rows[0]);
    expect(dialog.open).toHaveBeenCalledTimes(1);
  }));
  it('uses the activation date but never bulk staff assignment for an individual approval', () => {
    create();
    component.filters.controls.officeId.setValue(1);
    component.toggle(component.rows[0]);
    component.activation.controls.staffId.setValue(10);
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });
    component.approveClients(component.rows[1]);
    expect(dialog.open).toHaveBeenCalledWith(
      ClientApprovalConfirmDialogComponent,
      expect.objectContaining({
        data: expect.objectContaining({
          activationDate: '18 November 2026',
          clients: [client(2)],
          staffName: undefined
        })
      })
    );
    const requests = tasks.submitBatchData.mock.calls[0][0];
    expect(requests).toHaveLength(1);
    expect(requests[0].relativeUrl).toBe('clients/2?command=activate');
    expect(JSON.parse(requests[0].body)).toEqual({
      activationDate: '18 November 2026',
      dateFormat: 'dd MMMM yyyy',
      locale: 'en'
    });
    expect(clients.executeClientCommand).not.toHaveBeenCalled();
  });
  it('builds bounded unique batch IDs, reports mixed outcomes, never assigns uncertain clients, and refreshes', () => {
    create();
    component.filters.controls.officeId.setValue(1);
    component.activation.controls.staffId.setValue(10);
    component.selectGroup(component.groups[0]);
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });
    tasks.submitBatchData.mockReturnValue(
      of([
        { requestId: 1, statusCode: '200', body: '{}' },
        { requestId: 2, statusCode: 400 }
      ])
    );
    clients.executeClientCommand.mockReturnValue(throwError(() => ({ status: 400 })));
    component.approveClients();
    const requests = tasks.submitBatchData.mock.calls[0][0];
    expect(requests.map((request: any) => request.requestId)).toEqual([
      1,
      2,
      3
    ]);
    expect(JSON.parse(requests[0].body)).toEqual({
      activationDate: '18 November 2026',
      dateFormat: 'dd MMMM yyyy',
      locale: 'en'
    });
    expect(requests[0].relativeUrl).toBe('clients/1?command=activate');
    expect(component.outcomeCounts).toEqual({ succeeded: 1, failed: 1, uncertain: 1 });
    expect(clients.executeClientCommand).toHaveBeenCalledTimes(1);
    expect(clients.executeClientCommand).toHaveBeenCalledWith('1', 'assignStaff', { staffId: 10 });
    expect(component.outcomes[0].assignment).toBe('failed');
    expect(component.eligible(client(1))).toBe(false);
    expect(component.eligible(client(3))).toBe(false);
    expect(component.eligible(client(2))).toBe(true);
    expect(data.snapshot).toHaveBeenCalledTimes(3);
    expect(component.selection.size).toBe(0);
  });
  it('does not send assignment when unchanged, prevents duplicate clicks, and treats a lost batch as uncertain', () => {
    create();
    const response = new Subject<any>();
    tasks.submitBatchData.mockReturnValue(response);
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });
    component.approveClients(component.rows[0]);
    component.approveClients(component.rows[0]);
    expect(tasks.submitBatchData).toHaveBeenCalledTimes(1);
    expect(component.processing).toBe(true);
    response.error({ status: 0 });
    expect(component.outcomeCounts.uncertain).toBe(1);
    expect(component.processing).toBe(false);
    expect(clients.executeClientCommand).not.toHaveBeenCalled();
    component.approveClients(component.rows[0]);
    expect(tasks.submitBatchData).toHaveBeenCalledTimes(1);
  });
  it('locks the form during confirmation and allows cancelling safely', () => {
    create();
    const confirmation = new Subject<boolean>();
    dialog.open.mockReturnValue({ afterClosed: () => confirmation });
    component.approveClients(component.rows[0]);
    expect(component.busy).toBe(true);
    expect(component.filters.disabled).toBe(true);
    confirmation.next(false);
    confirmation.complete();
    expect(component.busy).toBe(false);
    expect(component.filters.enabled).toBe(true);
    expect(tasks.submitBatchData).not.toHaveBeenCalled();
  });
});

describe('client approval safety helpers', () => {
  it('uses strict calendar days across month boundaries and rejects impossible dates', () => {
    expect(clientCalendarDate('2026-02-30')).toBeNull();
    expect(clientCalendarDate('not a date')).toBeNull();
    expect(
      waitingDays(
        client(1, { submittedOnDate: [
            2026,
            3,
            7
          ] }),
        new Date(2026, 2, 15)
      )
    ).toBe(8);
    expect(waitingDays(client(1, { submittedOnDate: '2026-11-19' }), businessDate)).toBeNull();
  });
  it('warns on isolated punctuation and spacing without changing legitimate names', () => {
    expect(nameWarning('Synthetic Name .')).toBe(true);
    expect(nameWarning('Two  spaces')).toBe(true);
    expect(nameWarning('Dr. Élise St. John')).toBe(false);
  });
  it.each([
    200,
    '200',
    201,
    204
  ])('accepts settled success status %s', (statusCode) => {
    expect(batchOutcome([{ requestId: 1, statusCode }], 1)).toBe('succeeded');
  });
  it.each([
    0,
    202,
    408,
    500,
    undefined
  ])('treats status %s as uncertain', (statusCode) => {
    expect(batchOutcome([{ requestId: 1, statusCode }], 1)).toBe('uncertain');
  });
  it('does not infer success from missing, duplicated, malformed or checker-held responses', () => {
    expect(batchOutcome([], 1)).toBe('uncertain');
    expect(batchOutcome(null, 1)).toBe('uncertain');
    expect(
      batchOutcome(
        [
          { requestId: 1, statusCode: 200 },
          { requestId: 1, statusCode: 200 }
        ],
        1
      )
    ).toBe('uncertain');
    expect(batchOutcome([{ requestId: 1, statusCode: 200, body: '{' }], 1)).toBe('uncertain');
    expect(batchOutcome([{ requestId: 1, statusCode: 200, body: '{"commandId":7}' }], 1)).toBe('uncertain');
    expect(batchOutcome([{ requestId: 1, statusCode: '403' }], 1)).toBe('failed');
  });
});
