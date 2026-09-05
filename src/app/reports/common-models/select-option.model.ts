/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Select Option model */
export class SelectOption {
  id: number;
  name: string;

  constructor(options: any[]) {
    this.id = options[0];
    // Office hierarchy is prefixed with leading dots (e.g. "...Branch Name") by the report SQL to denote nesting depth.
    this.name = typeof options[1] === 'string' ? options[1].replace(/^\.+/, '') : options[1];
  }
}
