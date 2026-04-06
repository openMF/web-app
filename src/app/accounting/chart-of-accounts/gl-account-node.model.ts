/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * GL Account Node model.
 */
export class GLAccountNode {
  /** GL Account Node children. */
  children: GLAccountNode[];

  name: string;
  glCode: string;
  type: string;
  usage: string;
  manualEntriesAllowed: boolean;
  description: string;

  constructor(
    name: string,
    glCode: string = '',
    type: string = '',
    usage: string = '',
    manualEntriesAllowed: boolean = false,
    description: string = ''
  ) {
    this.name = name;
    this.glCode = glCode;
    this.type = type;
    this.usage = usage;
    this.manualEntriesAllowed = manualEntriesAllowed;
    this.description = description;
    this.children = [];
  }
}
