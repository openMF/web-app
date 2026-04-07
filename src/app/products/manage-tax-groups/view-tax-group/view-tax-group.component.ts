/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports. */
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * View Tax Group component.
 */
@Component({
  selector: 'mifosx-view-tax-group',
  templateUrl: './view-tax-group.component.html',
  styleUrls: ['./view-tax-group.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    DateFormatPipe
  ]
})
export class ViewTaxGroupComponent {
  private route = inject(ActivatedRoute);

  /** tax Group Data. */
  taxGroupData: any;

  /**
   * Retrieves the tax Group data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor() {
    this.route.data.subscribe((data: { taxGroup: any }) => {
      this.taxGroupData = data.taxGroup;
    });
  }
}
