/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { DataTablesService } from '@fineract/client';

/**
 * Center datatable resolver.
 */
@Injectable()
export class CenterDatatableResolver {
  /**
   * @param {DataTablesService} dataTablesService DataTables service.
   */
  constructor(private dataTablesService: DataTablesService) {}

  /**
   * Returns the Center datatable data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const datatableName = route.paramMap.get('datatableName');
    const centerId = route.parent.parent.paramMap.get('centerId');
    return this.dataTablesService.advancedQuery({
      datatable: datatableName,
      apptableId: parseInt(centerId, 10),
      genericResultSet: true
    } as any);
  }
}
