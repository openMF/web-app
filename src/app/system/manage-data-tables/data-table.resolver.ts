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

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SystemService } from '../system.service';

/**
 * Data Table data resolver.
 */
@Injectable()
export class DataTableResolver {
  private systemService = inject(SystemService);

  /**
   * Returns the Data Table data.
   * TODO: Delete the extra column to avoid multiple usages of `this.columnsData.shift()`.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const dataTableName = route.paramMap.get('datatableName');
    return this.systemService.getDataTable(dataTableName);
  }
}
