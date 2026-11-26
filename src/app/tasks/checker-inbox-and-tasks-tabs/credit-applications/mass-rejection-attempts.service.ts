/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { SettingsService } from 'app/settings/settings.service';

/** Persist uncertain attempts across queue navigation and reloads; never retry a financial write automatically. */
@Injectable({ providedIn: 'root' })
export class MassRejectionAttemptsService {
  private settings = inject(SettingsService);
  private attempts = new Set<string>();
  private key(id: number | string, workingCapital: boolean): string {
    return (
      'mifosXMassRejection:' +
      JSON.stringify([
        this.settings.serverUrl,
        this.settings.tenantIdentifier,
        workingCapital,
        String(id)
      ])
    );
  }
  locked(id: number | string, workingCapital: boolean): boolean {
    const key = this.key(id, workingCapital);
    try {
      return this.attempts.has(key) || localStorage.getItem(key) !== null;
    } catch {
      return true;
    }
  }
  lock(id: number | string, workingCapital: boolean): boolean {
    if (this.locked(id, workingCapital)) return false;
    const key = this.key(id, workingCapital);
    try {
      localStorage.setItem(key, 'pending-verification');
      if (localStorage.getItem(key) !== 'pending-verification') return false;
      this.attempts.add(key);
      return true;
    } catch {
      return false;
    }
  }
  unlock(id: number | string, workingCapital: boolean): void {
    const key = this.key(id, workingCapital);
    try {
      localStorage.removeItem(key);
      this.attempts.delete(key);
    } catch {
      /* Fail closed. */
    }
  }
}
