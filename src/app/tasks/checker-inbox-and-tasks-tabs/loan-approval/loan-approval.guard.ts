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

export const loanApprovalReadGuard: CanActivateFn = () => {
  const permissions = inject(AuthenticationService).getCredentials()?.permissions ?? [];
  return (
    permissions.some((permission: string) => [
        'ALL_FUNCTIONS',
        'ALL_FUNCTIONS_READ',
        'READ_LOAN'
      ].includes(permission)) || inject(Router).createUrlTree(['/'])
  );
};
// APPROVE_LOAN_CHECKER authorizes checking an existing maker-checker command, not creating a new approval.
export const loanApprovalActionGuard: CanActivateFn = (route) => {
  if (route.params['action'] !== 'Approve') return true;
  const permissions = inject(AuthenticationService).getCredentials()?.permissions ?? [];
  return (
    permissions.some((permission: string) => [
        'ALL_FUNCTIONS',
        'APPROVE_LOAN'
      ].includes(permission)) || inject(Router).createUrlTree(['/'])
  );
};
export const loanApprovalBatchGuard: CanDeactivateFn<{ busy: boolean }> = (component) => !component.busy;
