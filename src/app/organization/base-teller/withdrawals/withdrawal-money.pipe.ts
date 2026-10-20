/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { fromUnits, toUnits } from '../cash-exchange/cash-exchange.models';
import { Decimal } from './withdrawal.models';

/** Format exact backend decimals without converting financial values to floating point. */
@Pipe({ name: 'withdrawalMoney', pure: false })
export class WithdrawalMoneyPipe implements PipeTransform {
  private readonly translate = inject(TranslateService);
  transform(value: Decimal | null, precision: number): string {
    if (value === null) return '—';
    try {
      let locale = this.translate.currentLang || 'en-US';
      try {
        Intl.getCanonicalLocales(locale);
      } catch {
        locale = locale.match(/^[a-z]{2,3}(?:-[a-z]{4})?(?:-(?:[a-z]{2}|[0-9]{3}))?/i)?.[0] || 'en-US';
      }
      const [
        whole,
        fraction
      ] = fromUnits(toUnits(value, precision), precision).split('.');
      const integer = new Intl.NumberFormat(locale).format(BigInt(whole));
      if (!fraction) return integer;
      const separator =
        new Intl.NumberFormat(locale).formatToParts(1.1).find((part) => part.type === 'decimal')?.value ?? '.';
      const digits = new Intl.NumberFormat(locale, { useGrouping: false });
      return integer + separator + Array.from(fraction, (digit) => digits.format(Number(digit))).join('');
    } catch {
      return '—';
    }
  }
}
