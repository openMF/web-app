/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, of, throwError } from 'rxjs';
import { afterEach, describe, expect, it, jest } from '@jest/globals';

import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import { environment } from 'environments/environment';
import { BaseTellerService, CatalogUpdateResponse } from '../base-teller.service';
import { CatalogUpdatesComponent } from './catalog-updates.component';

describe('CatalogUpdatesComponent', () => {
  let component: CatalogUpdatesComponent;
  let fixture: ComponentFixture<CatalogUpdatesComponent>;
  let service: jest.Mocked<BaseTellerService>;
  let snackBar: { open: jest.Mock };
  const originalRbac = environment.productionModeEnableRBAC;

  const statuses: CatalogUpdateResponse[] = [
    {
      category: 'GENERAL',
      lastUpdatedAt: null,
      lastAttemptAt: null,
      needsUpdate: true,
      status: 'UPDATE_REQUIRED',
      failureCode: null
    },
    {
      category: 'ACCOUNTING',
      lastUpdatedAt: '2026-09-28T05:00:00Z',
      lastAttemptAt: '2026-09-28T05:00:00Z',
      needsUpdate: false,
      status: 'CURRENT',
      failureCode: null
    },
    {
      category: 'USERS',
      lastUpdatedAt: '2026-09-27T05:00:00Z',
      lastAttemptAt: '2026-09-28T05:00:00Z',
      needsUpdate: true,
      status: 'FAILED',
      failureCode: 'SOURCE_VALIDATION_FAILED'
    }
  ];

  async function configure(permissions: string[] = [
      'READ_BASE_TELLER_CATALOG_UPDATE',
      'UPDATE_BASE_TELLER_CATALOG_UPDATE'
    ]): Promise<void> {
    service = {
      getCatalogUpdates: jest.fn(() => of(statuses)),
      getCatalogUpdate: jest.fn(),
      synchronizeCatalog: jest.fn()
    } as unknown as jest.Mocked<BaseTellerService>;
    snackBar = { open: jest.fn() };
    environment.productionModeEnableRBAC = true;

    await TestBed.configureTestingModule({
      imports: [
        CatalogUpdatesComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: BaseTellerService, useValue: service },
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions }) } },
        { provide: MatSnackBar, useValue: snackBar },
        {
          provide: SettingsService,
          useValue: { datetimeFormat: 'dd MMMM yyyy HH:mm:ss', language: { code: 'en' } }
        },
        {
          provide: Dates,
          useValue: { angularToMomentFormat: () => 'DD MMMM YYYY HH:mm:ss', getMomentLocale: () => 'en' }
        },
        provideNoopAnimations()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogUpdatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  afterEach(() => {
    jest.useRealTimers();
    environment.productionModeEnableRBAC = originalRbac;
  });

  it('loads and renders exactly the backend categories and status values', async () => {
    await configure();

    expect(service.getCatalogUpdates).toHaveBeenCalledTimes(1);
    expect(component.catalogUpdates).toEqual(statuses);
    expect(fixture.nativeElement.querySelectorAll('.catalog-card')).toHaveLength(3);
    expect(component.statusKey(statuses[0].status)).toBe('catalogUpdates.status.UPDATE_REQUIRED');
    expect(component.statusKey(statuses[1].status)).toBe('catalogUpdates.status.CURRENT');
    expect(component.statusKey(statuses[2].status)).toBe('catalogUpdates.status.FAILED');
    expect(component.errorKey(statuses[2])).toBe('catalogUpdates.errors.sourceValidation');
    expect(fixture.nativeElement.textContent).toContain('catalogUpdates.labels.neverUpdated');
  });

  it.each([
    'GENERAL',
    'ACCOUNTING',
    'USERS'
  ] as const)('replaces only %s with the successful backend response', async (category) => {
    await configure();
    const result: CatalogUpdateResponse = {
      category,
      lastUpdatedAt: '2026-09-29T05:00:00Z',
      lastAttemptAt: '2026-09-29T05:00:00Z',
      needsUpdate: false,
      status: 'CURRENT',
      failureCode: null
    };
    service.synchronizeCatalog.mockReturnValue(of(result));

    component.synchronize(component.catalogUpdates.find((item) => item.category === category)!);

    expect(service.synchronizeCatalog).toHaveBeenCalledWith(category);
    expect(component.catalogUpdates.find((item) => item.category === category)).toEqual(result);
    expect(snackBar.open).toHaveBeenCalledTimes(1);
  });

  it('disables duplicate requests while one category update is pending', async () => {
    await configure();
    const pending = new Subject<CatalogUpdateResponse>();
    service.synchronizeCatalog.mockReturnValue(pending);

    component.synchronize(statuses[0]);
    component.synchronize(statuses[0]);

    expect(component.updatingCategories.has('GENERAL')).toBe(true);
    expect(service.synchronizeCatalog).toHaveBeenCalledTimes(1);
    pending.next({ ...statuses[0], status: 'CURRENT', needsUpdate: false });
    pending.complete();
    expect(component.updatingCategories.has('GENERAL')).toBe(false);
  });

  it('retains the previous successful timestamp and exposes a safe known failure', async () => {
    await configure();
    const previous = statuses[2];
    service.synchronizeCatalog.mockReturnValue(of(previous));

    component.synchronize(previous);

    expect(component.catalogUpdates[2].lastUpdatedAt).toBe('2026-09-27T05:00:00Z');
    expect(component.catalogUpdates[2].needsUpdate).toBe(true);
    expect(component.categoryErrors.get('USERS')).toBe('catalogUpdates.errors.sourceValidation');
    expect(component.actionKey(component.catalogUpdates[2])).toBe('catalogUpdates.actions.retry');
    expect(snackBar.open).not.toHaveBeenCalled();
  });

  it('uses safe fallbacks for request and unknown backend failures and permits retry', async () => {
    await configure();
    service.synchronizeCatalog.mockReturnValueOnce(throwError(() => new Error('internal details')));
    component.synchronize(statuses[0]);
    expect(component.categoryErrors.get('GENERAL')).toBe('catalogUpdates.errors.update');
    expect(component.catalogUpdates[0]).toEqual(statuses[0]);

    service.synchronizeCatalog.mockReturnValueOnce(
      of({ ...statuses[0], status: 'FAILED', failureCode: 'INTERNAL_DATABASE_DETAIL' })
    );
    component.synchronize(statuses[0]);
    expect(service.synchronizeCatalog).toHaveBeenCalledTimes(2);
    expect(component.categoryErrors.get('GENERAL')).toBe('catalogUpdates.errors.unknown');
  });

  it('shows a retryable safe error when the initial backend load is unavailable', async () => {
    await configure();
    service.getCatalogUpdates.mockReturnValue(throwError(() => new Error('unavailable')));

    component.loadCatalogUpdates();

    expect(component.loadError).toBe('catalogUpdates.errors.load');
  });

  it('allows read-only users to view state but never synchronize', async () => {
    await configure(['READ_BASE_TELLER_CATALOG_UPDATE']);

    expect(component.canUpdate).toBe(false);
    component.synchronize(statuses[0]);
    expect(service.synchronizeCatalog).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelectorAll('mat-card-actions')).toHaveLength(0);
  });

  it('renders backend UPDATING as a disabled in-progress action', async () => {
    await configure();
    const updating = { ...statuses[0], status: 'UPDATING' as const };

    expect(component.isUpdating(updating)).toBe(true);
    expect(component.actionKey(updating)).toBe('catalogUpdates.actions.updating');
  });

  it('polls a server-reported UPDATING category until it reaches a terminal status', async () => {
    jest.useFakeTimers();
    await configure();
    const updating = { ...statuses[0], status: 'UPDATING' as const };
    const current = {
      ...statuses[0],
      lastUpdatedAt: '2026-09-29T05:00:00Z',
      lastAttemptAt: '2026-09-29T05:00:00Z',
      needsUpdate: false,
      status: 'CURRENT' as const
    };
    service.getCatalogUpdates.mockReturnValueOnce(of([updating]));
    service.getCatalogUpdate.mockReturnValueOnce(of(updating)).mockReturnValueOnce(of(current));

    component.loadCatalogUpdates();
    jest.advanceTimersByTime(5000);
    expect(service.getCatalogUpdate).toHaveBeenCalledTimes(1);
    expect(component.isUpdating(component.catalogUpdates[0])).toBe(true);

    jest.advanceTimersByTime(5000);
    expect(service.getCatalogUpdate).toHaveBeenCalledTimes(2);
    expect(component.catalogUpdates[0]).toEqual(current);

    jest.advanceTimersByTime(5000);
    expect(service.getCatalogUpdate).toHaveBeenCalledTimes(2);
  });

  it('stops polling when the component is destroyed', async () => {
    jest.useFakeTimers();
    await configure();
    const updating = { ...statuses[0], status: 'UPDATING' as const };
    service.getCatalogUpdates.mockReturnValueOnce(of([updating]));
    service.getCatalogUpdate.mockReturnValue(of(updating));

    component.loadCatalogUpdates();
    fixture.destroy();
    jest.advanceTimersByTime(5000);

    expect(service.getCatalogUpdate).not.toHaveBeenCalled();
  });
});
