/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Backend validation codes that belong to the client field, rather than a technical failure. */
export const CLIENT_REPORT_ERROR_KEYS: Readonly<Record<string, string>> = {
  'error.msg.birt.client.invalid': 'reports.client.invalid',
  'error.msg.birt.client.not.found': 'reports.client.notFound',
  'error.msg.birt.client.no.loans': 'reports.client.noLoans'
};
