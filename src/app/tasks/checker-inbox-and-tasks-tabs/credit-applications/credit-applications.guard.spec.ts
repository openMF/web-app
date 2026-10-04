/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { describe, expect, it } from '@jest/globals';

import { CREDIT_APPLICATIONS_PERMISSION, hasCreditApplicationsPermission } from './credit-applications.guard';

describe('Credit applications route permissions', () => {
  it('matches the backend READ_LOAN permission and recognizes aggregate access', () => {
    expect(CREDIT_APPLICATIONS_PERMISSION).toBe('READ_LOAN');
    expect(hasCreditApplicationsPermission(['READ_LOAN'])).toBe(true);
    expect(hasCreditApplicationsPermission(['ALL_FUNCTIONS'])).toBe(true);
    expect(hasCreditApplicationsPermission(['ALL_FUNCTIONS_READ'])).toBe(true);
    expect(hasCreditApplicationsPermission(['READ_CLIENT'])).toBe(false);
  });
});
