/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DatePipe } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faCheck, faSearch, faTimes, faTrash, faUndo } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, of, Subject, throwError } from 'rxjs';
import enUs from 'assets/translations/en-US.json';
import frFr from 'assets/translations/fr-FR.json';

import { ClientsService } from 'app/clients/clients.service';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { SettingsService } from 'app/settings/settings.service';
import { environment } from 'environments/environment';
import { CheckerInboxCountService } from '../../checker-inbox-count.service';
import { TasksService } from '../../tasks.service';
import { CheckerInboxComponent } from './checker-inbox.component';

/** The slice of the `/clients` search response the customer autocomplete reads. */
interface CustomerOption {
  id: number;
  displayName: string;
}

interface CustomerLookupResponse {
  content: CustomerOption[];
}

describe('CheckerInboxComponent', () => {
  let component: CheckerInboxComponent;
  let fixture: ComponentFixture<CheckerInboxComponent>;
  let searchByText: jest.Mock;
  let getMakerCheckerData: jest.Mock;
  let translate: TranslateService;
  let queryParams: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let getPendingCheckerRecord: jest.Mock;
  let getCheckerInboxDetail: jest.Mock;
  let executeMakerCheckerAction: jest.Mock;
  let deleteMakerChecker: jest.Mock;
  let openDialog: jest.Mock;
  let permissionsState: string[];
  let currentScope: string;
  let authenticated: BehaviorSubject<boolean>;

  const record = {
    maker: 'maker',
    processingResult: 'Awaiting Approval',
    clientName: 'Synthetic Client',
    clientId: 1,
    id: 23,
    actionName: 'UPDATE',
    entityName: 'CLIENT',
    resourceId: 1,
    madeOnDate: 1789064261493
  };
  const originalRbac = environment.productionModeEnableRBAC;

  function createComponent(
    customerLookup: Observable<CustomerLookupResponse> = of({ content: [] }),
    permissions: string[] = ['ALL_FUNCTIONS']
  ) {
    permissionsState = permissions;
    currentScope = 'session-one';
    authenticated = new BehaviorSubject(true);
    queryParams = new BehaviorSubject(convertToParamMap({}));
    getPendingCheckerRecord = jest.fn((row: typeof record) => of({ ...record, id: row.id }));
    getCheckerInboxDetail = jest.fn(() => of({ ...record, commandAsJson: '{"mobileNo":"55","password":"hidden"}' }));
    executeMakerCheckerAction = jest.fn(() => of({ commandId: 23 }));
    deleteMakerChecker = jest.fn(() => of({ commandId: 23 }));
    openDialog = jest.fn(() => ({ afterClosed: () => of({ confirm: true }) }));
    searchByText = jest.fn(() => customerLookup);
    getMakerCheckerData = jest.fn(() => of([record]));

    TestBed.configureTestingModule({
      imports: [
        CheckerInboxComponent,
        TranslateModule.forRoot(),
        NoopAnimationsModule
      ],
      providers: [
        DatePipe,
        provideNativeDateAdapter(),
        provideRouter([]),
        {
          provide: TasksService,
          useValue: {
            getMakerCheckerData,
            getCheckerInboxDetail,
            getPendingCheckerRecord,
            executeMakerCheckerAction,
            deleteMakerChecker
          }
        },
        { provide: ClientsService, useValue: { searchByText } },
        { provide: MatDialog, useValue: { open: openDialog } },
        { provide: CheckerInboxCountService, useValue: { scope: () => currentScope } },
        {
          provide: AuthenticationService,
          useValue: {
            isAuthenticated$: authenticated,
            getCredentials: () => (authenticated.value ? { permissions: permissionsState, username: 'reviewer' } : null)
          }
        },
        { provide: SettingsService, useValue: { dateFormat: 'dd MMMM yyyy', language: { code: 'en' } } },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: queryParams,
            data: of({
              makerCheckerResource: { scope: currentScope, rows: [record] },
              makerCheckerTemplate: { actionNames: ['UPDATE'], entityNames: ['CLIENT'] }
            })
          }
        }
      ]
    });

    TestBed.inject(FaIconLibrary).addIcons(faCheck, faSearch, faTimes, faTrash, faUndo);

    fixture = TestBed.createComponent(CheckerInboxComponent);
    component = fixture.componentInstance;
    translate = TestBed.inject(TranslateService);
    translate.setTranslation('en-US', enUs);
    translate.setTranslation('fr-FR', frFr);
    fixture.detectChanges();
  }

  function render() {
    // The component is OnPush, so mark its view dirty before rendering direct state changes.
    fixture.debugElement.injector.get(ChangeDetectorRef).markForCheck();
    fixture.detectChanges();
  }

  /** Switches the fixture to a real locale file so assertions cover the shipped text, not the key. */
  function useLocale(locale: 'en-US' | 'fr-FR') {
    translate.use(locale);
    render();
  }

  function renderedText(): string {
    return (fixture.nativeElement as HTMLElement).textContent || '';
  }

  afterEach(() => {
    environment.productionModeEnableRBAC = originalRbac;
  });

  it('clears every filter, the customer control and the options, then reloads', () => {
    createComponent();
    component.makerCheckerSearchForm.patchValue({
      makerDateTimeFrom: new Date(2026, 0, 1),
      makerDateTimeTo: new Date(2026, 11, 31),
      actionName: 'UPDATE',
      entityName: 'CLIENT',
      resourceId: '1'
    });
    component.customerControl.setValue({ id: 1, displayName: 'Web Tester' });
    component.customers = [{ id: 1, displayName: 'Web Tester' }];

    component.resetFilters();

    expect(component.makerCheckerSearchForm.value).toEqual({
      makerId: null,
      makerDateTimeFrom: null,
      makerDateTimeTo: null,
      actionName: null,
      entityName: null,
      resourceId: null
    });
    expect(component.customerControl.value).toBe('');
    expect(component.customers).toEqual([]);
    expect(getMakerCheckerData).toHaveBeenCalled();
  });

  it('does not send a cleared filter as a query parameter', () => {
    createComponent();
    component.makerCheckerSearchForm.patchValue({ actionName: 'UPDATE', resourceId: '1' });

    component.resetFilters();

    const params = getMakerCheckerData.mock.calls.at(-1)[0];
    expect(params.actionName).toBeNull();
    expect(params.resourceId).toBeNull();
    expect(params.clientId).toBeUndefined();
  });

  it('drops a customer lookup that resolves after the reset', fakeAsync(() => {
    const lookup = new Subject<CustomerLookupResponse>();
    createComponent(lookup);

    component.customerControl.setValue('web');
    tick(300);
    expect(searchByText).toHaveBeenCalledWith('web', 0, 20);

    component.resetFilters();
    lookup.next({ content: [{ id: 1, displayName: 'Web Tester' }] });
    lookup.complete();

    // Reset cancels the lookup immediately, before the next search debounce.
    expect(component.customers).toEqual([]);

    tick(300);
    expect(component.customers).toEqual([]);
  }));

  describe('operational messages', () => {
    it('renders the processing status in French with the item count', () => {
      createComponent();
      useLocale('fr-FR');

      component.processing = true;
      component.processingCount = 3;
      render();

      expect(renderedText()).toContain('Traitement de 3 élément(s) de vérification…');
      expect(renderedText()).not.toContain('Processing 3 checker item(s)');
    });

    it('renders the processed summary and failed record IDs in French', () => {
      createComponent();
      useLocale('fr-FR');

      component.actionResult = {
        action: 'approve',
        succeeded: 2,
        failed: [
          { id: 5, error: 'not allowed' },
          { id: 7 }
        ]
      };
      render();

      expect(renderedText()).toContain('4 tâches traitées : 2 réussies, 2 échouées.');
      expect(renderedText()).toContain('ID des enregistrements en échec :');
      expect(renderedText()).toContain('5: not allowed;');
      expect(renderedText()).toContain('7;');
    });

    it('renders the loading status in French', () => {
      createComponent();
      useLocale('fr-FR');

      component.loading = true;
      render();

      expect(renderedText()).toContain('Chargement de la boîte de réception du vérificateur…');
    });

    it('renders a translatable error when the maker-checkers request fails', () => {
      createComponent();
      useLocale('fr-FR');
      getMakerCheckerData.mockReturnValue(throwError(() => new Error('makercheckers request failed')));

      component.search();
      render();

      expect(renderedText()).toContain(
        'Impossible de charger la boîte de réception du vérificateur. Veuillez relancer votre recherche.'
      );
      expect(renderedText()).not.toContain('Unable to load checker inbox');
    });

    it('renders the permission message in French when no row can be actioned', () => {
      environment.productionModeEnableRBAC = true;
      createComponent(of({ content: [] }), []);
      useLocale('fr-FR');

      expect(renderedText()).toContain(
        'Vous n’avez pas l’autorisation d’agir sur les éléments de vérification de cette liste.'
      );
    });

    it('keeps the original English wording', () => {
      createComponent();
      useLocale('en-US');

      component.processing = true;
      component.processingCount = 3;
      render();
      expect(renderedText()).toContain('Processing 3 checker item(s)…');

      component.processing = false;
      component.actionResult = {
        action: 'approve',
        succeeded: 2,
        failed: [
          { id: 5, error: 'not allowed' },
          { id: 7 }
        ]
      };
      render();
      expect(renderedText()).toContain('4 tasks processed: 2 succeeded, 2 failed.');
      expect(renderedText()).toContain('Failed record IDs:');

      component.actionResult = null;
      component.loading = true;
      render();
      expect(renderedText()).toContain('Loading checker inbox…');

      component.loading = false;
      component.searchError = true;
      render();
      expect(renderedText()).toContain('Unable to load checker inbox. Please try your search again.');
    });

    it('keeps the original English permission wording', () => {
      environment.productionModeEnableRBAC = true;
      createComponent(of({ content: [] }), []);
      useLocale('en-US');

      expect(renderedText()).toContain('You do not have permission to action the checker items in this list.');
    });
  });
  it('loads resolved records with real resource, request ID, maker and timestamp', () => {
    createComponent();
    useLocale('en-US');
    expect(renderedText()).toContain('#23');
    expect(renderedText()).toContain('Synthetic Client');
    expect(renderedText()).toContain('maker');
    expect(renderedText()).toContain('2026');
    expect(getMakerCheckerData).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.selection-toolbar')).toBeNull();
  });

  it.each([
    'makerId',
    'actionName',
    'entityName',
    'resourceId'
  ])(
    'automatically queries %s and clears hidden selections immediately',
    fakeAsync((field: string) => {
      createComponent();
      component.masterToggle();
      const value = field === 'makerId' ? 7 : field === 'resourceId' ? '52' : 'UPDATE';
      component.makerCheckerSearchForm.get(field).setValue(value);
      expect(component.selection.hasValue()).toBe(false);
      expect(component.loading).toBe(true);
      tick(250);
      expect(getMakerCheckerData.mock.calls.at(-1)[0][field]).toBe(value);
    })
  );

  it('serializes valid dates and prevents queries for invalid or reversed ranges', fakeAsync(() => {
    createComponent();
    component.makerCheckerSearchForm.patchValue({
      makerDateTimeFrom: new Date(2026, 0, 2),
      makerDateTimeTo: new Date(2026, 0, 3)
    });
    tick(250);
    expect(getMakerCheckerData.mock.calls.at(-1)[0]).toMatchObject({
      makerDateTimeFrom: '02 January 2026',
      makerDateTimeTo: '03 January 2026'
    });
    getMakerCheckerData.mockClear();
    component.makerCheckerSearchForm.patchValue({ makerDateTimeTo: new Date(2025, 0, 1) });
    tick(250);
    expect(component.makerCheckerSearchForm.invalid).toBe(true);
    expect(getMakerCheckerData).not.toHaveBeenCalled();
    component.makerCheckerSearchForm.patchValue({ makerDateTimeTo: new Date('invalid') });
    tick(250);
    expect(getMakerCheckerData).not.toHaveBeenCalled();
  }));

  it('searches authoritative resource/account/name/id fields locally without a generic backend q', fakeAsync(() => {
    createComponent();
    component.customerControl.setValue('Synthetic');
    tick(300);
    expect(component.dataSource.filteredData).toHaveLength(1);
    expect(searchByText).toHaveBeenCalledWith('Synthetic', 0, 20);
    expect(getMakerCheckerData).not.toHaveBeenCalled();
    component.applyFilter('23');
    expect(component.dataSource.filteredData).toHaveLength(1);
    component.applyFilter('absent');
    expect(component.dataSource.filteredData).toHaveLength(0);
  }));

  it('queries only the selected customer ID and clears old autocomplete results', fakeAsync(() => {
    createComponent();
    component.customerControl.setValue({ id: 42, displayName: 'Test' });
    tick(300);
    expect(getMakerCheckerData.mock.calls.at(-1)[0]).toMatchObject({ clientId: 42 });
    expect(getMakerCheckerData.mock.calls.at(-1)[0]).not.toHaveProperty('q');
    component.customerControl.setValue('');
    tick(300);
    expect(getMakerCheckerData.mock.calls.at(-1)[0].clientId).toBeUndefined();
  }));

  it('cancels stale searches before a new filter debounce elapses', fakeAsync(() => {
    createComponent();
    const first = new Subject<any[]>();
    getMakerCheckerData.mockReturnValueOnce(first).mockReturnValueOnce(of([{ ...record, id: 99 }]));
    component.search();
    component.makerCheckerSearchForm.patchValue({ actionName: 'CREATE' });
    expect(first.observed).toBe(false);
    first.next([{ ...record, id: 98 }]);
    tick(250);
    expect(component.dataSource.data[0].id).toBe(99);
  }));

  it('loads details without writes and resets JSON and previous sensitive state on rapid switching', () => {
    createComponent();
    const first = new Subject<any>();
    const second = new Subject<any>();
    getCheckerInboxDetail.mockReturnValueOnce(first).mockReturnValueOnce(second);
    component.openDetail(record);
    expect(component.detailLoading).toBe(true);
    component.jsonOpen = true;
    component.openDetail({ ...record, id: 24 });
    expect(first.observed).toBe(false);
    expect(component.detail).toBeNull();
    expect(component.jsonOpen).toBe(false);
    first.next({ ...record, commandAsJson: '{"emailAddress":"old"}' });
    second.next({ ...record, id: 24, commandAsJson: '{"emailAddress":"new"}' });
    second.complete();
    expect(component.detail.id).toBe(24);
    expect(component.presentation.json).toContain('new');
    expect(component.presentation.json).not.toContain('old');
    expect(executeMakerCheckerAction).not.toHaveBeenCalled();
  });

  it('handles inaccessible and mismatched audit details conservatively', () => {
    createComponent();
    getCheckerInboxDetail
      .mockReturnValueOnce(throwError(() => new Error()))
      .mockReturnValueOnce(of({ ...record, id: 99 }));
    component.openDetail(record);
    expect(component.detailError).toBe(true);
    component.openDetail(record);
    expect(component.detailError).toBe(true);
    expect(component.detail).toBeNull();
  });

  it('renders requested-only changes, redacts JSON and disables the unsupported rejection comment', () => {
    createComponent();
    useLocale('en-US');
    component.openDetail(record);
    render();
    expect(renderedText()).toContain('Requested changes');
    expect(renderedText()).not.toContain('Previous');
    expect(renderedText()).not.toContain('hidden');
    expect(component.rejectionForm.get('comment').disabled).toBe(true);
    expect(renderedText()).toContain('cannot save a rejection reason');
  });

  it('locks own requests, missing identities, and action-specific permissions even with RBAC display disabled', () => {
    environment.productionModeEnableRBAC = false;
    createComponent(of({ content: [] }), ['UPDATE_CLIENT_CHECKER']);
    expect(component.canAction(record)).toBe(true);
    expect(component.canAction({ ...record, maker: 'REVIEWER' })).toBe(false);
    expect(component.canAction({ ...record, maker: undefined })).toBe(false);
    expect(component.canAction({ ...record, entityName: 'LOAN' })).toBe(false);
    permissionsState = ['CHECKER_SUPER_USER'];
    expect(component.canAction({ ...record, entityName: 'LOAN' })).toBe(true);
    expect(component.canAction({ ...record, maker: 'reviewer' })).toBe(false);
  });

  it('selects only visible eligible requests and shows contextual actions only while selected', () => {
    createComponent();
    component.dataSource.data = [
      record,
      { ...record, id: 24, maker: 'reviewer' },
      { ...record, id: 25, maker: undefined }
    ];
    component.masterToggle();
    render();
    expect(component.selection.selected.map((row) => row.id)).toEqual([23]);
    expect(component.isAllSelected()).toBe(true);
    expect(fixture.nativeElement.querySelector('.selection-toolbar')).not.toBeNull();
    component.applyFilter('24');
    render();
    expect(component.selection.hasValue()).toBe(false);
    expect(fixture.nativeElement.querySelector('.selection-toolbar')).toBeNull();
    component.masterToggle();
    expect(component.selection.hasValue()).toBe(false);
  });

  it('clears selections on sorting and refresh', () => {
    createComponent();
    component.masterToggle();
    component.setOrder(false);
    expect(component.selection.hasValue()).toBe(false);
    component.masterToggle();
    component.reload();
    expect(component.selection.hasValue()).toBe(false);
  });

  it.each([
    'approve',
    'reject',
    'delete'
  ])('confirms individual %s before sending exactly one write', (action) => {
    createComponent();
    const confirmation = new Subject<any>();
    openDialog.mockReturnValue({ afterClosed: () => confirmation });
    component.openDetail(record);
    component.decideDetail(action as any);
    expect(executeMakerCheckerAction).not.toHaveBeenCalled();
    expect(deleteMakerChecker).not.toHaveBeenCalled();
    component.decideDetail(action as any);
    expect(openDialog).toHaveBeenCalledTimes(1);
    confirmation.next({ confirm: true });
    confirmation.complete();
    if (action === 'delete') expect(deleteMakerChecker).toHaveBeenCalledTimes(1);
    else expect(executeMakerCheckerAction).toHaveBeenCalledWith(23, action);
    expect(getMakerCheckerData).toHaveBeenCalled();
  });

  it('shows the audit retention warning and unsupported comment dependency in confirmations', () => {
    createComponent();
    useLocale('en-US');
    component.masterToggle();
    component.deleteChecker();
    expect(openDialog.mock.calls[0][1].data.dialogContext).toContain('audit');
    component.masterToggle();
    component.rejectChecker();
    expect(openDialog.mock.calls[1][1].data.dialogContext).toContain('cannot save or send');
  });

  it('revalidates permissions, identity, processing status and session before writes', () => {
    createComponent();
    getPendingCheckerRecord.mockReturnValueOnce(of({ ...record, maker: 'reviewer' }));
    component.masterToggle();
    component.approveChecker();
    expect(executeMakerCheckerAction).not.toHaveBeenCalled();
    getPendingCheckerRecord.mockReturnValueOnce(of({ ...record, processingResult: 'Processed' }));
    component.masterToggle();
    component.approveChecker();
    expect(executeMakerCheckerAction).not.toHaveBeenCalled();
    const confirmation = new Subject<any>();
    openDialog.mockReturnValue({ afterClosed: () => confirmation });
    component.masterToggle();
    component.approveChecker();
    permissionsState = [];
    confirmation.next({ confirm: true });
    expect(executeMakerCheckerAction).not.toHaveBeenCalled();
  });

  it('does not act on another session after confirmation', () => {
    createComponent();
    const confirmation = new Subject<any>();
    openDialog.mockReturnValue({ afterClosed: () => confirmation });
    component.masterToggle();
    component.approveChecker();
    currentScope = 'session-two';
    confirmation.next({ confirm: true });
    expect(executeMakerCheckerAction).not.toHaveBeenCalled();
  });

  it('handles cancellation, no selection and duplicate submissions', () => {
    createComponent();
    component.approveChecker();
    expect(openDialog).not.toHaveBeenCalled();
    openDialog.mockReturnValueOnce({ afterClosed: () => of({ confirm: false }) });
    component.masterToggle();
    component.approveChecker();
    expect(executeMakerCheckerAction).not.toHaveBeenCalled();
    const pending = new Subject<any>();
    executeMakerCheckerAction.mockReturnValueOnce(pending);
    component.approveChecker();
    expect(component.processing).toBe(true);
    component.approveChecker();
    expect(executeMakerCheckerAction).toHaveBeenCalledTimes(1);
    pending.next({ commandId: 23 });
    pending.complete();
    expect(component.processing).toBe(false);
  });

  it('correlates mixed success, business failure, ambiguous responses and network failures without retry', () => {
    createComponent();
    const records = [
      record,
      { ...record, id: 24 },
      { ...record, id: 25 },
      { ...record, id: 26 }
    ];
    component.dataSource.data = records;
    getPendingCheckerRecord.mockImplementation((row) => of({ ...record, id: row.id }));
    executeMakerCheckerAction.mockImplementation((id) =>
      id === 23
        ? of({ commandId: id })
        : id === 24
          ? of({ resourceId: id, rollbackTransaction: true })
          : id === 25
            ? of({})
            : throwError(() => ({ status: 0 }))
    );
    component.masterToggle();
    component.approveChecker();
    expect(executeMakerCheckerAction).toHaveBeenCalledTimes(4);
    expect(component.actionResult).toMatchObject({ succeeded: 1, failed: [{ id: 24 }], unknown: [
        25,
        26
      ] });
  });

  it('bounds batch concurrency to four and rechecks queued requests', () => {
    createComponent();
    component.dataSource.data = Array.from({ length: 6 }, (_, i) => ({ ...record, id: 30 + i }));
    const writes = Array.from({ length: 6 }, () => new Subject<any>());
    getPendingCheckerRecord.mockImplementation((row) => of({ ...record, id: row.id }));
    executeMakerCheckerAction.mockImplementation((id) => writes[id - 30]);
    component.masterToggle();
    component.approveChecker();
    expect(executeMakerCheckerAction).toHaveBeenCalledTimes(4);
    permissionsState = [];
    for (const write of writes.slice(0, 4)) {
      write.next({ commandId: 1 });
      write.complete();
    }
    expect(executeMakerCheckerAction).toHaveBeenCalledTimes(4);
    expect(component.actionResult.failed.map((item) => item.id)).toEqual([
      34,
      35
    ]);
  });

  it('does not duplicate a pending automatic query after reset', fakeAsync(() => {
    createComponent();
    component.makerCheckerSearchForm.patchValue({ actionName: 'UPDATE' });
    component.resetFilters();
    tick(300);
    expect(getMakerCheckerData).toHaveBeenCalledTimes(1);
  }));

  it('discards detail and customer responses if the authorized session changes', fakeAsync(() => {
    const customers = new Subject<any>();
    createComponent(customers);
    component.customerControl.setValue('synthetic');
    tick(300);
    const details = new Subject<any>();
    getCheckerInboxDetail.mockReturnValueOnce(details);
    component.openDetail(record);
    currentScope = 'another-tenant';
    details.next({ ...record, commandAsJson: '{"emailAddress":"private"}' });
    details.complete();
    customers.next({ content: [{ id: 1, displayName: 'Private' }] });
    customers.complete();
    expect(component.detail).toBeNull();
    expect(component.presentation.json).toBe('');
    expect(component.customers).toEqual([]);
  }));
  it('clears audit data on logout, allows leaving and keeps late batch results out of a new session', () => {
    createComponent();
    const response = new Subject<any>();
    executeMakerCheckerAction.mockReturnValueOnce(response);
    component.openDetail(record);
    component.masterToggle();
    component.approveChecker();
    expect(component.canLeave).toBe(false);
    currentScope = 'logged-out';
    authenticated.next(false);
    expect(component.canLeave).toBe(true);
    expect(component.detail).toBeNull();
    expect(component.searchData).toEqual([]);
    response.next({ commandId: 23 });
    response.complete();
    expect(component.actionResult).toBeNull();
    expect(getMakerCheckerData).not.toHaveBeenCalled();
  });
  it('reacts to query-only navigation and clears detail when the target is removed', () => {
    createComponent();
    queryParams.next(convertToParamMap({ request: 23 }));
    expect(component.detail.id).toBe(23);
    queryParams.next(convertToParamMap({ request: 24 }));
    expect(component.detail).toBeNull();
    expect(getCheckerInboxDetail).toHaveBeenLastCalledWith(24);
    queryParams.next(convertToParamMap({}));
    expect(component.selectedId).toBeNull();
  });

  it('blocks stale tenant rows before confirmation even when a matching ID exists', () => {
    createComponent();
    component.masterToggle();
    currentScope = 'another-tenant';
    component.approveChecker();
    expect(openDialog).not.toHaveBeenCalled();
    expect(getPendingCheckerRecord).not.toHaveBeenCalled();
    component.reload();
    component.masterToggle();
    component.approveChecker();
    expect(executeMakerCheckerAction).toHaveBeenCalledWith(23, 'approve');
  });

  it('uses checker-scoped reads for an individual decision without audit read permission', () => {
    createComponent(of({ content: [] }), ['UPDATE_CLIENT_CHECKER']);
    component.openDetail(record);
    component.decideDetail('approve');
    expect(getPendingCheckerRecord).toHaveBeenNthCalledWith(1, record, true);
    expect(getPendingCheckerRecord).toHaveBeenNthCalledWith(2, record);
    expect(getCheckerInboxDetail).not.toHaveBeenCalled();
    expect(executeMakerCheckerAction).toHaveBeenCalledTimes(1);
  });

  it('bounds preflight and write independently and treats a write timeout as unknown', fakeAsync(() => {
    createComponent();
    getPendingCheckerRecord.mockReturnValueOnce(new Subject());
    component.masterToggle();
    component.approveChecker();
    tick(30000);
    expect(component.actionResult.failed).toEqual([{ id: 23 }]);
    expect(executeMakerCheckerAction).not.toHaveBeenCalled();
    executeMakerCheckerAction.mockReturnValueOnce(new Subject());
    component.masterToggle();
    component.approveChecker();
    tick(30000);
    expect(component.actionResult.unknown).toEqual([23]);
    expect(component.processing).toBe(false);
  }));

  it('classifies a 2xx response decoding error as unknown', () => {
    createComponent();
    executeMakerCheckerAction.mockReturnValueOnce(throwError(() => ({ status: 200 })));
    component.masterToggle();
    component.approveChecker();
    expect(component.actionResult.unknown).toEqual([23]);
    expect(component.actionResult.failed).toEqual([]);
  });
});
