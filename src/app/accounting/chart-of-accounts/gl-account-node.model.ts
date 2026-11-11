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

  /** GL Account id. (not set for account type groups) */
  id?: number;
  /** GL Account type id. (used to create a sub-ledger account) */
  typeId?: number;
  /** Whether the GL Account is disabled. */
  disabled = false;
  /** Name of the tag assigned to the GL Account. */
  tagName = '';
  /** Parent GL Account. (not set for accounts directly under an account type) */
  parent?: GLAccountNode;
  /** Whether the node is an account type group (Assets, Liabilities, ...) instead of a GL Account. */
  isTypeGroup = false;

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
