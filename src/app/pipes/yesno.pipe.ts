/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({ name: 'yesNo', pure: false })
export class YesnoPipe implements PipeTransform {
  private translateService = inject(TranslateService);

  transform(value: any, ...args: unknown[]): string {
    if (value == null || (typeof value === 'string' && value.trim() === '')) {
      return '';
    }
    const isTrue = this.coerceBoolean(value);
    const result = isTrue ? 'Yes' : 'No';
    return this.translateService.instant('labels.buttons.' + result);
  }

  private coerceBoolean(value: any): boolean {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'number') {
      return value !== 0;
    }
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (normalized === 'true' || normalized === '1' || normalized === 'yes') {
        return true;
      }
      if (normalized === 'false' || normalized === '0' || normalized === 'no') {
        return false;
      }
    }
    return Boolean(value);
  }
}
