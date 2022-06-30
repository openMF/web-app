import { Pipe, PipeTransform } from '@angular/core';
import { SettingsService } from 'app/settings/settings.service';
import * as moment from 'moment';

@Pipe({
  name: 'dateFormat'
})
export class DateFormatPipe implements PipeTransform {

  constructor(private settingsService: SettingsService) {
  }

  transform(value: any, dateFormat: string): any {
    const defaultDateFormat = this.settingsService.dateFormat.replace('dd', 'DD');
    if (typeof value === 'undefined') {
      return '';
    }
    let dateVal;
    if (value instanceof Array) {
      dateVal = moment(value.join('-'), 'YYYY-MM-DD');
    } else {
      dateVal = moment(value);
    }
    if (dateFormat == null) {
      return dateVal.format(defaultDateFormat);
    }
    return dateVal.format(dateFormat);
  }

}
