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

  transform(value: boolean, ...args: unknown[]): string {
    if (value == null) {
      return null;
    }
    const result = value ? 'Yes' : 'No';
    return this.translateService.instant('labels.buttons.' + result);
  }
}
