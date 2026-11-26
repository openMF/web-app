/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { SettingsService } from 'app/settings/settings.service';

@Injectable({ providedIn: 'root' })
export class CheckerInboxCountService {
  private authentication = inject(AuthenticationService);
  private settings = inject(SettingsService);
  private version = 0;
  private sessionId = 0;
  private state = signal<{ scope: string; count: number | null } | null>(null);

  constructor() {
    this.authentication.isAuthenticated$.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe(() => {
      this.version++;
      this.sessionId++;
      this.state.set(null);
    });
  }

  scope(): string {
    const user = this.authentication.getCredentials();
    return user
      ? JSON.stringify([
          this.sessionId,
          this.settings.serverUrl,
          this.settings.tenantIdentifier,
          user.userId,
          user.username,
          user.permissions
        ])
      : '';
  }

  count(): number | null {
    const state = this.state();
    return state?.scope === this.scope() ? state.count : null;
  }

  begin(scope: string): number {
    const version = ++this.version;
    if (this.state()?.scope !== scope) this.state.set(null);
    return version;
  }

  update(count: number | null, scope: string, version: number): void {
    if (version === this.version && scope && scope === this.scope()) this.state.set({ scope, count });
  }
}
