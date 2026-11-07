/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { hasEnrollmentStatusPermission } from './enrollment-status.guard';

describe('Enrollment status route permission', () => {
  it('allows the backend enrollment-status permission and global grants', () => {
    expect(hasEnrollmentStatusPermission(['READ_ENROLLMENT_STATUS'])).toBe(true);
    expect(hasEnrollmentStatusPermission(['ALL_FUNCTIONS_READ'])).toBe(true);
    expect(hasEnrollmentStatusPermission(['ALL_FUNCTIONS'])).toBe(true);
  });

  it('denies access without the backend enrollment-status permission', () => {
    expect(hasEnrollmentStatusPermission([])).toBe(false);
    expect(hasEnrollmentStatusPermission(['READ_CLIENT'])).toBe(false);
  });
});
