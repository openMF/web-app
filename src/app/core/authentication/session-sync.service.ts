/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, NgZone, OnDestroy, inject } from '@angular/core';
import { Subject, Observable } from 'rxjs';

/**
 * Synchronizes authentication state across browser tabs
 * via localStorage storage events.
 */
@Injectable({ providedIn: 'root' })
export class SessionSyncService implements OnDestroy {
  private ngZone = inject(NgZone);

  private readonly credentialsKey = 'mifosXCredentials';
  private readonly lastActivityKey = 'mifosXLastActivity';

  private readonly channel = new BroadcastChannel('mifosX_session_sync');

  private readonly crossTabLogout = new Subject<Storage>();
  private readonly crossTabLogin = new Subject<Storage>();
  private readonly crossTabTokenRefresh = new Subject<Storage>();

  readonly onCrossTabLogout$: Observable<Storage> = this.crossTabLogout.asObservable();
  readonly onCrossTabLogin$: Observable<Storage> = this.crossTabLogin.asObservable();
  readonly onCrossTabTokenRefresh$: Observable<Storage> = this.crossTabTokenRefresh.asObservable();

  private readonly storageListener = (event: StorageEvent) => this.onStorageEvent(event);

  constructor() {
    window.addEventListener('storage', this.storageListener);

    this.channel.onmessage = (event) => {
      const msg = event.data;
      if (msg.type === 'REQUEST_SESSION') {
        const creds = sessionStorage.getItem(this.credentialsKey);
        const twoFactor = sessionStorage.getItem('mifosXTwoFactorAuthenticationToken');
        if (creds) {
          this.channel.postMessage({ type: 'PROVIDE_SESSION', payload: { creds, twoFactor } });
        }
      } else if (msg.type === 'PROVIDE_SESSION' || msg.type === 'LOGIN' || msg.type === 'REFRESH') {
        sessionStorage.setItem(this.credentialsKey, msg.payload.creds);
        if (msg.payload.twoFactor) {
          sessionStorage.setItem('mifosXTwoFactorAuthenticationToken', msg.payload.twoFactor);
        } else {
          sessionStorage.removeItem('mifosXTwoFactorAuthenticationToken');
        }
        this.ngZone.run(() => {
          if (msg.type === 'REFRESH') {
            this.crossTabTokenRefresh.next(sessionStorage);
          } else {
            this.crossTabLogin.next(sessionStorage);
          }
        });
      } else if (msg.type === 'LOGOUT') {
        sessionStorage.removeItem(this.credentialsKey);
        this.ngZone.run(() => this.crossTabLogout.next(sessionStorage));
      }
    };

    // If opening a new tab without credentials, ask other tabs if they have a sessionStorage session
    if (!sessionStorage.getItem(this.credentialsKey) && !localStorage.getItem(this.credentialsKey)) {
      this.channel.postMessage({ type: 'REQUEST_SESSION' });
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('storage', this.storageListener);
    this.channel.close();
    this.crossTabLogout.complete();
    this.crossTabLogin.complete();
    this.crossTabTokenRefresh.complete();
  }

  /** Writes current timestamp so other tabs know the user is active. */
  updateActivity(): void {
    localStorage.setItem(this.lastActivityKey, Date.now().toString());
  }

  /** Returns the most recent cross-tab activity timestamp (epoch ms). */
  getLastActivity(): number {
    return Number(localStorage.getItem(this.lastActivityKey)) || 0;
  }

  /** Manually broadcasts a sessionStorage change since it doesn't fire storage events. */
  broadcastSessionStorageChange(
    action: 'LOGIN' | 'LOGOUT' | 'REFRESH',
    payload?: { creds: string; twoFactor?: string | null }
  ): void {
    this.channel.postMessage({ type: action, payload });
  }

  private onStorageEvent(event: StorageEvent): void {
    if (event.key !== this.credentialsKey) return;

    this.ngZone.run(() => {
      if (event.oldValue && !event.newValue) {
        this.crossTabLogout.next(localStorage);
      } else if (!event.oldValue && event.newValue) {
        this.crossTabLogin.next(localStorage);
      } else if (event.oldValue && event.newValue && event.oldValue !== event.newValue) {
        this.crossTabTokenRefresh.next(localStorage);
      }
    });
  }
}
