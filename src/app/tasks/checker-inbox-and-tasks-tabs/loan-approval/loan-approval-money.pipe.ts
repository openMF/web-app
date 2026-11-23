/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/** Like AccountMoneyPipe, but aggregate totals may exceed the individual account amount limit. */
@Pipe({ name: 'loanApprovalMoney', pure: false })
export class LoanApprovalMoneyPipe implements PipeTransform {
  private translate = inject(TranslateService);
  private static readonly formatters = new Map<
    string,
    { number: Intl.NumberFormat; digitFormat: Intl.NumberFormat; separator: string }
  >();
  transform(value: unknown, currency: string, digits: number): string {
    const unavailable = this.translate.instant('loanApproval.amountUnavailable');
    if (
      typeof value !== 'string' ||
      !currency ||
      !Number.isInteger(digits) ||
      digits < 0 ||
      digits > 12 ||
      !/^\d+(?:\.\d+)?$/.test(value)
    )
      return unavailable;
    const [
      whole,
      fraction = ''
    ] = value.split('.');
    if (fraction.replace(/0+$/, '').length > digits) return unavailable;
    try {
      const locale = this.translate.currentLang || 'en-US';
      let formatters = LoanApprovalMoneyPipe.formatters.get(locale);
      if (!formatters) {
        const number = new Intl.NumberFormat(locale);
        formatters = {
          number,
          digitFormat: new Intl.NumberFormat(locale, { useGrouping: false }),
          separator: number.formatToParts(1.1).find((part) => part.type === 'decimal')?.value || '.'
        };
        LoanApprovalMoneyPipe.formatters.set(locale, formatters);
      }
      const { number, digitFormat, separator } = formatters;
      const tail = fraction
        .slice(0, digits)
        .padEnd(digits, '0')
        .split('')
        .map((digit) => digitFormat.format(Number(digit)))
        .join('');
      return number.format(BigInt(whole)) + (digits ? separator + tail : '') + ' ' + currency;
    } catch {
      return unavailable;
    }
  }
}
