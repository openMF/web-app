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

export const CREDIT_APPLICATIONS_PERMISSION = 'READ_LOAN';

export function hasCreditApplicationsPermission(permissions: string[]): boolean {
  return (
    permissions.includes('ALL_FUNCTIONS') ||
    permissions.includes('ALL_FUNCTIONS_READ') ||
    permissions.includes(CREDIT_APPLICATIONS_PERMISSION)
  );
}

export const creditApplicationsGuard: CanActivateFn = () => {
  if (!environment.productionModeEnableRBAC) {
    return true;
  }

  const permissions = inject(AuthenticationService).getCredentials()?.permissions ?? [];
  return hasCreditApplicationsPermission(permissions) || inject(Router).createUrlTree(['/']);
};
