import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { SettingsService } from 'app/settings/settings.service';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class Dates {

  constructor(private settingsService: SettingsService,
      private datePipe: DatePipe) {}

  public getDate(timestamp: any): string {
    const dateFormat = this.settingsService.dateFormat;
    return this.datePipe.transform(timestamp, dateFormat);
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
}
