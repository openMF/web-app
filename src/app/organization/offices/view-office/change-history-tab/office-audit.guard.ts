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
import { canReadOfficeAudit } from './office-audit';

export const officeAuditGuard: CanActivateFn = (route) => {
  if (canReadOfficeAudit(inject(AuthenticationService).getCredentials())) return true;
  return inject(Router).createUrlTree([
    '/organization/offices',
    route.parent.paramMap.get('officeId'),
    'general'
  ]);
};
