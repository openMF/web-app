/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { AuthenticationService } from 'app/core/authentication/authentication.service';

@Injectable({ providedIn: 'root' })
export class AccountManagementAccess {
  private readonly auth = inject(AuthenticationService);
  /** These plugin resources require exact authority or ALL_FUNCTIONS, even if menu RBAC is disabled. */
  has(permission: string): boolean {
    const permissions = this.auth.getCredentials()?.permissions || [];
    return permissions.includes('ALL_FUNCTIONS') || permissions.includes(permission);
  }
  get anyRead(): boolean {
    return [
      'READ_SAVINGS_ACCOUNT_RELATIONSHIP',
      'READ_GUARANTEE_SWEEP',
      'READ_PLANNED_SAVINGS'
    ].some((p) => this.has(p));
  }
}
