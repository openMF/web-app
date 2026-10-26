/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { describe, expect, it } from '@jest/globals';

import { routes } from '../../savings-routing.module';
import {
  ACQUISITION_BOARD_PERMISSIONS,
  acquisitionStatusGuard,
  hasAcquisitionBoardPermissions
} from './acquisition-status.guard';
import { AcquisitionStatusComponent } from './acquisition-status.component';

describe('Acquisition status route permissions', () => {
  it('requires every read permission enforced by the savings-plugin resource', () => {
    expect(hasAcquisitionBoardPermissions([...ACQUISITION_BOARD_PERMISSIONS])).toBe(true);
    expect(
      hasAcquisitionBoardPermissions([
        'READ_CLIENT',
        'READ_SAVINGSACCOUNT'
      ])
    ).toBe(false);
    expect(hasAcquisitionBoardPermissions(['ALL_FUNCTIONS_READ'])).toBe(true);
  });

  it('integrates the acquisition board as a guarded savings account tab route', () => {
    const accountRoute = routes[0].children?.find((route) => route.path === ':savingAccountId');
    const acquisitionRoute = accountRoute?.children?.find((route) => route.path === 'acquisition-status');

    expect(acquisitionRoute?.component).toBe(AcquisitionStatusComponent);
    expect(acquisitionRoute?.canActivate).toContain(acquisitionStatusGuard);
    expect(acquisitionRoute?.data?.['permissions']).toEqual(ACQUISITION_BOARD_PERMISSIONS);
  });
});
