/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import moment from 'moment';

/**
 * "3 minutes ago", in the language the officer chose.
 *
 * Always pass the locale. `moment().fromNow()` reads a process-wide locale that
 * `date-format.pipe` and `datetime-format.pipe` both assign to as a side effect of
 * rendering, so whichever of them ran last decides the language. That is how the Copilot
 * ended up showing "před 14 minutami" to an officer working in English.
 *
 * Calling `.locale()` on the instance leaves the global setting alone, so this cannot
 * change what any other part of the app renders either.
 */
export function relativeTime(timestamp: number, momentLocale: string): string {
  return moment(timestamp)
    .locale(momentLocale || 'en')
    .fromNow();
}
