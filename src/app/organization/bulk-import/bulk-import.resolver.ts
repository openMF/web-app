/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { BulkImportService } from '@fineract/client';

/** Custom Imports */
import { BulkImports } from './view-bulk-import/bulk-imports';

/**
 * Bulk Imports data resolver.
 */
@Injectable()
export class BulkImportResolver {
  bulkImportsArray = BulkImports;

  /**
   * @param {BulkImportService} bulkImportService Bulk Import service.
   */
  constructor(private bulkImportService: BulkImportService) {}

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
    const entityType = this.getEntityName(route.params['import-name']);
    return this.bulkImportService.retrieveImportDocuments({ entityType });
  }
}
