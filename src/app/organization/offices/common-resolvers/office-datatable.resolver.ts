/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { DataTablesService } from '@fineract/client';

/** rxjs Imports */
import { Observable } from 'rxjs';

/**
 * Office Datatable data resolver.
 */
@Injectable()
export class OfficeDatatableResolver {
  /**
   * @param {DataTablesService} dataTablesService Data Tables service.
   */
  constructor(private dataTablesService: DataTablesService) {}

  /**
   * Returns the Office's Datatable data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const officeId = route.parent.parent.paramMap.get('officeId');
    const datatableName = route.paramMap.get('datatableName');
    const requestParams = {
      datatableName: datatableName,
      entityId: officeId
    };
    return this.dataTablesService.getDatatables({
      apptable: datatableName
    });
  }
}
