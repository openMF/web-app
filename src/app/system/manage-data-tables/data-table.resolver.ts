/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { DataTablesService } from '@fineract/client';

/**
 * Data Table data resolver.
 */
@Injectable()
export class DataTableResolver {
  /**
   * @param {DataTablesService} dataTablesService Data Tables service.
   */
  constructor(private dataTablesService: DataTablesService) {}

  /**
   * Returns the Data Table data.
   * TODO: Delete the extra column to avoid multiple usages of `this.columnsData.shift()`.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const dataTableName = route.paramMap.get('datatableName');
    return new Observable((observer) => {
      this.dataTablesService.getDatatables().subscribe((tables: any[]) => {
        const table = tables.find(
          (t) =>
            t.registeredTableName === dataTableName ||
            t.applicationTableName === dataTableName ||
            t.datatableName === dataTableName
        );
        observer.next(table || {});
        observer.complete();
      });
    });
  }
}
