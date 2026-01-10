/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { YesnoPipe } from '../../../pipes/yesno.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * View Employee Component.
 */
@Component({
  selector: 'mifosx-view-employee',
  templateUrl: './view-employee.component.html',
  styleUrls: ['./view-employee.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    DateFormatPipe,
    YesnoPipe
  ]
})
export class ViewEmployeeComponent {
  private route = inject(ActivatedRoute);

  /** Employee data. */
  employeeData: any;

  /**
   * Retrieves the employee data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor() {
    this.route.data.subscribe((data: { employee: any }) => {
      this.employeeData = data.employee;
    });
  }
}
