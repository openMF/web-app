import { Pipe, PipeTransform, inject } from '@angular/core';
import { SettingsService } from 'app/settings/settings.service';
import moment from 'moment';

@Pipe({ name: 'dateFormat' })
export class DateFormatPipe implements PipeTransform {
  private settingsService = inject(SettingsService);

  transform(value: any, dateFormat?: string): any {
    const defaultDateFormat = this.settingsService.dateFormat.replace('dd', 'DD');
    if (typeof value === 'undefined') {
      return '';
    }
    let dateVal;
    moment.locale(this.settingsService.language.code);
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
