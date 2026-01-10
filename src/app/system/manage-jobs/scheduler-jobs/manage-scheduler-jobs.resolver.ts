/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable, forkJoin } from 'rxjs';

/** Custom Services */
import { SystemService } from '../../system.service';

/**
 * Manage Scheduler Jobs data resolver.
 */
@Injectable()
export class ManageSchedulerJobsResolver implements Resolve<Object> {
  /**
   * @param {SystemService} systemService System service.
   */
  // eslint-disable-next-line @angular-eslint/prefer-inject
  constructor(private systemService: SystemService) {}

  /**
   * Returns the manage scheduler jobs data.
   * @returns {Observable<any>}
   */
  resolve() {
    return forkJoin([
      this.systemService.getJobs(),
      this.systemService.getScheduler()
    ]);
  }
}
