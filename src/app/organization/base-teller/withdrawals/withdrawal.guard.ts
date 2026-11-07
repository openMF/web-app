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

export function canReadWithdrawals(permissions: readonly string[]): boolean {
  const canRead = (permission: string) => [
      'ALL_FUNCTIONS',
      'ALL_FUNCTIONS_READ',
      permission
    ].some((p) => permissions.includes(p));
  return canRead('READ_BASE_TELLER_WITHDRAWAL') && canRead('READ_CLIENT') && canRead('READ_SAVINGSACCOUNT');
}
export const withdrawalGuard: CanActivateFn = () =>
  canReadWithdrawals(inject(AuthenticationService).getCredentials()?.permissions ?? []) ||
  inject(Router).createUrlTree(['/organization/base-teller']);
