/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SEMI_MONTHLY_LAST_DAY_OF_MONTH, isValidRepaymentDayPair } from './semi-monthly';

/**
 * Renders the pair of configured due days of a semi-monthly schedule, e.g. "Repayments on days 10
 * and 25 of each month" or "Repayments on day 15 and the last day of each month" (second day 31).
 * Impure so the text follows a language switch, like the app's `translateKey` pipe.
 */
@Pipe({ name: 'semiMonthlyDueDays', standalone: true, pure: false })
export class SemiMonthlyDueDaysPipe implements PipeTransform {
  private translateService = inject(TranslateService);

  transform(firstDay: unknown, secondDay: unknown): string {
    if (!isValidRepaymentDayPair(firstDay, secondDay)) {
      return '';
    }
    const first = Number(firstDay);
    const second = Number(secondDay);
    if (second === SEMI_MONTHLY_LAST_DAY_OF_MONTH) {
      return this.translateService.instant('labels.text.Semi-monthly due days last day', { first });
    }
    return this.translateService.instant('labels.text.Semi-monthly due days', { first, second });
  }
}

/** Renders one configured semi-monthly due day: the number, or "Last day of the month" for 31. */
@Pipe({ name: 'semiMonthlyDay', standalone: true, pure: false })
export class SemiMonthlyDayPipe implements PipeTransform {
  private translateService = inject(TranslateService);

  transform(day: unknown): string {
    if (day === null || day === undefined || day === '') {
      return '';
    }
    return Number(day) === SEMI_MONTHLY_LAST_DAY_OF_MONTH
      ? this.translateService.instant('labels.text.Last day of the month')
      : String(day);
  }
}
