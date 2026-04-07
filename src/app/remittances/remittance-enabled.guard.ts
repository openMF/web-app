/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { remittanceConfig } from './remittance.config';

/**
 * Guard to prevent access to the Remittance module if it is disabled in the config.
 */
export const remittanceEnabledGuard: CanActivateFn = () => {
  const router = inject(Router);

  if (remittanceConfig.isRemittanceEnabled) {
    return true;
  }

  // If disabled, redirect to home or a 404 page
  router.navigate(['/home'], { replaceUrl: true });
  return false;
};
