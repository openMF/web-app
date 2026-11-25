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
import { map, Observable } from 'rxjs';

/** Custom Services */
import { CheckerInboxCountService } from '../checker-inbox-count.service';
import type { MakerCheckerRecord } from '../checker-inbox-and-tasks-tabs/checker-inbox/checker-inbox-audit';
import { TasksService } from '../tasks.service';

/**
 * Maker Checker Data data resolver.
 */
@Injectable()
export class GetMakerCheckers {
  private counts = inject(CheckerInboxCountService);
  private tasksService = inject(TasksService);

  /**
   * Returns the maker checker data.
   * @returns {Observable<{scope: string; rows: MakerCheckerRecord[]}>}
   */
  resolve(): Observable<{ scope: string; rows: MakerCheckerRecord[] }> {
    const scope = this.counts.scope();
    return this.tasksService.getMakerCheckerData().pipe(map((rows) => ({ scope, rows })));
  }
}
