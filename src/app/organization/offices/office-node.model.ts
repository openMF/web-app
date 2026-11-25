/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Office as returned by the server.
 */
export interface Office {
  id: number;
  name: string;
  hierarchy: string;
  parentId?: number;
  parentName?: string;
  externalId?: string;
  openingDate?: number[] | string;
}

/**
 * Office Node model.
 */
export class OfficeNode {
  /** Parent of the office. Not set when the parent is not in the list of offices. */
  parent?: OfficeNode;
  /** Offices directly under the office. */
  children: OfficeNode[] = [];

  constructor(
    public name: string,
    public id: number,
    public parentId?: number,
    public hierarchy: string = '',
    public externalId: string = '',
    public parentName: string = '',
    public openingDate?: number[] | string
  ) {}
}
