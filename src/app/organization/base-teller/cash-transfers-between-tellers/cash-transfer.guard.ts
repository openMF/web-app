/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
export function canReadCashTransfers(permissions: readonly string[]): boolean {
  return [
    'ALL_FUNCTIONS',
    'ALL_FUNCTIONS_READ',
    'READ_BASE_TELLER_CASH_TRANSFER'
  ].some((p) => permissions.includes(p));
}
/** Always enforce authorization, including when legacy RBAC is disabled. */
export const cashTransferGuard: CanActivateFn = () =>
  canReadCashTransfers(inject(AuthenticationService).getCredentials()?.permissions ?? []) ||
  inject(Router).createUrlTree(['/organization/base-teller']);
