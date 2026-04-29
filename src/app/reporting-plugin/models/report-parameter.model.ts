/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Custom Models */
import { SelectOption } from './select-option.model';

/** Report Parameter Model */
export class ReportParameter {
  name: string;
  variable: string;
  label: string;
  displayType: string;
  formatType: string;
  defaultVal: string | number | boolean | null;
  selectOne: string | null;
  selectAll: string | null;
  parentParameterName: string | null;
  inputName: string;
  selectOptions: SelectOption[] = [];
  childParameters: ReportParameter[] = [];
  pentahoName: string | null;

  constructor(options: (string | number | boolean | null)[]) {
    this.name = options[0] as string;
    this.variable = options[1] as string;
    this.label = options[2] as string;
    this.displayType = options[3] as string;
    this.formatType = options[4] as string;
    this.defaultVal = options[5];
    this.selectOne = options[6];
    this.selectAll = options[7];
    this.parentParameterName = options[8] as string | null;
    this.inputName = `R_${this.variable}`;
  }
}
