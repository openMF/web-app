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
 * Grouped Client Data data resolver.
 */
@Injectable()
export class GetGroupedClientsData {
  private tasksService = inject(TasksService);

  /**
   * Returns the grouped client data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.tasksService.getGroupedClientsData();
  }
}
