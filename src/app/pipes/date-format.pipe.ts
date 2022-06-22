import { Pipe, PipeTransform } from '@angular/core';
import { SettingsService } from 'app/settings/settings.service';
import * as moment from 'moment';

@Pipe({
  name: 'dateFormat'
})
export class DateFormatPipe implements PipeTransform {

  defaultDateFormat: string;

  constructor(private settingsService: SettingsService) {
    this.defaultDateFormat = this.settingsService.dateFormat;
    this.defaultDateFormat = this.defaultDateFormat.replace('dd', 'DD');
  }

  transform(value: Date | moment.Moment, dateFormat: string): any {
    if (dateFormat == null) {
      return moment(value).format(this.defaultDateFormat);
    }
    return moment(value).format(dateFormat);
  }

}
