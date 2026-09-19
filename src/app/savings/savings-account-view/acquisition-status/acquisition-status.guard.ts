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
import { environment } from 'environments/environment';

export const ACQUISITION_BOARD_PERMISSIONS = [
  'READ_CLIENT',
  'READ_SAVINGSACCOUNT',
  'READ_ENROLLMENT_STATUS'
] as const;

export function hasAcquisitionBoardPermissions(permissions: string[]): boolean {
  return (
    permissions.includes('ALL_FUNCTIONS') ||
    permissions.includes('ALL_FUNCTIONS_READ') ||
    ACQUISITION_BOARD_PERMISSIONS.every((permission) => permissions.includes(permission))
  );
}

export const acquisitionStatusGuard: CanActivateFn = () => {
  if (!environment.productionModeEnableRBAC) {
    return true;
  }

  const permissions = inject(AuthenticationService).getCredentials()?.permissions ?? [];
  return hasAcquisitionBoardPermissions(permissions) || inject(Router).createUrlTree(['/']);
};
