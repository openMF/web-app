/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class ConditionLabelService {
  private translateService = inject(TranslateService);

  getConditionLabel(value: string): string {
    switch (value?.toLowerCase()) {
      case 'lessthan':
        return this.translateService.instant('labels.conditions.LessThan');

      case 'equal':
        return this.translateService.instant('labels.conditions.Equal');

      case 'greterthan':
        return this.translateService.instant('labels.conditions.GreaterThan');

      case 'notequal':
      case 'not_equal':
        return this.translateService.instant('labels.conditions.NotEqual');

      default:
        return value;
    }
  }
}
