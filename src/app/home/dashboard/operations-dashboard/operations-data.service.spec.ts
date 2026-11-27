import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { TasksService } from 'app/tasks/tasks.service';
import { LoansService } from 'app/loans/loans.service';
import { SystemService } from 'app/system/system.service';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { SettingsService } from 'app/settings/settings.service';
import { OperationsDataService } from './operations-data.service';
import { Queue, QueuePage } from './operations-task.model';

describe('OperationsDataService contracts', () => {
  let service: OperationsDataService;
  let permissions: string[];
  let response: any;
  let tenant: string;
  let businessDate: Date;
  const tasks = { getPendingProspects: jest.fn(), getEnrollmentCases: jest.fn(), getCreditApplications: jest.fn() };
  const loans = { getLoanAccountDetails: jest.fn() };
  const audit = { getAuditTrails: jest.fn() };
  const read = (queue: Queue, index = 0): QueuePage => {
    let result: QueuePage;
    service.load(queue, index).subscribe((page) => (result = page));
    return result;
  };
  beforeEach(() => {
    permissions = ['ALL_FUNCTIONS'];
    tenant = 'synthetic';
    businessDate = new Date(2026, 10, 27);
    response = {
      pageItems: [
        { loanId: 11, clientId: 2, clientName: 'Synthetic Client', status: { id: 100 }, submittedOnDate: '2026-11-08' }
      ],
      totalFilteredRecords: 997
    };
    Object.values(tasks).forEach((mock) => mock.mockImplementation(() => of(response)));
    loans.getLoanAccountDetails.mockReturnValue(of(null));
    audit.getAuditTrails.mockReturnValue(of({ pageItems: [] }));
    TestBed.configureTestingModule({
      providers: [
        OperationsDataService,
        { provide: TasksService, useValue: tasks },
        { provide: SystemService, useValue: audit },
        { provide: LoansService, useValue: loans },
        {
          provide: AuthenticationService,
          useValue: { getCredentials: () => ({ userId: 1, staffId: 7, officeId: 1, permissions }) }
        },
        {
          provide: SettingsService,
          useValue: {
            get tenantIdentifier() {
              return tenant;
            },
            serverHost: 'synthetic-host',
            get businessDate() {
              return businessDate;
            }
          }
        }
      ]
    });
    service = TestBed.inject(OperationsDataService);
  });
  it('uses the authoritative approval total, not page size or requested amounts', () => {
    const page = read('approval');
    expect(page.total).toBe(997);
    expect(page.tasks).toHaveLength(1);
    expect(page.tasks[0].daysWaiting).toBe(19);
    expect(tasks.getCreditApplications).toHaveBeenCalledWith({
      status: 100,
      offset: 0,
      limit: 25,
      orderBy: 'submittedOnDate',
      sortOrder: 'ASC'
    });
  });
  it('uses bounded server paging for disbursements', () => {
    response.pageItems[0].status.id = 200;
    expect(read('disbursement', 2).state).toBe('ready');
    expect(tasks.getCreditApplications).toHaveBeenCalledWith(
      expect.objectContaining({ status: 200, offset: 50, limit: 25 })
    );
  });
  it('cannot derive global pending prospects from a partial page including terminal records', () => {
    response = {
      pageItems: [
        { prospectId: 11, registrationStatus: 'PENDING' },
        { prospectId: 12, registrationStatus: 'COMPLETED' }
      ],
      totalFilteredRecords: 100
    };
    const page = read('registrations');
    expect(page.tasks).toHaveLength(1);
    expect(page.total).toBe(100);
    expect(page.count).toBe(2);
  });
  it('ignores monetary inputs across currencies rather than manufacturing portfolio, PAR or collections', () => {
    response.pageItems = [
      { ...response.pageItems[0], amount: 0.10000001, currencyCode: 'USD' },
      { ...response.pageItems[0], loanId: 12, amount: '9007199254740993.12', currencyCode: 'MXN' }
    ];
    const page = read('approval');
    expect(page.tasks).toHaveLength(2);
    expect(page).not.toHaveProperty('portfolio');
    expect(page).not.toHaveProperty('par30');
    expect(page.tasks[0]).not.toHaveProperty('amount');
  });
  it('does not fabricate an age when the business date is missing', () => {
    businessDate = new Date(NaN);
    expect(read('approval').tasks[0].daysWaiting).toBeNull();
  });
  it('requires both client and enrollment read permissions', () => {
    permissions = ['READ_CLIENT'];
    expect(read('enrollment').state).toBe('denied');
    expect(tasks.getEnrollmentCases).not.toHaveBeenCalled();
  });
  it.each([
    'registrations',
    'approval',
    'disbursement',
    'enrollment'
  ] as Queue[])('performs no queue request without permission for %s', (queue) => {
    permissions = [];
    expect(read(queue).state).toBe('denied');
    expect(Object.values(tasks).every((mock) => !mock.mock.calls.length)).toBe(true);
  });
  it.each([
    null,
    {},
    { pageItems: [] },
    { pageItems: [], totalFilteredRecords: 2 },
    { pageItems: [{ loanId: 1, status: { id: 300 } }], totalFilteredRecords: 1 },
    { pageItems: [{ loanId: -1 }], totalFilteredRecords: 1 }
  ])('rejects malformed or contradictory responses %s', (value) => {
    response = value;
    expect(read('approval').state).toBe('error');
    expect(read('approval').total).toBeNull();
  });
  it('rejects duplicate source identities', () => {
    response.pageItems.push(response.pageItems[0]);
    expect(read('approval').state).toBe('error');
  });
  it('preserves an empty valid page as ready and real zero', () => {
    response = { pageItems: [], totalFilteredRecords: 0 };
    expect(read('approval')).toEqual({ queue: 'approval', state: 'ready', tasks: [], total: 0, count: 0 });
  });
  it('isolates source failures without a false zero total', () => {
    tasks.getCreditApplications.mockReturnValue(throwError(() => ({ status: 503 })));
    const page = read('approval');
    expect(page.state).toBe('error');
    expect(page.total).toBeNull();
  });
  it('scopes cache identity to the current tenant and permissions', () => {
    const before = service.scope();
    tenant = 'different';
    expect(service.scope()).not.toBe(before);
    const next = service.scope();
    permissions = [];
    expect(service.scope()).not.toBe(next);
  });
  it('keeps identity stable across business date changes while refreshing scope', () => {
    const identity = service.identity();
    const scope = service.scope();
    businessDate = new Date(2026, 10, 28);
    expect(service.identity()).toBe(identity);
    expect(service.scope()).not.toBe(scope);
    tenant = 'different';
    expect(service.identity()).not.toBe(identity);
  });
  it('does not fetch audit activity with audit permission alone', () => {
    permissions = ['READ_AUDIT'];
    let result: unknown;
    service.audits().subscribe((value) => (result = value));
    expect(result).toBeNull();
    expect(audit.getAuditTrails).not.toHaveBeenCalled();
  });
  it('fetches only the bounded loan audit feed and exact selected resource', () => {
    const event = {
      id: 1,
      entityName: 'LOAN',
      resourceId: 11,
      madeOnDate: 1795700000000,
      maker: 'Synthetic auditor',
      actionName: 'CREATE',
      processingResult: 'Processed'
    };
    audit.getAuditTrails.mockReturnValue(of({ pageItems: [event] }));
    let events: unknown;
    service.audits('11').subscribe((result) => (events = result));
    expect(events).toEqual([event]);
    expect(audit.getAuditTrails).toHaveBeenCalledWith(
      [
        { type: 'entityName', value: 'LOAN' },
        { type: 'resourceId', value: '11' }
      ],
      'madeOnDate',
      'DESC',
      0,
      10
    );
  });
  it('rejects resource mismatch and never turns snapshots into history', () => {
    audit.getAuditTrails.mockReturnValue(
      of({ pageItems: [{ id: 1, entityName: 'CLIENT', resourceId: 11, madeOnDate: 1795700000000 }] })
    );
    let events: unknown;
    service.audits('11').subscribe((result) => (events = result));
    expect(events).toBeNull();
  });
  it('resolves an exact pending loan task outside the loaded page without scanning loans', () => {
    loans.getLoanAccountDetails.mockReturnValue(
      of({
        id: 99,
        clientId: 2,
        clientName: 'Synthetic Exact Loan',
        status: { id: 100 },
        timeline: { submittedOnDate: '2026-11-01' }
      })
    );
    let task: any;
    service.lookupTask('loan:99:approval').subscribe((value) => (task = value));
    expect(task.key).toBe('loan:99:approval');
    expect(task.daysWaiting).toBe(26);
    expect(loans.getLoanAccountDetails).toHaveBeenCalledWith('99');
    expect(tasks.getCreditApplications).not.toHaveBeenCalled();
  });
  it.each([
    { id: 98, status: { id: 100 } },
    { id: 99, status: { id: 300 } }
  ])('rejects a mismatched or completed exact loan %s', (row) => {
    loans.getLoanAccountDetails.mockReturnValue(of(row));
    let task: unknown;
    service.lookupTask('loan:99:approval').subscribe((value) => (task = value));
    expect(task).toBeNull();
  });
  it('resolves client activation by the verified enrollment client filter', () => {
    response = {
      pageItems: [
        {
          clientId: 99,
          clientName: 'Synthetic Activation',
          enrollmentStages: [{ name: 'ACTIVATION', status: 'PENDING' }]
        }
      ],
      totalFilteredRecords: 1
    };
    let task: any;
    service.lookupTask('enrollment:99:ACTIVATION').subscribe((value) => (task = value));
    expect(task.key).toBe('enrollment:99:ACTIVATION');
    expect(task.source).toBe('onboarding');
    expect(tasks.getEnrollmentCases).toHaveBeenCalledWith({ view: 'enrollment', clientId: '99', offset: 0, limit: 25 });
  });
  it('does not use an unsupported prospect lookup or issue unauthorized detail reads', () => {
    service.lookupTask('prospect:99').subscribe((value) => expect(value).toBeNull());
    permissions = [];
    service.lookupTask('loan:99:approval').subscribe((value) => expect(value).toBeNull());
    service.lookupTask('enrollment:99:ACTIVATION').subscribe((value) => expect(value).toBeNull());
    expect(loans.getLoanAccountDetails).not.toHaveBeenCalled();
    expect(tasks.getEnrollmentCases).not.toHaveBeenCalled();
  });
  it('accepts an empty page past the server total for removed-page recovery', () => {
    response = { pageItems: [], totalFilteredRecords: 25 };
    expect(read('approval', 2).state).toBe('ready');
  });
});
