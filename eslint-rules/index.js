/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

/**
 * Local ESLint plugin: `mifosx-playwright`.
 *
 * Houses project-specific custom rules used by the Playwright test
 * suite. Wired into the flat config in `eslint.config.js`.
 */
module.exports = {
  rules: {
    'no-direct-login-goto': require('./no-direct-login-goto'),
    'no-bare-wait-for-timeout': require('./no-bare-wait-for-timeout')
  }
};
