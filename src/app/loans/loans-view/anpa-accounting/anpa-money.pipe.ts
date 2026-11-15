/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Loan, Money } from '../../models/anpa-accounting.model';

@Pipe({ name: 'anpaMoney', pure: false })
export class AnpaMoneyPipe implements PipeTransform {
  private readonly translate = inject(TranslateService);
  transform(value: Money | undefined, loan?: Loan | null): string {
    if (value === null || value === undefined || !Number.isFinite(value))
      return this.translate.instant('labels.inputs.Unavailable');
    const digits = loan?.currencyDigits ?? 2;
    return (
      new Intl.NumberFormat(this.translate.currentLang || 'en-US', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits
      }).format(value) + (loan?.currency ? ' ' + loan.currency : '')
    );
  }
}
