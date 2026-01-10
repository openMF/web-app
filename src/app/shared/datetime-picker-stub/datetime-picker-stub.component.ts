/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, Input } from '@angular/core';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/* eslint-disable @angular-eslint/component-selector */
@Component({
  selector: 'ngx-mat-datetime-picker',
  template: `
    <mat-datepicker-toggle [for]="picker"></mat-datepicker-toggle>
    <mat-datepicker #picker></mat-datepicker>
  `,
  imports: [
    ...STANDALONE_SHARED_IMPORTS
  ]
})
export class DatetimePickerStubComponent {
  @Input() enableMeridian: boolean = true;
}
