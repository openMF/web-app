/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { inject } from '@angular/core';
import { CanActivateFn, CanDeactivateFn, Router } from '@angular/router';
import { AuthenticationService } from 'app/core/authentication/authentication.service';

export const clientApprovalReadGuard: CanActivateFn = () => {
  const permissions = inject(AuthenticationService).getCredentials()?.permissions ?? [];
  return (
    permissions.some((permission: string) => [
        'ALL_FUNCTIONS',
        'ALL_FUNCTIONS_READ',
        'READ_CLIENT'
      ].includes(permission)) || inject(Router).createUrlTree(['/'])
  );
};

/** Do not cancel a confirmed batch by switching queues while commands are in flight. */
export const clientApprovalBatchGuard: CanDeactivateFn<{ busy: boolean }> = (component) => !component.busy;
