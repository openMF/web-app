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
import { OrganizationService } from '../organization.service';

/** Custom Imports */
import { BulkImports } from './view-bulk-import/bulk-imports';

/**
 * Bulk Imports data resolver.
 */
@Injectable()
export class BulkImportResolver {
  private organizationService = inject(OrganizationService);

  bulkImportsArray = BulkImports;

  /**
   * Gets bulk-import's entity name
   * @param importName Bulk Import Name
   */
  getEntityName(importName: string) {
    const bulkImport = this.bulkImportsArray.find((entry: any) => importName === entry.name);
    return bulkImport.entityType;
  }

  /**
   * Returns the imports data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const entity = this.getEntityName(route.params['import-name']);
    return this.organizationService.getImports(entity);
  }
}
