/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Theme model.
 */
export interface Theme {
  href: string;
  primary: string;
  accent: string;
  isDark?: boolean;
  isDefault?: boolean;
}
