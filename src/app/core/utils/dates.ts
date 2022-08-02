import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class Dates {

  public static DEFAULT_DATEFORMAT = 'yyyy-MM-dd';
  public static DEFAULT_DATETIMEFORMAT = 'yyyy-MM-dd HH:mm';

  constructor(private datePipe: DatePipe) {}

  public getDate(timestamp: any): string {
    return this.datePipe.transform(timestamp, 'YYYY-MM-DD');
  }

  public formatDate(timestamp: any, dateFormat: string): string {
    return this.datePipe.transform(timestamp, dateFormat);
  }

  public parseDate(value: any): Date {
    if (value instanceof Array) {
      return moment(value.join('-'), 'YYYY-MM-DD').toDate();
    } else {
      return moment(value).toDate();
    }
  }

  public convertToDate(value: any, format: string): Date {
    return moment(value).toDate();
  }
}
