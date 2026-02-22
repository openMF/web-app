/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Pipe, PipeTransform, inject, OnDestroy } from '@angular/core';
import { SettingsService } from 'app/settings/settings.service';
import { TranslateService } from '@ngx-translate/core';
import { Dates } from 'app/core/utils/dates';
import { Subscription } from 'rxjs';
import moment, { Moment } from 'moment';

@Pipe({ name: 'datetimeFormat', pure: false })
export class DatetimeFormatPipe implements PipeTransform, OnDestroy {
  private settingsService = inject(SettingsService);
  private translateService = inject(TranslateService);
  private dateUtils = inject(Dates);
  private onLangChange: Subscription;

  constructor() {
    this.onLangChange = this.translateService.onLangChange.subscribe(() => {});
  }

  ngOnDestroy(): void {
    if (this.onLangChange) {
      this.onLangChange.unsubscribe();
    }
  }

  transform(value: unknown, datetimeFormat?: string): string {
    const defaultDatetimeFormat = this.dateUtils.angularToMomentFormat(this.settingsService.datetimeFormat);

    if (value == null || value === '') return '';

    const momentLocale = this.dateUtils.getMomentLocale(this.settingsService.language);
    moment.locale(momentLocale);

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
        dateVal = moment({
          year: y,
          month: (m ?? 1) - 1,
          date: d,
          hour: hh,
          minute: mm ?? 0,
          second: ss ?? 0
        });
      } else {
        dateVal = moment({ year: y, month: (m ?? 1) - 1, date: d });
      }
    } else if (typeof value === 'number' && value < 1e12) {
      dateVal = moment.unix(value);
    } else {
      dateVal = moment(value as any);
    }

    if (!dateVal.isValid()) {
      return '';
    }

    if (!datetimeFormat) {
      return dateVal.format(defaultDatetimeFormat);
    }

    return dateVal.format(datetimeFormat);
  }
}
