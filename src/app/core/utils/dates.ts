/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DatePipe } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import moment from 'moment';

export enum Month {
  Jan = 'Jan',
  Feb = 'Feb',
  Mar = 'Mar',
  Apr = 'Apr',
  May = 'May',
  Jun = 'Jun',
  Jul = 'Jul',
  Aug = 'Aug',
  Sep = 'Sep',
  Oct = 'Oct',
  Nov = 'Nov',
  Dec = 'Dec'
}

@Injectable({
  providedIn: 'root'
})
export class Dates {
  private datePipe = inject(DatePipe);

  public static DEFAULT_DATEFORMAT = 'yyyy-MM-dd';
  public static DEFAULT_DATETIMEFORMAT = 'yyyy-MM-dd HH:mm';

  public getDate(timestamp: any): string {
    return this.datePipe.transform(timestamp, 'yyyy-MM-dd');
  }

  public formatDate(timestamp: any, dateFormat: string): string {
    try {
      const datePipe: DatePipe = new DatePipe(this.language.code);
      return datePipe.transform(timestamp, dateFormat);
    } catch (e) {
      if (moment(timestamp).isValid()) {
        return this.formatDateAsString(timestamp, dateFormat);
      }
      throw e;
    }
  }

  /**
   * Formats the day of an annual or monthly fee with the monthDayFormat sent to Fineract.
   * The day comes as Fineract's [month, day] (template) or ISO month-day "--07-22" (saved account),
   * or as the full date picked in a charges step (e.g. "15 March 2027"), whose year is dropped.
   * The picked date is read with the dateFormat it was written with, so "05/11/2027" in dd/MM/yyyy is 5 November.
   */
  public formatMonthDay(monthDay: any, monthDayFormat: string, dateFormat: string): string {
    if (!monthDay) {
      return monthDay;
    }
    const isoMonthDay = typeof monthDay === 'string' ? /^--(\d{2})-(\d{2})$/.exec(monthDay) : null;
    const monthAndDay = isoMonthDay ? isoMonthDay.slice(1).map(Number) : Array.isArray(monthDay) ? monthDay : null;
    if (monthAndDay) {
      // 2000 is a leap year, so 29 February is kept.
      return this.formatDate(new Date(2000, monthAndDay[0] - 1, monthAndDay[1]), monthDayFormat);
    }
    const picked =
      typeof monthDay === 'string'
        ? moment(monthDay, this.angularToMomentFormat(dateFormat), this.getMomentLocale(this.language), true)
        : null;
    return this.formatDate(picked?.isValid() ? picked.toDate() : monthDay, monthDayFormat);
  }

  public formatDateAsString(value: Date, dateFormat: string): string {
    const momentFormat = this.angularToMomentFormat(dateFormat);
    // Month names must be in the UI language, which is the locale sent to Fineract with the date. Moment's global
    // locale can't be trusted for this: importing a moment locale file switches it to that locale.
    const localized = moment(value).locale(this.getMomentLocale(this.language));
    // Some locales (e.g. Nepali) also write digits in their own script; preparse turns them back into ASCII digits,
    // which is what Fineract parses. It returns the text unchanged for the other locales.
    return localized.localeData().preparse(localized.format(momentFormat));
  }

  public angularToMomentFormat(angularFormat: string): string {
    return angularFormat.replace(/y/g, 'Y').replace(/d/g, 'D').replace(/a/g, 'A');
  }

  public getMomentLocale(language?: { code: string }): string {
    const langCode = language?.code;
    if (!langCode) return 'en';
    if (langCode.includes('-')) return langCode.split('-')[0];
    return langCode;
  }

  public parseDate(value: any): Date {
    if (value instanceof Array) {
      return moment(value.join('-'), 'YYYY-MM-DD').toDate();
    } else {
      return moment(value).toDate();
    }
  }

  public isBefore(date1: Date, date2: Date): boolean {
    return (
      Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate()) <
      Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate())
    );
  }

  public isAfter(date1: Date, date2: Date): boolean {
    return (
      Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate()) >
      Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate())
    );
  }

  public parseDatetime(value: any): Date {
    return moment(value).toDate();
  }

  public convertToDate(value: any, format: string): Date {
    const momentFormat = this.angularToMomentFormat(format);
    return moment(value, momentFormat).toDate();
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

  get monthLabels(): Month[] {
    return Object.values(Month);
  }
}
