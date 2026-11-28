import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject, Subject, of } from 'rxjs';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { OperationsDashboardComponent } from './operations-dashboard.component';
import { OperationsDataService } from './operations-data.service';
import { Queue, QueuePage, creditTask, prospectTask } from './operations-task.model';

const approval = creditTask(
  { loanId: 1, clientId: 8, clientName: 'Synthetic Loan', status: { id: 100 }, submittedOnDate: '2026-11-08' },
  'approval',
  '2026-11-27'
)[0];
const registration = prospectTask({
  prospectId: 1,
  displayName: 'Synthetic Prospect',
  registrationStatus: 'PENDING'
})[0];

describe('Operations dashboard state and request lifecycle', () => {
  let component: OperationsDashboardComponent;
  let authState: Subject<boolean>;
  let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let identity: string;
  let businessDate: string;
  const data = {
    pageSize: 25,
    load: jest.fn(),
    audits: jest.fn(),
    lookupTask: jest.fn(),
    hasPermission: jest.fn(),
    scope: jest.fn(),
    identity: jest.fn()
  };
  const queuePage = (queue: Queue): QueuePage => ({
    queue,
    state: 'ready',
    tasks: queue === 'approval' ? [approval] : queue === 'registrations' ? [registration] : [],
    total: queue === 'approval' ? 997 : 1,
    count: 1
  });
  beforeEach(() => {
    authState = new Subject();
    params = new BehaviorSubject(convertToParamMap({}));
    identity = 'tenant-a';
    businessDate = '2026-11-27';
    data.lookupTask.mockReturnValue(of(null));
    data.identity.mockImplementation(() => identity);
    data.scope.mockImplementation(() => `${identity}|${businessDate}`);
    data.hasPermission.mockReturnValue(true);
    data.load.mockImplementation((queue: Queue) => of(queuePage(queue)));
    data.audits.mockReturnValue(of([]));
    TestBed.configureTestingModule({
      imports: [OperationsDashboardComponent],
      providers: [
        { provide: OperationsDataService, useValue: data },
        {
          provide: AuthenticationService,
          useValue: { isAuthenticated$: authState, getCredentials: () => ({ staffId: 7 }) }
        },
        { provide: ActivatedRoute, useValue: { queryParamMap: params } }
      ]
    }).overrideComponent(OperationsDashboardComponent, { set: { template: '' } });
    const fixture = TestBed.createComponent(OperationsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('uses authoritative approval totals and loaded prospect counts separately', () => {
    expect(component.approvals).toBe(997);
    expect(component.countQueue('registrations')).toBe(1);
    expect(component.tasks).toHaveLength(2);
  });
  it('selects the oldest verified task and shows recorded history only', () => {
    expect(component.selected.key).toBe(approval.key);
    expect(data.audits).toHaveBeenCalledWith('1');
    expect(component.history).toEqual([]);
  });
  it('preserves age when selecting an area and clears hidden selection', () => {
    component.setAge('overdue');
    component.setArea('prospect');
    expect(component.age).toBe('overdue');
    expect(component.visible).toEqual([]);
    expect(component.selected).toBeNull();
    expect(component.history).toBeNull();
  });
  it('searches names/references and does not classify unknown as on time', () => {
    component.search.setValue('Synthetic Prospect');
    expect(component.visible).toEqual([registration]);
    component.setAge('on-time');
    expect(component.visible).toEqual([]);
  });
  it('never presents technical registration dates as overdue or automatically escalated', () => {
    component.setArea('prospect');
    component.setAge('overdue');
    expect(component.visible).toHaveLength(0);
    expect(registration.flags).toEqual([]);
    expect(registration.eligibleActions).toEqual([]);
  });
  it('navigates only to a qualified matching authorized task key', () => {
    params.next(convertToParamMap({ operationsTask: 'prospect:1' }));
    expect(component.selected.key).toBe('prospect:1');
    expect(component.history).toBeNull();
  });
  it('does not select an unrelated record when a deep link is not loaded', () => {
    params.next(convertToParamMap({ operationsTask: 'prospect:99' }));
    expect(component.selected).toBeNull();
    expect(component.requestedMissing).toBe(true);
  });
  it('rejects invalid deep links', () => {
    params.next(convertToParamMap({ operationsTask: 'client:1' }));
    expect(component.requestedKey).toBe('');
  });
  it('does not refetch or write when filtering, selecting or reading details', () => {
    const calls = data.load.mock.calls.length;
    component.setAge('all');
    component.select(registration);
    component.search.setValue('synthetic');
    expect(data.load).toHaveBeenCalledTimes(calls);
    expect(registration.eligibleActions).toEqual([]);
  });
  it('isolates a queue failure and suppresses its approval total', () => {
    data.load.mockImplementation((queue: Queue) =>
      of(queue === 'approval' ? { ...queuePage(queue), state: 'error', tasks: [], total: null } : queuePage(queue))
    );
    component.refresh();
    expect(component.partialError).toBe(true);
    expect(component.approvals).toBeNull();
    expect(component.visible).toEqual([registration]);
  });
  it('cancels stale loads on refresh and drops previous data immediately', () => {
    const old = new Subject<QueuePage>();
    data.load.mockReturnValue(old);
    component.refresh();
    expect(component.loading).toBe(true);
    expect(component.tasks).toEqual([]);
    expect(component.selected).toBeNull();
    component.refresh();
    expect(old.observers.length).toBe(4);
    data.load.mockImplementation((queue: Queue) => of(queuePage(queue)));
    component.refresh();
    expect(old.observers).toHaveLength(0);
    old.next({ queue: 'approval', state: 'ready', tasks: [], count: 0, total: 0 });
    expect(component.approvals).toBe(997);
  });
  it('cancels task history when switching to a different task', () => {
    const history = new Subject<any>();
    data.audits.mockReturnValue(history);
    component.select(approval);
    expect(history.observers).toHaveLength(1);
    component.select(registration);
    expect(history.observers).toHaveLength(0);
    expect(component.history).toBeNull();
  });
  it('clears selection, requested identity and pages when the tenant changes', () => {
    component.pageIndex.approval = 3;
    component.select(registration);
    identity = 'tenant-b';
    authState.next(true);
    expect(component.pageIndex.approval).toBe(0);
    expect(component.requestedKey).toBe('');
    expect(component.selected.key).toBe(approval.key);
  });
  it('reloads ages but keeps the requested task and pages when only the business date changes', () => {
    const exact = { ...approval, key: 'loan:99:approval', sourceId: '99' };
    data.lookupTask.mockReturnValue(of(exact));
    params.next(convertToParamMap({ operationsTask: exact.key }));
    component.pageIndex.approval = 1;
    const calls = data.load.mock.calls.length;
    businessDate = '2026-11-28';
    authState.next(true);
    expect(data.load.mock.calls.length).toBeGreaterThan(calls);
    expect(data.load).toHaveBeenCalledWith('approval', 1);
    expect(component.pageIndex.approval).toBe(1);
    expect(component.requestedKey).toBe(exact.key);
    expect(component.selected.key).toBe(exact.key);
  });
  it('does not reload for repeated authentication notifications in the same scope', () => {
    const calls = data.load.mock.calls.length;
    authState.next(true);
    expect(data.load).toHaveBeenCalledTimes(calls);
  });
  it('blocks file navigation without related resource read permissions', () => {
    data.hasPermission.mockReturnValue(false);
    expect(component.fileRoute(approval)).toBeNull();
  });
  it('recovers when a refresh removes a final source page', () => {
    component.pageIndex.approval = 2;
    data.load.mockImplementation((queue: Queue, page: number) =>
      of(
        queue === 'approval' && page === 2
          ? { queue, state: 'ready', tasks: [], count: 0, total: 25 }
          : queuePage(queue)
      )
    );
    component.refresh();
    expect(component.pageIndex.approval).toBe(0);
    expect(component.loading).toBe(false);
  });
  it('selects an exact qualified task outside the loaded queue and refetches it on refresh', () => {
    const exact = { ...approval, key: 'loan:99:approval', sourceId: '99' };
    data.lookupTask.mockReturnValue(of(exact));
    params.next(convertToParamMap({ operationsTask: exact.key }));
    expect(component.selected.key).toBe(exact.key);
    expect(component.tasks).toContain(exact);
    component.refresh();
    expect(data.lookupTask).toHaveBeenCalledTimes(2);
    expect(component.selected.key).toBe(exact.key);
  });
  it('cancels an exact task lookup when filters hide the requested identity', () => {
    const lookup = new Subject<any>();
    data.lookupTask.mockReturnValue(lookup);
    params.next(convertToParamMap({ operationsTask: 'loan:99:approval' }));
    expect(lookup.observers).toHaveLength(1);
    component.setArea('prospect');
    expect(lookup.observers).toHaveLength(0);
    expect(component.selected).not.toEqual(expect.objectContaining({ key: 'loan:99:approval' }));
  });
  it('keeps at most one requested task outside the bounded queue pages', () => {
    data.lookupTask.mockImplementation((key: string) => of({ ...approval, key, sourceId: key.split(':')[1] }));
    params.next(convertToParamMap({ operationsTask: 'loan:99:approval' }));
    params.next(convertToParamMap({ operationsTask: 'loan:100:approval' }));
    expect(component.tasks).toHaveLength(3);
    expect(component.tasks.some((task) => task.sourceId === '99')).toBe(false);
    expect(component.selected.key).toBe('loan:100:approval');
  });
});
