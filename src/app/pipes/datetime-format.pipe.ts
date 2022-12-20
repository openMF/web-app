import { Pipe, PipeTransform } from '@angular/core';
import { SettingsService } from 'app/settings/settings.service';
import * as moment from 'moment';

@Pipe({
  name: 'datetimeFormat'
})
export class DatetimeFormatPipe implements PipeTransform {

  constructor(private settingsService: SettingsService) {
  }

  transform(value: any, datetimeFormat?: string): any {
    const defaultDateFormat = this.settingsService.dateFormat.replace('dd', 'DD');
    if (typeof value === 'undefined') {
      return '';
    }
    let dateVal;
    if (value instanceof Array) {
      dateVal = moment(value.join('-'), 'YYYY-MM-DD HH:mm:ss');
    } else {
      dateVal = moment(value);
    }
    if (datetimeFormat == null) {
      return dateVal.format(defaultDateFormat + ' HH:mm:ss');
    }
    return dateVal.format(datetimeFormat);
  }
}
