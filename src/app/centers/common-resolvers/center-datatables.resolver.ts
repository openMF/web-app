/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { DataTablesService } from '@fineract/client';

/**
 * Center datatables resolver.
 */
@Injectable()
export class CenterDatatablesResolver {
  /**
   * @param {DataTablesService} dataTablesService DataTables service.
   */
  constructor(private dataTablesService: DataTablesService) {}

  /**
   * Returns the Center datatables data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.dataTablesService.getDatatables({ apptable: 'm_center' });
  }
}
