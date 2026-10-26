/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { fromEvent, merge, Subject, timer, Observable, Subscription } from 'rxjs';
import { SessionSyncService } from '../../core/authentication/session-sync.service';

/**
 * Idle timeout service used to track idle user across all tabs.
 */
@Injectable({
  providedIn: 'root'
})
export class IdleTimeoutService {
  private sessionSyncService = inject(SessionSyncService);

  private readonly timeoutDelay = environment.session.timeout.idleTimeout || 300000;
  private timeout$ = new Subject<void>();
  private resetTimer$ = new Subject<void>();
  private active = false;
  private timerSubscription?: Subscription;
  private userActionsSubscription?: Subscription;

  readonly $onSessionTimeout: Observable<void>;

  constructor() {
    this.$onSessionTimeout = this.timeout$.asObservable();

    this.resetTimer$.subscribe(() => {
      this.timerSubscription?.unsubscribe();
      this.timerSubscription = timer(this.timeoutDelay).subscribe(() => {
        const lastActivity = this.sessionSyncService.getLastActivity();
        const elapsed = Date.now() - lastActivity;

        if (elapsed < this.timeoutDelay) {
          // Another tab was active recently — reset instead of timing out
          this.reset();
        } else {
          this.timeout$.next();
          this.stop();
        }
      });
    });
  }

  start() {
    if (!this.active) {
      this.active = true;
      this.reset();

      const events = [
        'mousemove',
        'keydown',
        'wheel',
        'mousedown',
        'scroll'
      ];
      const userActions$ = merge(...events.map((e) => fromEvent(document, e)));
      this.userActionsSubscription = userActions$.subscribe(() => {
        this.sessionSyncService.updateActivity();
        this.reset();
      });
    }
  }

  stop() {
    if (this.active) {
      this.active = false;
      this.timerSubscription?.unsubscribe();
      this.userActionsSubscription?.unsubscribe();
    }
  }

  reset() {
    if (this.active) {
      this.resetTimer$.next();
    }
  }
}
