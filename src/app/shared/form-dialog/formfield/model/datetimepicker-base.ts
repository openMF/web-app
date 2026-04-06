/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormfieldBase } from './formfield-base';

// Define the base options interface based on FormfieldBase requirements
interface FormfieldBaseOptions {
  controlType?: string;
  controlName?: string;
  label?: string;
  value?: any;
  required?: boolean;
  order?: number;
}

// Extend the base options for DateTimePicker
interface DateTimePickerOptions extends FormfieldBaseOptions {
  minDate?: Date;
  maxDate?: Date;
}

export class DateTimepickerBase extends FormfieldBase {
  controlType = 'datetimepicker';
  minDate: Date;
  maxDate: Date;

  constructor(options: DateTimePickerOptions = {}) {
    super(options);
    this.minDate = options.minDate || new Date(2000, 0, 1);
    this.maxDate = options.maxDate || new Date();
  }
}
