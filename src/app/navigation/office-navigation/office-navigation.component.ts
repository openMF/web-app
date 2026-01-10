/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, Input } from '@angular/core';
import { MatCardHeader, MatCardTitleGroup, MatCardTitle, MatCardContent } from '@angular/material/card';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { ExternalIdentifierComponent } from '../../shared/external-identifier/external-identifier.component';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-office-navigation',
  templateUrl: './office-navigation.component.html',
  styleUrls: ['./office-navigation.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCardHeader,
    FaIconComponent,
    MatCardTitleGroup,
    MatCardTitle,
    MatCardContent,
    ExternalIdentifierComponent,
    DateFormatPipe
  ]
})
export class OfficeNavigationComponent {
  @Input() officeData: any;
  @Input() employeeData: any;

  constructor() {}
}
