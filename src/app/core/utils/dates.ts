import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import moment from 'moment';

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
    const datePipe: DatePipe = new DatePipe(this.language.code);
    return datePipe.transform(timestamp, dateFormat);
  }

  public formatDateAsString(value: Date, dateFormat: string): string {
    return moment(value).format(dateFormat);
  }

  public parseDate(value: any): Date {
    if (value instanceof Array) {
      return moment(value.join('-'), 'YYYY-MM-DD').toDate();
    } else {
      return moment(value).toDate();
    }
  }

  public parseDatetime(value: any): Date {
    return moment(value).toDate();
  }

  public convertToDate(value: any, format: string): Date {
    return moment(value).toDate();
  }

  get language() {
    if (!localStorage.getItem('mifosXLanguage')) {
      return 'en';
    }
    return JSON.parse(localStorage.getItem('mifosXLanguage'));
  }

  calculateDiff(date1: Date, date2: Date) {
    return Math.floor(
      (Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate()) -
        Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate())) /
        (1000 * 60 * 60 * 24)
    );
  }
}
