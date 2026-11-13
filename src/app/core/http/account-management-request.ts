/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { HttpContextToken } from '@angular/common/http';

/** Account management renders safe, localized errors for plugin and native identity reads. */
export const ACCOUNT_MANAGEMENT_REQUEST = new HttpContextToken<boolean>(() => false);
