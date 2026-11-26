/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, Subject, of, throwError } from 'rxjs';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { PendingProspectsResponse, TasksService } from 'app/tasks/tasks.service';
import { environment } from 'environments/environment';
import { CommercialPanelComponent } from './commercial-panel.component';
import { COMMERCIAL_STAGES, prospectSnapshot, validResourceId } from './commercial-pipeline.model';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const page: PendingProspectsResponse = {
  totalFilteredRecords: 2,
  pageItems: [
    {
      prospectId: 1,
      displayName: 'Synthetic One',
      externalRef: 'S-1',
      clientId: 42,
      officeId: 2,
      currentStage: 'KYC_LEVEL_1',
      lastCompletedStage: 'COMMERCIAL_REGISTRATION',
      stoppedAtStage: 'KYC_LEVEL_1',
      registrationStatus: 'IN_PROGRESS',
      createdAt: '2026-01-01',
      lastUpdatedAt: '2026-01-12'
    },
    { prospectId: 2, displayName: 'Synthetic Two', currentStage: 'UNKNOWN', registrationStatus: 'COMPLETED' }
  ]
};

describe('CommercialPanelComponent', () => {
  let fixture: ComponentFixture<CommercialPanelComponent>;
  let component: CommercialPanelComponent;
  let getPendingProspects: jest.Mock;
  let permissions: string[];
  const originalRbac = environment.productionModeEnableRBAC;

  beforeEach(() => {
    environment.productionModeEnableRBAC = true;
    permissions = [
      'READ_PROSPECT',
      'READ_CLIENT',
      'READ_CLIENTNOTE',
      'CREATE_CLIENTNOTE'
    ];
    getPendingProspects = jest.fn(() => of(page));
    TestBed.configureTestingModule({
      imports: [
        CommercialPanelComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        provideNoopAnimations(),
        provideRouter([]),
        { provide: TasksService, useValue: { getPendingProspects } },
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions }) } }
      ]
    });
    fixture = TestBed.createComponent(CommercialPanelComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('offices', [{ id: 2, name: 'Synthetic Branch' }]);
  });
  afterEach(() => {
    environment.productionModeEnableRBAC = originalRbac;
  });

  function start() {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
  }

  it('loads a bounded stable page with only verified query parameters', fakeAsync(() => {
    start();
    expect(getPendingProspects).toHaveBeenCalledWith({
      q: '',
      officeId: undefined,
      offset: 0,
      limit: 10,
      orderBy: 'prospectId',
      sortOrder: 'ASC'
    });
    expect(component.rows).toHaveLength(2);
    expect(component.total).toBe(2);
  }));
  it('uses eight ordered backend phases and excludes Recovery', () => {
    expect(COMMERCIAL_STAGES.map((stage) => stage.code)).toEqual([
      'ONBOARDING',
      'COMPLIANCE',
      'PARAMETRIC_SCORE',
      'FILE_INTEGRATION',
      'CREDIT_ANALYSIS',
      'APPROVAL',
      'LEGAL_INSTRUMENTATION',
      'DISBURSEMENT'
    ]);
  });
  it('keeps event codes unchanged and does not invent phase status or ownership', fakeAsync(() => {
    start();
    expect(component.selected.currentStage).toBe('KYC_LEVEL_1');
    expect(component.selected.lastCompletedStage).toBe('COMMERCIAL_REGISTRATION');
    expect(component.rows[0]).not.toHaveProperty('executive');
    expect(fixture.nativeElement.querySelectorAll('.stage-marker')).toHaveLength(16);
    expect(fixture.nativeElement.querySelector('.stage-marker').textContent.trim()).toBe('?');
  }));
  it('does not treat registration completion as completed disbursement or count active prospects', fakeAsync(() => {
    start();
    const summaries = fixture.nativeElement.querySelectorAll('.summary-card');
    expect(summaries).toHaveLength(5);
    for (const summary of summaries) expect(summary.querySelector('strong').textContent.trim()).toBe('—');
  }));
  it.each([
    '2026-11-26',
    '2026-11-21',
    '2026-11-16',
    '2026-11-15',
    '2026-11-27',
    'invalid',
    undefined
  ])(
    'does not calculate stage duration from creation or update timestamp %s',
    fakeAsync((date: string | undefined) => {
      getPendingProspects.mockReturnValue(
        of({ totalFilteredRecords: 1, pageItems: [{ ...page.pageItems[0], createdAt: date, lastUpdatedAt: date }] })
      );
      start();
      expect(component.rows[0]).not.toHaveProperty('daysElapsed');
      expect(fixture.nativeElement.querySelector('.summary-card strong').textContent.trim()).toBe('—');
    })
  );
  it('debounces text and cancels an in-flight response immediately on new input', fakeAsync(() => {
    const stale = new Subject<PendingProspectsResponse>();
    getPendingProspects.mockReturnValueOnce(stale);
    start();
    component.search.setValue('Synthetic Two');
    expect(stale.observed).toBe(false);
    expect(component.selected).toBeNull();
    tick(299);
    expect(getPendingProspects).toHaveBeenCalledTimes(1);
    getPendingProspects.mockReturnValue(of({ totalFilteredRecords: 1, pageItems: [page.pageItems[1]] }));
    tick(1);
    expect(getPendingProspects.mock.lastCall[0].q).toBe('Synthetic Two');
    expect(component.selected.prospect.prospectId).toBe(2);
    stale.next(page);
    expect(component.rows).toHaveLength(1);
  }));
  it('cancels stale debounce timers and sends only the final trimmed query', fakeAsync(() => {
    start();
    component.search.setValue('S');
    tick(200);
    component.search.setValue(' S-1 ');
    tick(299);
    expect(getPendingProspects).toHaveBeenCalledTimes(1);
    tick(1);
    expect(getPendingProspects).toHaveBeenCalledTimes(2);
    expect(getPendingProspects.mock.lastCall[0].q).toBe('S-1');
  }));
  it('filters immediately using a real office ID and resets pagination before requesting', fakeAsync(() => {
    start();
    component.pageIndex = 3;
    component.office.setValue(2);
    tick();
    expect(getPendingProspects.mock.lastCall[0]).toEqual(expect.objectContaining({ officeId: 2, offset: 0 }));
  }));
  it('does not silently broaden an invalid office filter', fakeAsync(() => {
    start();
    component.office.setValue(99);
    tick();
    expect(getPendingProspects).toHaveBeenCalledTimes(1);
    expect(component.error).toBe(true);
    expect(component.rows).toEqual([]);
  }));
  it('requests the next server page instead of loading the full portfolio', fakeAsync(() => {
    start();
    component.changePage({ pageIndex: 1, pageSize: 25, length: 99 });
    tick();
    expect(getPendingProspects.mock.lastCall[0]).toEqual(expect.objectContaining({ offset: 25, limit: 25 }));
  }));
  it.each([
    [
      19,
      1,
      10
    ],
    [
      20,
      1,
      10
    ],
    [
      0,
      0,
      0
    ]
  ])(
    'recovers a removed third page with total %s to page index %s',
    fakeAsync((total: number, pageIndex: number, offset: number) => {
      start();
      component.pageIndex = 2;
      const recoveredItems = total ? [page.pageItems[0]] : [];
      getPendingProspects
        .mockReturnValueOnce(of({ totalFilteredRecords: total, pageItems: [] }))
        .mockReturnValueOnce(of({ totalFilteredRecords: total, pageItems: recoveredItems }));
      component.refresh();
      tick();
      fixture.detectChanges();
      expect(getPendingProspects.mock.calls.slice(-2).map(([params]) => params.offset)).toEqual([
        20,
        offset
      ]);
      expect(component.pageIndex).toBe(pageIndex);
      expect(component.total).toBe(total);
      expect(component.rows.map((row) => row.prospect)).toEqual(recoveredItems);
      expect(component.selected?.prospect).toEqual(recoveredItems[0]);
      expect(component.attention).toHaveLength(total ? 1 : 0);
      expect(component.loading).toBe(false);
      expect(component.error).toBe(false);
      expect(fixture.nativeElement.querySelector('mat-paginator')).toBeTruthy();
    })
  );
  it.each([
    0,
    1
  ])(
    'rejects an empty page at index %s when the matching count promises records',
    fakeAsync((pageIndex: number) => {
      component.pageIndex = pageIndex;
      getPendingProspects.mockReturnValue(
        of({ totalFilteredRecords: pageIndex * component.pageSize + 2, pageItems: [] })
      );
      start();
      expect(getPendingProspects).toHaveBeenCalledTimes(1);
      expect(component.error).toBe(true);
      expect(component.loading).toBe(false);
      expect(component.rows).toEqual([]);
      expect(component.selected).toBeNull();
      expect(component.attention).toEqual([]);
      expect(component.total).toBeNull();
      expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();
      expect(fixture.nativeElement.textContent).not.toContain('commercialPipeline.empty');
    })
  );
  it('preserves the current page when its offset is still valid after refresh', fakeAsync(() => {
    start();
    component.pageIndex = 1;
    getPendingProspects.mockReturnValue(of({ totalFilteredRecords: 19, pageItems: [page.pageItems[0]] }));
    const callsBeforeRefresh = getPendingProspects.mock.calls.length;
    component.refresh();
    tick();
    expect(getPendingProspects).toHaveBeenCalledTimes(callsBeforeRefresh + 1);
    expect(getPendingProspects.mock.lastCall[0].offset).toBe(10);
    expect(component.pageIndex).toBe(1);
    expect(component.total).toBe(19);
  }));
  it('shows a recovery request failure and retries the corrected page', fakeAsync(() => {
    start();
    component.pageIndex = 2;
    getPendingProspects
      .mockReturnValueOnce(of({ totalFilteredRecords: 19, pageItems: [] }))
      .mockReturnValueOnce(throwError(() => ({ status: 503 })));
    component.refresh();
    tick();
    expect(component.pageIndex).toBe(1);
    expect(component.error).toBe(true);
    expect(component.rows).toEqual([]);
    expect(component.loading).toBe(false);
    getPendingProspects.mockReturnValue(of({ totalFilteredRecords: 19, pageItems: [page.pageItems[0]] }));
    component.refresh();
    tick();
    expect(getPendingProspects.mock.lastCall[0].offset).toBe(10);
    expect(component.error).toBe(false);
    expect(component.total).toBe(19);
  }));
  it('synchronizes selection, traceability and attention after a new search', fakeAsync(() => {
    start();
    component.select(component.rows[1]);
    expect(component.selected.prospect.prospectId).toBe(2);
    expect(component.attention.map((row) => row.prospect.prospectId)).toEqual([1]);
    getPendingProspects.mockReturnValue(of({ totalFilteredRecords: 0, pageItems: [] }));
    component.search.setValue('absent');
    tick(300);
    fixture.detectChanges();
    expect(component.selected).toBeNull();
    expect(component.attention).toEqual([]);
    expect(fixture.nativeElement.textContent).toContain('commercialPipeline.empty');
  }));
  it('disables unsupported aging and executive filters', fakeAsync(() => {
    start();
    expect(fixture.nativeElement.querySelectorAll('.aging-filters button[disabled]')).toHaveLength(4);
    expect(
      fixture.nativeElement
        .querySelector('mat-select[aria-describedby="pipeline-filter-gap"]')
        .getAttribute('aria-disabled')
    ).toBe('true');
  }));
  it('never fabricates notification, document, escalation or missing-item actions', fakeAsync(() => {
    start();
    expect(fixture.nativeElement.querySelector('.follow-up-actions').textContent).toContain('commercialPipeline.notes');
    expect(fixture.nativeElement.querySelector('.follow-up-actions').textContent).not.toMatch(
      /Notify|Escalate|Request/
    );
    expect(component.selected).not.toHaveProperty('missingDocuments');
  }));
  it('opens client files and notes using the actual associated client ID', fakeAsync(() => {
    start();
    expect(component.clientRoute(component.rows[0])).toEqual([
      '/clients',
      42,
      'general'
    ]);
    expect(component.clientRoute(component.rows[0], true)).toEqual([
      '/clients',
      42,
      'notes'
    ]);
    expect(component.clientRoute(component.rows[1])).toBeNull();
    permissions = [
      'READ_PROSPECT',
      'READ_CLIENT',
      'READ_CLIENTNOTE'
    ];
    expect(component.clientRoute(component.rows[0], true)).toBeNull();
    permissions = ['READ_PROSPECT'];
    expect(component.clientRoute(component.rows[0])).toBeNull();
  }));
  it('does not grant note creation to ALL_FUNCTIONS_READ', fakeAsync(() => {
    permissions = ['ALL_FUNCTIONS_READ'];
    start();
    expect(component.clientRoute(component.rows[0])).toBeTruthy();
    expect(component.clientRoute(component.rows[0], true)).toBeNull();
  }));
  it('does not fetch data without prospect read authorization', fakeAsync(() => {
    permissions = ['READ_CLIENT'];
    start();
    expect(getPendingProspects).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('commercialPipeline.forbidden');
  }));
  it('keeps existing RBAC-disabled behavior', fakeAsync(() => {
    environment.productionModeEnableRBAC = false;
    permissions = [];
    start();
    expect(getPendingProspects).toHaveBeenCalledTimes(1);
  }));
  it('clears data on a backend failure and retries', fakeAsync(() => {
    start();
    getPendingProspects.mockReturnValueOnce(throwError(() => ({ status: 503 })));
    component.refresh();
    tick();
    fixture.detectChanges();
    expect(component.error).toBe(true);
    expect(component.rows).toEqual([]);
    expect(component.selected).toBeNull();
    component.refresh();
    tick();
    expect(component.error).toBe(false);
    expect(component.rows).toHaveLength(2);
  }));
  it('times out stalled requests without leaving an indefinite loading state', fakeAsync(() => {
    getPendingProspects.mockReturnValue(new Subject());
    start();
    tick(30000);
    expect(component.loading).toBe(false);
    expect(component.error).toBe(true);
  }));
  it.each([
    {},
    null,
    { pageItems: null },
    { pageItems: [{ prospectId: 7, currentStage: 123 }] },
    { pageItems: [
        { prospectId: 1 },
        { prospectId: '1' }
      ] },
    { pageItems: [null] },
    { pageItems: [{ prospectId: '../x' }] }
  ])(
    'rejects malformed success payloads %s',
    fakeAsync((value: unknown) => {
      getPendingProspects.mockReturnValue(of(value));
      start();
      expect(component.error).toBe(true);
      expect(component.rows).toEqual([]);
    })
  );
  it('does not invent a total when the backend omits it', fakeAsync(() => {
    getPendingProspects.mockReturnValue(of({ pageItems: page.pageItems }));
    start();
    expect(component.total).toBeNull();
    expect(component.rows).toHaveLength(2);
  }));
  it('selects rows with native keyboard-accessible buttons and exposes selection', fakeAsync(() => {
    start();
    const buttons = fixture.nativeElement.querySelectorAll('.prospect-button');
    buttons[1].click();
    fixture.detectChanges();
    expect(buttons[1].getAttribute('aria-pressed')).toBe('true');
    expect(fixture.nativeElement.querySelector('.traceability').textContent).toContain('Synthetic Two');
  }));
  it('cancels pending debounce and HTTP subscriptions on destruction', fakeAsync(() => {
    const cleaned = jest.fn();
    getPendingProspects.mockReturnValue(new Observable(() => cleaned));
    start();
    fixture.destroy();
    expect(cleaned).toHaveBeenCalledTimes(1);
    component.search.setValue('late');
    tick(1000);
    expect(getPendingProspects).toHaveBeenCalledTimes(1);
  }));
});

