/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Select Option model */
export class SelectOption {
  /** Report SQL picks the value column, so an id can be a code such as 'USD'. */
  id: number | string;
  name: string | number;

  constructor(options: any[]) {
    this.id = options[0];
    // Fineract's report SQL indents option names with four dots per hierarchy level
    // (e.g. "........Dubai Branch"), which a mat-option renders literally.
    this.name = typeof options[1] === 'string' ? options[1].replace(/^\.+/, '') : options[1];
  }
}
