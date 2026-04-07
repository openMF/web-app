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
import { GroupsService } from '../groups.service';

/**
 * Group Datatables data resolver.
 */
@Injectable()
export class GroupDatatablesResolver {
  private groupsService = inject(GroupsService);

  /**
   * Returns the Group's Datatables data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.groupsService.getGroupDatatables();
  }
}
