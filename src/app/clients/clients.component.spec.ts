/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { ClientsComponent, DEBOUNCE_MS } from './clients.component';
import { ClientsService } from './clients.service';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { TranslateModule } from '@ngx-translate/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faDownload, faPlus, faStop } from '@fortawesome/free-solid-svg-icons';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

describe('ClientsComponent — debounce search', () => {
  let component: ClientsComponent;
  let fixture: ComponentFixture<ClientsComponent>;
  let clientsService: jest.Mocked<ClientsService>;

  const emptyPage = { content: [] as any[], totalElements: 0, numberOfElements: 0 };

  beforeEach(async () => {
    jest.useFakeTimers();

    clientsService = {
      searchByText: jest.fn(() => of(emptyPage))
    } as any;

    const authService = { getCredentials: jest.fn(() => ({ permissions: ['ALL_FUNCTIONS'] })) } as any;

    await TestBed.configureTestingModule({
      imports: [
        ClientsComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: ClientsService, useValue: clientsService },
        { provide: AuthenticationService, useValue: authService },
        provideAnimationsAsync(),
        provideRouter([])
      ]
    }).compileComponents();

    TestBed.inject(FaIconLibrary).addIcons(faDownload, faPlus, faStop);

    fixture = TestBed.createComponent(ClientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // Reset call count from ngOnInit (preloadClients may trigger a call)
    clientsService.searchByText.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should not search before 500 ms have elapsed', () => {
    component.onSearchInput('amara');
    jest.advanceTimersByTime(DEBOUNCE_MS - 1);
    expect(clientsService.searchByText).not.toHaveBeenCalled();
  });

  it('should search after 500 ms pause', () => {
    component.onSearchInput('amara');
    jest.advanceTimersByTime(DEBOUNCE_MS);
    expect(clientsService.searchByText).toHaveBeenCalledTimes(1);
    expect(clientsService.searchByText).toHaveBeenCalledWith('amara', 0, expect.any(Number), '', '');
  });

  it('should reset the timer on rapid typing and fire only once', () => {
    component.onSearchInput('k');
    jest.advanceTimersByTime(200);
    component.onSearchInput('ka');
    jest.advanceTimersByTime(200);
    component.onSearchInput('kwame');
    jest.advanceTimersByTime(DEBOUNCE_MS);
    expect(clientsService.searchByText).toHaveBeenCalledTimes(1);
    expect(clientsService.searchByText).toHaveBeenCalledWith('kwame', 0, expect.any(Number), '', '');
  });

  it('should ignore duplicate consecutive values', () => {
    component.onSearchInput('agaba');
    jest.advanceTimersByTime(DEBOUNCE_MS);
    component.onSearchInput('agaba');
    jest.advanceTimersByTime(DEBOUNCE_MS);
    expect(clientsService.searchByText).toHaveBeenCalledTimes(1);
  });

  it('should search immediately when Enter is pressed', () => {
    component.search('bob');
    expect(clientsService.searchByText).toHaveBeenCalledTimes(1);
    expect(clientsService.searchByText).toHaveBeenCalledWith('bob', 0, expect.any(Number), '', '');
  });

  it('should not fire a second request when Enter is pressed while debounce is pending', () => {
    component.onSearchInput('kofi');
    jest.advanceTimersByTime(200);
    component.search('kofi');
    expect(clientsService.searchByText).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(DEBOUNCE_MS);
    expect(clientsService.searchByText).toHaveBeenCalledTimes(1);
  });

  it('should search correctly with non-ASCII characters', () => {
    component.onSearchInput('مريم');
    jest.advanceTimersByTime(DEBOUNCE_MS);
    expect(clientsService.searchByText).toHaveBeenCalledTimes(1);
    expect(clientsService.searchByText).toHaveBeenCalledWith('مريم', 0, expect.any(Number), '', '');
  });

  it('should not search during IME composition but should search on compositionend', () => {
    const inputEl: HTMLInputElement = fixture.nativeElement.querySelector('.search input');

    inputEl.dispatchEvent(new CompositionEvent('compositionstart'));
    fixture.detectChanges();

    // Partial composition — input fires but should be suppressed
    inputEl.value = 'مر';
    inputEl.dispatchEvent(new Event('input'));
    jest.advanceTimersByTime(DEBOUNCE_MS);
    expect(clientsService.searchByText).not.toHaveBeenCalled();

    // Composition ends with final value
    inputEl.value = 'مريم';
    inputEl.dispatchEvent(new CompositionEvent('compositionend'));
    fixture.detectChanges();

    jest.advanceTimersByTime(DEBOUNCE_MS);
    expect(clientsService.searchByText).toHaveBeenCalledTimes(1);
    expect(clientsService.searchByText).toHaveBeenCalledWith('مريم', 0, expect.any(Number), '', '');
  });

  it('should not fire debounced search after component is destroyed', () => {
    component.onSearchInput('carol');
    fixture.destroy();
    jest.advanceTimersByTime(DEBOUNCE_MS);
    expect(clientsService.searchByText).not.toHaveBeenCalled();
  });
});

