/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormfieldBase } from './formfield-base';

interface InputBaseOptions extends FormfieldBaseOptions {
  type?: string;
  [key: string]: any;
}

interface FormfieldBaseOptions {
  controlType?: string;
  controlName?: string;
  label?: string;
  value?: any;
  required?: boolean;
  order?: number;
}

export class InputBase extends FormfieldBase {
  controlType = 'input';
  type: string;

  constructor(options: InputBaseOptions = {}) {
    super(options);
    this.type = options.type || 'text';
  }
}
