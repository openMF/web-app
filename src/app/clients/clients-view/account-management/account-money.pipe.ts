/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { decimal } from 'app/products/saving-products/product-editor/interest-rate.model';

@Pipe({ name: 'accountMoney', pure: false })
export class AccountMoneyPipe implements PipeTransform {
  private readonly translate = inject(TranslateService);
  transform(value: string | null | undefined, currency?: string, digits?: number): string {
    const unavailable = this.translate.instant('AccountManagement.NotEstablished');
    if (value == null || !decimal(value, digits ?? 6, true, true)) return unavailable;
    try {
      const locale = this.translate.currentLang || 'en-US';
      const scale = digits ?? (value.split('.')[1]?.length || 0);
      const [
        whole,
        fraction = ''
      ] = value.split('.');
      const parts = new Intl.NumberFormat(locale).formatToParts(1.1);
      const separator = parts.find((part) => part.type === 'decimal')?.value || '.';
      const integer = new Intl.NumberFormat(locale).format(BigInt(whole));
      const sign = value.startsWith('-') && BigInt(whole) === 0n ? '-' : '';
      const localized = new Intl.NumberFormat(locale, { useGrouping: false });
      const tail = fraction
        .slice(0, scale)
        .padEnd(scale, '0')
        .split('')
        .map((digit) => localized.format(Number(digit)))
        .join('');
      return sign + integer + (scale ? separator + tail : '') + (currency ? ' ' + currency : '');
    } catch {
      return unavailable;
    }
  }
}
