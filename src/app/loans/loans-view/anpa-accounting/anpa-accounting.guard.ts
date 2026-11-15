/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AnpaAccessService } from '../../services/anpa-access.service';

export const anpaAccountingGuard: CanActivateFn = (route) => {
  const permitted = inject(AnpaAccessService).canRead && route.queryParamMap.get('productType') !== 'working-capital';
  return (
    permitted ||
    inject(Router).createUrlTree(
      [
        '/loans',
        route.parent?.paramMap.get('loanId'),
        'general'
      ],
      { queryParams: route.queryParams }
    )
  );
};
