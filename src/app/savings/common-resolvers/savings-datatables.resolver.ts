/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { DataTablesService } from '@fineract/client';

/**
 * Saving Accounts Datatables data resolver.
 */
@Injectable()
export class SavingsDatatablesResolver {
  /**
   * @param {DataTablesService} dataTablesService DataTables service.
   */
  constructor(private dataTablesService: DataTablesService) {}

  /**
   * Returns the Saving Account's Datatables data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.dataTablesService.getDatatables();
  }
}
