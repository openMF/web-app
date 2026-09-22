/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { describe, expect, it } from '@jest/globals';

import {
  CREDIT_ORIGINATION_BOARD_PERMISSION,
  hasCreditOriginationBoardPermission
} from './credit-origination-status.guard';

describe('Credit origination status route permissions', () => {
  it('matches the backend READ_LOAN permission and recognizes global read access', () => {
    expect(hasCreditOriginationBoardPermission(['READ_LOAN'])).toBe(true);
    expect(hasCreditOriginationBoardPermission(['READ_CLIENT'])).toBe(false);
    expect(hasCreditOriginationBoardPermission(['ALL_FUNCTIONS_READ'])).toBe(true);
  });
});
