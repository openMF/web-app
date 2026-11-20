/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { environment } from 'environments/environment';
import { OrganizationService } from '../organization.service';

/** Check direct links against the server's hierarchy-scoped office list before resolving details. */
export const officeAccessGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const denied = router.createUrlTree(['/organization/offices']);
  const permissions = inject(AuthenticationService).getCredentials()?.permissions ?? [];
  const canRead = [
    'READ_OFFICE',
    'ALL_FUNCTIONS',
    'ALL_FUNCTIONS_READ'
  ].some((permission) => permissions.includes(permission));
  if (environment.productionModeEnableRBAC && !canRead) {
    return denied;
  }
  const officeId = route.paramMap.get('officeId');
  return inject(OrganizationService)
    .getOffices()
    .pipe(
      map((offices: any[]) =>
        Array.isArray(offices) && offices.some((office) => String(office.id) === officeId) ? true : denied
      ),
      // The office list also resolves getOffices(); use a fallback that does not retry it.
      catchError(() => of(router.createUrlTree(['/organization'])))
    );
};
