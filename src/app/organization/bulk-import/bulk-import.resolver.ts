/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

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
export class BulkImportResolver implements Resolve<Object> {

   bulkImportsArray = BulkImports;

  /**
   * @param {OrganizationService} organizationService Organization service.
   */
  constructor(private organizationService: OrganizationService) {
  }

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
