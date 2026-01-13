/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export interface OptionData {
  code: string;
  id: number;
  value: string;
}

export interface CodeName {
  code: string;
  name: string;
}

export interface StringEnumOptionData {
  id: string;
  value: string;
  code: string;
}
