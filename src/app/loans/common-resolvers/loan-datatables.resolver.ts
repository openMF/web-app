/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { DataTablesService } from '@fineract/client';

/**
 * loan datatables resolver.
 */
@Injectable()
export class LoanDatatablesResolver {
  /**
   * @param {DataTablesService} dataTablesService DataTables service.
   */
  constructor(private dataTablesService: DataTablesService) {}

  /**
   * Returns the loan datatables.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.dataTablesService.getDatatables({
      apptable: 'm_loan'
    });
  }
}
