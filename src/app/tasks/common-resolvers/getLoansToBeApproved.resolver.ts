/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { TasksService } from '../tasks.service';

/**
 * Loans data resolver.
 */
@Injectable()
export class GetLoansToBeApproved {
  private tasksService = inject(TasksService);

  /**
   * Returns all the loans data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.tasksService.getAllLoansToBeApproved();
  }
}
