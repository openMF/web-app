/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { DataTablesService } from '@fineract/client';

/** rxjs Imports */
import { Observable } from 'rxjs';

/**
 * Office Datatables data resolver.
 */
@Injectable()
export class OfficeDatatablesResolver {
  /**
   * @param {DataTablesService} dataTablesService Data Tables service.
   */
  constructor(private dataTablesService: DataTablesService) {}

  /**
   * Returns the loan product data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    return this.dataTablesService.getDatatables({ apptable: 'm_office' });
  }
}
