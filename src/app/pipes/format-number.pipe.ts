/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DecimalPipe } from '@angular/common';
import { Pipe, PipeTransform, inject } from '@angular/core';
import { SettingsService } from 'app/settings/settings.service';

@Pipe({ name: 'formatNumber' })
export class FormatNumberPipe implements PipeTransform {
  private decimalFormat = inject(DecimalPipe);
  private settingsService = inject(SettingsService);

  transform(value: string | number, defaultValue: any): string {
    if (value === undefined) {
      return defaultValue ? defaultValue : '';
    }
    const decimals = this.settingsService.decimals;
    const format = `1.${decimals}-${decimals}`;
    return this.decimalFormat.transform(value, format);
  }
}
