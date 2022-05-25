import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { SettingsService } from 'app/settings/settings.service';

@Injectable({
  providedIn: 'root'
})
export class Dates {

  constructor(private settingsService: SettingsService,
      private datePipe: DatePipe) {}

  public getDate(timestamp: any) {
    const dateFormat = this.settingsService.dateFormat;
    return this.datePipe.transform(timestamp, dateFormat);
  }
}
