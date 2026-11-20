/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Subscription } from 'rxjs';

import { SettingsService } from 'app/settings/settings.service';
import { environment } from '../../../environments/environment';
import { ConnectionStatus } from './connection-status.model';
import { ConnectionStatusService } from './connection-status.service';

describe('ConnectionStatusService', () => {
  const server = 'https://fineract.example.org';
  const healthUrl = `${server}${environment.apiActuator}/actuator/health`;
  const start = new Date(2026, 10, 10, 23, 38, 0);

  let service: ConnectionStatusService;
  let httpMock: HttpTestingController;
  let subscriptions: Subscription[];
  let statuses: ConnectionStatus[];
  let hidden: boolean;
  let settings: { serverHost: string };

  const subscribe = () => subscriptions.push(service.status$.subscribe((status) => statuses.push(status)));
  const latest = () => statuses[statuses.length - 1];
  const answer = (status = 200) =>
    httpMock.expectOne(healthUrl).flush('{"status":"UP"}', { status, statusText: `${status}` });
  const setHidden = (value: boolean) => {
    hidden = value;
    document.dispatchEvent(new Event('visibilitychange'));
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(start);
    hidden = false;
    settings = { serverHost: server };
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SettingsService, useValue: settings }
      ]
    });

    service = TestBed.inject(ConnectionStatusService);
    httpMock = TestBed.inject(HttpTestingController);
    subscriptions = [];
    statuses = [];
  });

  afterEach(() => {
    subscriptions.forEach((subscription) => subscription.unsubscribe());
    httpMock.verify();
    delete (document as any).hidden;
    jest.useRealTimers();
  });

  it('should report checking until the first answer, then connected', () => {
    subscribe();

    expect(latest()).toEqual({ state: 'checking', checkedAt: null, nextCheckAt: null });

    answer();

    expect(latest()).toEqual({
      state: 'online',
      checkedAt: start,
      nextCheckAt: new Date(start.getTime() + ConnectionStatusService.checkInterval)
    });
  });

  it('should report the server unreachable on a network error', () => {
    subscribe();
    httpMock.expectOne(healthUrl).error(new ProgressEvent('error'));

    expect(latest().state).toBe('offline');
  });

  it('should report the server unreachable when it answers with a server error', () => {
    subscribe();
    answer(503);

    expect(latest().state).toBe('offline');
  });

  it('should report connected when the server answers with a client error', () => {
    subscribe();
    answer(401);

    expect(latest().state).toBe('online');
  });

  it('should report the server unreachable when the check times out', () => {
    subscribe();
    const request = httpMock.expectOne(healthUrl);

    // The login connection card (WEB-1445) must report a hung server after 5 seconds, not sooner.
    jest.advanceTimersByTime(4999);
    expect(request.cancelled).toBe(false);
    expect(latest().state).toBe('checking');

    jest.advanceTimersByTime(1);

    expect(request.cancelled).toBe(true);
    expect(latest().state).toBe('offline');
  });

  it('should check again every interval without showing the checking state', () => {
    subscribe();
    answer();
    const checkedBefore = statuses.length;

    jest.advanceTimersByTime(ConnectionStatusService.checkInterval);
    answer(503);

    const recheck = statuses.slice(checkedBefore);
    expect(recheck.map((status) => status.state)).toEqual([
      'online',
      'offline'
    ]);
  });

  it('should check immediately on checkNow and restart the interval', () => {
    subscribe();
    httpMock.expectOne(healthUrl).error(new ProgressEvent('error'));
    jest.advanceTimersByTime(5000);

    service.checkNow();

    expect(latest()).toEqual(expect.objectContaining({ state: 'checking', nextCheckAt: null }));
    answer();
    expect(latest().state).toBe('online');

    jest.advanceTimersByTime(ConnectionStatusService.checkInterval - 1);
    httpMock.expectNone(healthUrl);
    jest.advanceTimersByTime(1);
    answer();
  });

  it('should pause while the tab is hidden and check as soon as it is shown again', () => {
    subscribe();
    answer();

    setHidden(true);

    expect(latest().nextCheckAt).toBeNull();
    jest.advanceTimersByTime(ConnectionStatusService.checkInterval * 3);
    httpMock.expectNone(healthUrl);

    setHidden(false);
    answer();
  });

  it('should not check when the window regains focus while the tab stays visible', () => {
    subscribe();
    answer();

    window.dispatchEvent(new Event('focus'));

    httpMock.expectNone(healthUrl);
  });

  it('should not start a second check while one is running', () => {
    subscribe();

    setHidden(false);
    service.checkNow();

    expect(httpMock.match(healthUrl).length).toBe(1);
  });

  it('should restart a running check when another server was selected', () => {
    subscribe();
    const oldServer = httpMock.expectOne(healthUrl);
    const otherHealthUrl = `https://other.example.org${environment.apiActuator}/actuator/health`;

    settings.serverHost = 'https://other.example.org';
    service.checkNow();

    expect(oldServer.cancelled).toBe(true);
    httpMock.expectOne(otherHealthUrl).flush('{"status":"UP"}');
    expect(latest().state).toBe('online');
  });

  it('should share one check loop between subscribers', () => {
    subscribe();
    answer();

    let replayed: ConnectionStatus;
    subscriptions.push(service.status$.subscribe((status) => (replayed = status)));

    httpMock.expectNone(healthUrl);
    expect(replayed.state).toBe('online');
  });

  it('should stop checking once nothing is subscribed', () => {
    subscribe();
    answer();

    subscriptions.forEach((subscription) => subscription.unsubscribe());
    jest.advanceTimersByTime(ConnectionStatusService.checkInterval * 3);
    setHidden(true);
    setHidden(false);

    httpMock.expectNone(healthUrl);
  });
});
