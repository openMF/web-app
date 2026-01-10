/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable } from '@angular/core';
import { OptionData } from 'app/shared/models/option-data.model';

@Injectable({
  providedIn: 'root'
})
export class DropdownOptions {
  public retrievePeriodFrequencyTypeOptions(includeAll: boolean): OptionData[] {
    if (includeAll) {
      return [
        { id: 0, code: 'DAYS', value: 'Days' },
        { id: 1, code: 'WEEKS', value: 'Weeks' },
        { id: 2, code: 'MONTHS', value: 'Months' },
        { id: 3, code: 'YEARS', value: 'Years' },
        { id: 4, code: 'WHOLE_TERM', value: 'Whole Term' },
        { id: 5, code: 'INVALID', value: 'Invalid' }
      ];
    } else {
      return [
        { id: 0, code: 'DAYS', value: 'Days' },
        { id: 1, code: 'WEEKS', value: 'Weeks' },
        { id: 2, code: 'MONTHS', value: 'Months' },
        { id: 3, code: 'YEARS', value: 'Years' }
      ];
    }
  }
}
