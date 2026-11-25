/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { SettingsService } from 'app/settings/settings.service';
import { CheckerInboxCountService } from './checker-inbox-count.service';
import { TasksService } from './tasks.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

describe('Session scoped authoritative checker counts', () => {
  let service: CheckerInboxCountService;
  let tasks: TasksService;
  let http: HttpTestingController;
  let auth: BehaviorSubject<boolean>;
  let user: any;
  let settings: { serverUrl: string; tenantIdentifier: string };
  beforeEach(() => {
    auth = new BehaviorSubject(true);
    user = { userId: 1, username: 'one', permissions: ['READ_MAKERCHECKER'] };
    settings = { serverUrl: 'https://synthetic.test', tenantIdentifier: 'one' };
    TestBed.configureTestingModule({ providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthenticationService, useValue: { isAuthenticated$: auth, getCredentials: () => user } },
        { provide: SettingsService, useValue: settings }
      ] });
    service = TestBed.inject(CheckerInboxCountService);
    tasks = TestBed.inject(TasksService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('distinguishes unavailable, loading and zero, and shares the exact authorized total without polling', () => {
    expect(service.count()).toBeNull();
    tasks.getMakerCheckerData().subscribe();
    expect(service.count()).toBeNull();
    http.expectOne('/makercheckers').flush([
      { id: 1 },
      { id: 2 }
    ]);
    expect(service.count()).toBe(2);
    tasks.getMakerCheckerData({ actionName: 'CREATE' }).subscribe();
    http.expectOne('/makercheckers?actionName=CREATE').flush([]);
    expect(service.count()).toBe(2);
    tasks.getMakerCheckerData().subscribe();
    http.expectOne('/makercheckers').flush([]);
    expect(service.count()).toBe(0);
    http.expectNone('/makercheckers');
  });
  it('discards stale count responses including a logout/login to the same account', () => {
    tasks.getMakerCheckerData().subscribe();
    const old = http.expectOne('/makercheckers');
    auth.next(false);
    auth.next(true);
    old.flush([{ id: 1 }]);
    expect(service.count()).toBeNull();
    tasks.getMakerCheckerData().subscribe();
    const first = http.expectOne('/makercheckers');
    tasks.getMakerCheckerData().subscribe();
    const second = http.expectOne('/makercheckers');
    second.flush([
      { id: 2 },
      { id: 3 }
    ]);
    first.flush([]);
    expect(service.count()).toBe(2);
  });
  it.each([
    'user',
    'tenant',
    'server',
    'permissions'
  ])('never exposes a total in a changed %s scope', (field) => {
    tasks.getMakerCheckerData().subscribe();
    http.expectOne('/makercheckers').flush([{ id: 1 }]);
    if (field === 'user') user = { ...user, userId: 2, username: 'two' };
    if (field === 'tenant') settings.tenantIdentifier = 'two';
    if (field === 'server') settings.serverUrl = 'https://other.test';
    if (field === 'permissions') user.permissions = [];
    expect(service.count()).toBeNull();
  });
  it('makes failed and malformed counts unavailable instead of displaying zero', () => {
    tasks.getMakerCheckerData().subscribe({ error: () => undefined });
    http.expectOne('/makercheckers').flush({ errors: [] }, { status: 503, statusText: 'Unavailable' });
    expect(service.count()).toBeNull();
    tasks.getMakerCheckerData().subscribe({ error: () => undefined });
    http.expectOne('/makercheckers').flush({});
    expect(service.count()).toBeNull();
  });
  it('preserves the last valid same-scope count after cancellation', () => {
    tasks.getMakerCheckerData().subscribe();
    http.expectOne('/makercheckers').flush([{ id: 1 }]);
    const refresh = tasks.getMakerCheckerData().subscribe();
    const request = http.expectOne('/makercheckers');
    refresh.unsubscribe();
    expect(request.cancelled).toBe(true);
    expect(service.count()).toBe(1);
    tasks.getMakerCheckerData().subscribe();
    http.expectOne('/makercheckers').flush([]);
    expect(service.count()).toBe(0);
  });
});
