/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { SystemService } from 'app/system/system.service';

/** rxjs Imports */
import { Observable } from 'rxjs';

/**
 * Office Datatable data resolver.
 */
@Injectable()
export class OfficeDatatableResolver {
  private systemService = inject(SystemService);

  /**
   * Returns the Office's Datatable data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const officeId = route.parent.parent.paramMap.get('officeId');
    const datatableName = route.paramMap.get('datatableName');
    return this.systemService.getEntityDatatable(officeId, datatableName);
  }
}
