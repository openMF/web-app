/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Chart Data Model */
export class ChartData {
  keysLabel: string;
  valuesLabel: string;
  keys: string[];
  values: number[];

  constructor(response: any) {
    this.keysLabel = response.columnHeaders[0].columnName;
    this.valuesLabel = response.columnHeaders[1].columnName;
    this.keys = response.data.map((object: any) => object.row[0]);
    this.values = response.data.map((object: any) => object.row[1]);
  }
}
