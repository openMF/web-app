/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { DataTablesService } from '@fineract/client';

/**
 * Centers notes data resolver.
 */
@Injectable()
export class CenterDatatableResolver {
  /**
   * @param {DataTablesService} dataTablesService Data Tables Service.
   */
  constructor(private dataTablesService: DataTablesService) {}

  /**
   * Returns the Centers Notes Data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const centerId = route.parent.parent.paramMap.get('centerId');
    const datatableName = route.paramMap.get('datatableName');
    return this.dataTablesService.getDatatables({
      apptable: datatableName ?? undefined
    });
  }
}
