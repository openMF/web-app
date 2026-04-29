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
