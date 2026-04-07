/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, Input } from '@angular/core';
import {
  MatCardHeader,
  MatCardTitleGroup,
  MatCardTitle,
  MatCardSubtitle,
  MatCardContent
} from '@angular/material/card';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatTooltip } from '@angular/material/tooltip';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { YesnoPipe } from '../../pipes/yesno.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-staff-navigation',
  templateUrl: './staff-navigation.component.html',
  styleUrls: ['./staff-navigation.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCardHeader,
    FaIconComponent,
    MatCardTitleGroup,
    MatCardTitle,
    MatTooltip,
    MatCardSubtitle,
    DateFormatPipe,
    YesnoPipe
  ]
})
export class StaffNavigationComponent {
  @Input() employeeData: any;
  @Input() centerData: any;

  constructor() {}
}