describe('ClientsComponent — status filter', () => {
  let component: ClientsComponent;
  let fixture: ComponentFixture<ClientsComponent>;
  let clientsService: jest.Mocked<ClientsService>;

  const statusRow = (id: number, code: string): any => ({
    id,
    displayName: `Client ${id}`,
    accountNumber: `${id}`,
    externalId: `EXT-${id}`,
    officeName: 'Head Office',
    legalForm: { id: 1 },
    status: { code, value: 'Active' }
  });

  const pageOf = (rows: any[]) => ({
    content: rows,
    totalElements: rows.length,
    numberOfElements: rows.length
  });

  const ACTIVE_ROWS = Array.from({ length: 220 }, (_, i) => statusRow(i + 1, 'clientStatusType.active'));
  const PENDING_ROWS = Array.from({ length: 30 }, (_, i) => statusRow(1000 + i, 'clientStatusType.pending'));
  const CLOSED_ROWS = Array.from({ length: 12 }, (_, i) => statusRow(2000 + i, 'clientStatusType.closed'));
  const REJECTED_ROWS = Array.from({ length: 4 }, (_, i) => statusRow(3000 + i, 'clientStatusType.rejected'));
  const ALL_ROWS = [
    ...ACTIVE_ROWS,
    ...PENDING_ROWS,
    ...CLOSED_ROWS,
    ...REJECTED_ROWS
  ];

  /** Mimics the server paginating a dataset for any (page, size) pair. */
  const paginating = (all: any[]) =>
    jest.fn((_text: string, page: number, size: number) => {
      const start = page * size;
      const content = all.slice(start, start + size);
      return of({ content, totalElements: all.length, numberOfElements: content.length });
    });

  beforeEach(async () => {
    clientsService = {
      searchByText: jest.fn(() => of(pageOf([])))
    } as any;

    const authService = { getCredentials: jest.fn(() => ({ permissions: ['ALL_FUNCTIONS'] })) } as any;

    await TestBed.configureTestingModule({
      imports: [
        ClientsComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: ClientsService, useValue: clientsService },
        { provide: AuthenticationService, useValue: authService },
        provideAnimationsAsync(),
        provideRouter([])
      ]
    }).compileComponents();

    TestBed.inject(FaIconLibrary).addIcons(faDownload, faPlus, faStop);

    fixture = TestBed.createComponent(ClientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // Reset call count from ngOnInit (preloadClients may trigger a call)
    clientsService.searchByText.mockClear();
  });

  it('exposes the four status buckets aligned with the row severity classes', () => {
    expect(component.statusFilterOptions.map((o) => o.key)).toEqual([
      'active',
      'pending',
      'closed',
      'rejected'
    ]);
    expect(component.statusFilterOptions.map((o) => o.labelKey)).toEqual([
      'labels.status.Active',
      'labels.status.Pending',
      'labels.status.Closed',
      'labels.status.Rejected'
    ]);
  });

  it('renders the status filter control without any selection by default', () => {
    const select = fixture.nativeElement.querySelector('.status-filter mat-select');
    expect(select).toBeTruthy();
    expect(component.selectedStatuses).toEqual([]);
    expect(fixture.nativeElement.querySelector('.status-filter-clear')).toBeNull();
  });

  it('fetches the complete result set and filters client-side when a single status is selected', () => {
    clientsService.searchByText.mockImplementation(paginating(ALL_ROWS));

    component.onStatusFilterChange(['active']);

    // Full-set fetch uses page size 100 and walks every page (220 → pages 0..2).
    expect(clientsService.searchByText).toHaveBeenCalledWith('', 0, 100, '', '');
    expect(clientsService.searchByText).toHaveBeenCalledWith('', 1, 100, '', '');
    expect(clientsService.searchByText).toHaveBeenCalledWith('', 2, 100, '', '');

    expect(component.totalRows).toBe(220);
    expect(component.dataSource.data).toHaveLength(50);
    expect(component.dataSource.data[0].displayName).toBe('Client 1');
    expect(component.existsClientsToFilter).toBe(true);
    expect(component.isLoading).toBe(false);
  });

  it('combines multiple selected status buckets', () => {
    clientsService.searchByText.mockImplementation(paginating(ALL_ROWS));

    component.onStatusFilterChange([
      'active',
      'pending'
    ]);

    expect(component.totalRows).toBe(250);
    expect(component.dataSource.data).toHaveLength(50);
  });

  it('keeps the filter consistent across pages without any server refetch', () => {
    clientsService.searchByText.mockImplementation(paginating(ALL_ROWS));

    component.onStatusFilterChange(['active']);
    expect(component.totalRows).toBe(220);

    clientsService.searchByText.mockClear();

    component.goToPage(1);
    expect(component.currentPage).toBe(1);
    expect(clientsService.searchByText).not.toHaveBeenCalled();
    expect(component.dataSource.data).toHaveLength(50);
    expect(component.dataSource.data[0].displayName).toBe('Client 51');

    // Last page holds the remainder (220 % 50 = 20).
    component.goToPage(4);
    expect(clientsService.searchByText).not.toHaveBeenCalled();
    expect(component.dataSource.data).toHaveLength(20);
    expect(component.dataSource.data[0].displayName).toBe('Client 201');
  });

  it('re-paginates client-side on page size change while a filter is active', () => {
    clientsService.searchByText.mockImplementation(paginating(ALL_ROWS));

    component.onStatusFilterChange(['active']);
    clientsService.searchByText.mockClear();

    component.onPageSizeChange(25);

    expect(clientsService.searchByText).not.toHaveBeenCalled();
    expect(component.pageSize).toBe(25);
    expect(component.dataSource.data).toHaveLength(25);
  });

  it('combines the status filter with the current search text', () => {
    clientsService.searchByText.mockImplementation(paginating(ALL_ROWS));

    component.filterText = 'amara';
    component.onStatusFilterChange(['active']);

    expect(clientsService.searchByText).toHaveBeenCalledWith('amara', 0, 100, '', '');
    expect(clientsService.searchByText).toHaveBeenCalledWith('amara', 1, 100, '', '');
  });

  it('shows the empty state when no client matches the selected status', () => {
    clientsService.searchByText.mockImplementation(
      jest.fn((text: string, page: number, size: number) => {
        const start = page * size;
        const matching = text === 'zzz' ? [] : ALL_ROWS;
        return of(pageOf(matching.slice(start, start + size)));
      })
    );

    component.filterText = 'zzz';
    component.onStatusFilterChange(['active']);

    expect(component.totalRows).toBe(0);
    expect(component.notExistsClientsToFilter).toBe(true);
    expect(component.dataSource.data).toHaveLength(0);

    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.empty-state').getAttribute('hidden')).toBeNull();
  });

  it('warns instead of silently dropping rows when a full-set page fails', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    clientsService.searchByText.mockImplementation((text: string, page: number, size: number) => {
      if (page === 1) {
        return throwError(() => new Error('boom'));
      }
      const content = ALL_ROWS.slice(page * size, page * size + size);
      return of({ content, totalElements: ALL_ROWS.length, numberOfElements: content.length });
    });

    component.onStatusFilterChange(['active']);

    // Page 0 (rows 1-100) and page 2 (rows 201-266) loaded; page 1 failed,
    // so the active filter yields 100 + 20 = 120 rows instead of 220.
    expect(component.totalRows).toBe(120);
    expect(warnSpy).toHaveBeenCalledWith('Clients list: loaded 166 of 266 clients (failed or short pages).');
    expect(component.isLoading).toBe(false);
    warnSpy.mockRestore();
  });

  it('reuses the complete full-set load when only the selected statuses change', () => {
    clientsService.searchByText.mockImplementation(paginating(ALL_ROWS));

    component.onStatusFilterChange(['active']);
    expect(component.totalRows).toBe(220);

    clientsService.searchByText.mockClear();

    component.onStatusFilterChange([
      'active',
      'pending'
    ]);
    expect(component.totalRows).toBe(250);
    component.onStatusFilterChange(['pending']);
    expect(component.totalRows).toBe(30);
    expect(clientsService.searchByText).not.toHaveBeenCalled();
  });

  it('refetches the full set when the search text changes while a filter is active', () => {
    clientsService.searchByText.mockImplementation(paginating(ALL_ROWS));

    component.onStatusFilterChange(['active']);
    expect(component.totalRows).toBe(220);

    clientsService.searchByText.mockClear();

    component.search('amara');

    expect(clientsService.searchByText).toHaveBeenCalledWith('amara', 0, 100, '', '');
    expect(component.totalRows).toBe(220);
  });

  it('refetches the full set when the sort changes while a filter is active', () => {
    clientsService.searchByText.mockImplementation(paginating(ALL_ROWS));

    component.onStatusFilterChange(['active']);
    expect(component.totalRows).toBe(220);

    clientsService.searchByText.mockClear();

    component.setSort('displayName');

    expect(clientsService.searchByText).toHaveBeenCalledWith('', 0, 100, 'displayName', 'asc');
    expect(component.totalRows).toBe(220);
  });

  it('never reuses a partial full-set load for a later status change', () => {
    clientsService.searchByText.mockImplementation((text: string, page: number, size: number) => {
      if (page === 1) {
        return throwError(() => new Error('boom'));
      }
      const content = ALL_ROWS.slice(page * size, page * size + size);
      return of({ content, totalElements: ALL_ROWS.length, numberOfElements: content.length });
    });

    component.onStatusFilterChange(['active']);
    expect(component.totalRows).toBe(120);
    expect(clientsService.searchByText).toHaveBeenCalledTimes(3); // pages 0, 1 (failed), 2

    clientsService.searchByText.mockClear();

    component.onStatusFilterChange([
      'active',
      'pending'
    ]);

    // The partial set is not trusted; the full set is fetched again.
    expect(clientsService.searchByText).toHaveBeenCalled();
    expect(component.totalRows).toBe(150);
  });

  it('clearing the filter restores the server-side page fetch', () => {
    clientsService.searchByText.mockImplementation(paginating(ALL_ROWS));

    component.onStatusFilterChange(['active']);
    expect(component.totalRows).toBe(220);

    clientsService.searchByText.mockClear();

    component.clearStatusFilter();

    expect(component.selectedStatuses).toEqual([]);
    expect(clientsService.searchByText).toHaveBeenCalledWith('', 0, 50, '', '');
    expect(component.totalRows).toBe(ALL_ROWS.length);
    expect(component.dataSource.data).toHaveLength(50);
  });

  it('renders a clear button with the translated aria label once a status is selected', () => {
    clientsService.searchByText.mockImplementation(paginating(ALL_ROWS));

    component.onStatusFilterChange(['active']);
    fixture.detectChanges();

    const clearBtn = fixture.nativeElement.querySelector('.status-filter-clear');
    expect(clearBtn).toBeTruthy();
    expect(clearBtn.getAttribute('aria-label')).toBe('labels.buttons.Clear status filter');

    clearBtn.click();
    expect(component.selectedStatuses).toEqual([]);
  });

  it('unsubscribes an in-flight page request when the status filter is applied', () => {
    let pending: Subject<any> | null = null;
    clientsService.searchByText.mockImplementation((text: string, page: number, size: number) => {
      if (size === 100) {
        return of(pageOf(ACTIVE_ROWS));
      }
      pending = new Subject<any>();
      return pending;
    });

    component.search('alpha');
    expect(pending).not.toBeNull();

    component.onStatusFilterChange(['active']);

    // The stale server-page subscription was abandoned.
    expect(pending!.observers.length).toBe(0);
  });

  it('unsubscribes an in-flight full-set fetch when a new search starts', () => {
    const inFlight: Subject<any>[] = [];
    clientsService.searchByText.mockImplementation((text: string, page: number, size: number) => {
      if (size === 100 && page === 0) {
        const fullFetch = new Subject<any>();
        inFlight.push(fullFetch);
        return fullFetch;
      }
      return of(pageOf([]));
    });

    component.onStatusFilterChange(['active']);
    expect(inFlight).toHaveLength(1);

    component.search('kofi');

    // The stale full-set fetch was abandoned before it could resolve.
    expect(inFlight[0].observers.length).toBe(0);
  });
});
