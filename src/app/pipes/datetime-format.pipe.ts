import { Pipe, PipeTransform } from '@angular/core';
import moment, { Moment } from 'moment';

@Pipe({ name: 'datetimeFormat', standalone: true })
export class DatetimeFormatPipe implements PipeTransform {
  transform(value: unknown, datetimeFormat?: string): string {
    if (value == null || value === '') return '';
    let dateVal: Moment;
    if (Array.isArray(value)) {
      const [
        y,
        m,
        d,
        hh,
        mm,
        ss
      ] = value as number[];
      if (hh != null) {
        dateVal = moment({ year: y, month: (m ?? 1) - 1, date: d, hour: hh, minute: mm ?? 0, second: ss ?? 0 });
      } else {
        dateVal = moment({ year: y, month: (m ?? 1) - 1, date: d });
      }
    } else if (typeof value === 'number' && value < 1e12) {
      // epoch seconds
      dateVal = moment.unix(value);
    } else {
      dateVal = moment(value as any);
    }
    const fmt = datetimeFormat ?? 'YYYY-MM-DDTHH:mm:ssZ';
    return dateVal.format(fmt);
  }
}