describe('Commercial pipeline snapshot contract', () => {
  it('normalizes absent fields without inventing pending or completed stages', () => {
    expect(prospectSnapshot({ currentStage: ' UNKNOWN ', stoppedAtStage: null })).toEqual({
      prospect: { currentStage: ' UNKNOWN ', stoppedAtStage: null },
      currentStage: undefined,
      lastCompletedStage: undefined,
      stoppedAtStage: undefined
    });
  });
  it.each([
    0,
    -1,
    1.1,
    '0',
    '../42',
    '',
    null,
    undefined,
    NaN
  ])('rejects invalid resource identifiers %s', (id) => {
    expect(validResourceId(id)).toBe(false);
  });
  it.each([
    42,
    '42'
  ])('preserves valid resource identifiers %s', (id) => expect(validResourceId(id)).toBe(true));
});

const localesDirectory = join(process.cwd(), 'src/assets/translations');
const english = JSON.parse(readFileSync(join(localesDirectory, 'en-US.json'), 'utf8')).commercialPipeline;
for (const locale of readdirSync(localesDirectory).filter((name) => name.endsWith('.json'))) {
  it(`provides every commercial label and department in ${locale}`, () => {
    const messages = JSON.parse(readFileSync(join(localesDirectory, locale), 'utf8')).commercialPipeline;
    for (const key of Object.keys(english)) {
      if (key === 'departments' || key === 'stages') {
        expect(Object.keys(messages[key]).sort()).toEqual(Object.keys(english[key]).sort());
        for (const label of Object.values(messages[key])) expect(String(label).trim()).toBeTruthy();
      } else {
        expect(typeof messages[key]).toBe('string');
        expect(messages[key].trim()).toBeTruthy();
        expect(messages[key].match(/\{\{\w+\}\}/g)).toEqual(english[key].match(/\{\{\w+\}\}/g));
      }
    }
  });
}
