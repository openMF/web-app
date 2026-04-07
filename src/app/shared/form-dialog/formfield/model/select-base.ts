/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormfieldBase } from './formfield-base';

interface SelectOption {
  label: string;
  value: string;
  data: {}[];
}

interface SelectBaseOptions {
  options?: SelectOption;
  controlType?: string;
  controlName?: string;
  label?: string;
  value?: any;
  required?: boolean;
  order?: number;
}

export class SelectBase extends FormfieldBase {
  controlType = 'select';
  options: SelectOption;

  constructor(options: SelectBaseOptions = {}) {
    super(options);
    this.options = options.options || { label: '', value: '', data: [] };
  }
}
