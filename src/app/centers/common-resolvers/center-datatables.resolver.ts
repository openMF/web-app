/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { DataTablesService } from '@fineract/client';

/**
 * center datatables resolver.
 */
@Injectable()
export class CenterDatatablesResolver {
  /**
   * @param {DataTablesService} dataTablesService Data Tables Service.
   */
  constructor(private dataTablesService: DataTablesService) {}

  /**
   * Returns the center datatables.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.dataTablesService.getDatatables();
  }
}
