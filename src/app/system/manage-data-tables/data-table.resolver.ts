/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SystemService } from '../system.service';

/**
 * Data Table data resolver.
 */
@Injectable()
export class DataTableResolver implements Resolve<Object> {

  /**
   * @param {SystemService} systemService System service.
   */
  constructor(private systemService: SystemService) {}

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

