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
/** Match the backend's explicit method-security authorities, even when UI RBAC is disabled. */
export function hasFxPermission(permissions: readonly string[], permission: string): boolean {
  return permissions.includes('ALL_FUNCTIONS') || permissions.includes(permission);
}
export const fxRateGuard: CanActivateFn = () =>
  hasFxPermission(inject(AuthenticationService).getCredentials()?.permissions ?? [], 'READ_BASE_TELLER_FX_RATE') ||
  inject(Router).createUrlTree(['/organization']);
export const fxTellerGuard: CanActivateFn = () =>
  hasFxPermission(inject(AuthenticationService).getCredentials()?.permissions ?? [], 'READ_BASE_TELLER_FX') ||
  inject(Router).createUrlTree(['/organization/base-teller']);
