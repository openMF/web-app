/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { AuthenticationService } from 'app/core/authentication/authentication.service';

/** Financial evidence stays permission-gated even when legacy menu RBAC is disabled. */
@Injectable({ providedIn: 'root' })
export class AnpaAccessService {
  private readonly auth = inject(AuthenticationService);
  allows(...required: string[]): boolean {
    const permissions = this.auth.getCredentials()?.permissions ?? [];
    return required.every(
      (permission) =>
        permissions.includes('ALL_FUNCTIONS') ||
        permissions.includes(permission) ||
        (permission.startsWith('READ_') && permissions.includes('ALL_FUNCTIONS_READ'))
    );
  }
  get canRead(): boolean {
    return this.allows('READ_ANPA_ACCOUNTING', 'READ_LOAN', 'READ_GLACCOUNT', 'READ_JOURNALENTRY');
  }
  get actorId(): number | undefined {
    return this.auth.getCredentials()?.userId;
  }
}
