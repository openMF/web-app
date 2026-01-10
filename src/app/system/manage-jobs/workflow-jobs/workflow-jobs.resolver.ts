/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { SystemService } from 'app/system/system.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkflowJobResolver {
  /**
   * @param {SystemService} systemService System service.
   */
  // eslint-disable-next-line @angular-eslint/prefer-inject
  constructor(private systemService: SystemService) {}

  /**
   * Returns the Configuration data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    return this.systemService.getWorkflowJobNames();
  }
}
