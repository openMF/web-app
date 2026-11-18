/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { DOCUMENT } from '@angular/common';
import { HttpBackend, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable, Subject, Subscriber, Subscription, TeardownLogic, of } from 'rxjs';
import { catchError, map, shareReplay, timeout } from 'rxjs/operators';

/** Custom Services */
import { SettingsService } from 'app/settings/settings.service';

/** Custom Models */
import { ConnectionStatus } from './connection-status.model';

/** Environment Configuration */
import { environment } from '../../../environments/environment';

/**
 * Checks whether the Fineract server is reachable, for every view that shows the connection
 * status (the footer status bar and the login connection card).
 *
 * The first subscriber starts a single shared check loop and the last one to unsubscribe stops
 * it, so the server is only checked while the status is on screen.
 */
@Injectable({
  providedIn: 'root'
})
export class ConnectionStatusService {
  /** Time between automatic checks, in milliseconds. */
  static readonly checkInterval = 30000;
  /** Time after which an unanswered check counts as unreachable, in milliseconds. */
  static readonly checkTimeout = 5000;

  /**
   * Bypasses the interceptors: a check every 30 s must not flash the progress bar, raise an
   * error toast each time it fails or be answered from the HTTP cache.
   */
  private http = new HttpClient(inject(HttpBackend));
  private settingsService = inject(SettingsService);
  private document = inject(DOCUMENT);

  private manualCheck$ = new Subject<void>();

  /** Current connection status. New subscribers receive the latest value straight away. */
  readonly status$: Observable<ConnectionStatus> = new Observable<ConnectionStatus>((subscriber) =>
    this.runChecks(subscriber)
  ).pipe(shareReplay({ bufferSize: 1, refCount: true }));

  /**
   * Checks immediately ("Retry now"), showing the checking state until the answer arrives.
   * The next automatic check is then due a full interval later.
   */
  checkNow(): void {
    this.manualCheck$.next();
  }

  /**
   * Runs the check loop for the shared subscription: a first check straight away, then one
   * every interval while the tab is visible, plus one whenever the tab is shown again. Window
   * focus is not a trigger: while the tab is visible the interval keeps the status fresh, and
   * switching windows would otherwise send a check every time.
   */
  private runChecks(subscriber: Subscriber<ConnectionStatus>): TeardownLogic {
    let status: ConnectionStatus = { state: 'checking', checkedAt: null, nextCheckAt: null };
    let running = false;
    /** Health URL the running check was sent to. */
    let runningUrl = '';
    let request: Subscription | undefined;
    let nextCheck: ReturnType<typeof setTimeout> | undefined;

    const emit = (next: ConnectionStatus) => {
      status = next;
      subscriber.next(status);
    };

    const scheduleNextCheck = () => {
      clearTimeout(nextCheck);
      if (this.document.hidden) {
        // A background tab is not polled; it is checked again as soon as it is shown.
        emit({ ...status, nextCheckAt: null });
        return;
      }
      emit({ ...status, nextCheckAt: new Date(Date.now() + ConnectionStatusService.checkInterval) });
      nextCheck = setTimeout(() => check(false), ConnectionStatusService.checkInterval);
    };

    const check = (showChecking: boolean) => {
      clearTimeout(nextCheck);
      const url = this.healthUrl();
      if (running && url === runningUrl) {
        // The running check reports for this request too.
        if (showChecking) {
          emit({ ...status, state: 'checking' });
        }
        return;
      }
      // A check still waiting on a server that is no longer selected would report for the wrong one.
      request?.unsubscribe();
      running = true;
      runningUrl = url;
      // Automatic checks keep showing the last state, so the bar does not flicker every interval.
      emit({ ...status, state: showChecking ? 'checking' : status.state, nextCheckAt: null });
      request = this.isReachable(url).subscribe((reachable: boolean) => {
        running = false;
        status = { state: reachable ? 'online' : 'offline', checkedAt: new Date(), nextCheckAt: null };
        scheduleNextCheck();
      });
    };

    const onVisibilityChange = () => {
      if (this.document.hidden) {
        clearTimeout(nextCheck);
        emit({ ...status, nextCheckAt: null });
      } else {
        check(false);
      }
    };

    const manualChecks = this.manualCheck$.subscribe(() => check(true));
    this.document.addEventListener('visibilitychange', onVisibilityChange);
    check(true);

    return () => {
      clearTimeout(nextCheck);
      request?.unsubscribe();
      manualChecks.unsubscribe();
      this.document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }

  /**
   * The server counts as reachable when it answers below 500: an authentication or not found
   * error still comes from a running server, while a 5xx means it is down (the health endpoint
   * answers 503 when Fineract reports DOWN).
   */
  private isReachable(url: string): Observable<boolean> {
    return this.http.get(url, { responseType: 'text' }).pipe(
      timeout(ConnectionStatusService.checkTimeout),
      map(() => true),
      catchError((error: unknown) =>
        of(error instanceof HttpErrorResponse && error.status >= 400 && error.status < 500)
      )
    );
  }

  /** Health endpoint of the current server, resolved the way `ApiPrefixInterceptor` resolves actuator URLs. */
  private healthUrl(): string {
    const actuator = environment.apiActuator;
    const base = /^https?:/.test(actuator) ? actuator : this.settingsService.serverHost + actuator;
    return `${base}/actuator/health`;
  }
}
