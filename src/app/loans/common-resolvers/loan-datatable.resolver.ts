/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { DataTablesService } from '@fineract/client';

/**
 * Loans notes data resolver.
 */
@Injectable()
export class LoanDatatableResolver {
  /**
   * @param {DataTablesService} dataTablesService DataTables service.
   */
  constructor(private dataTablesService: DataTablesService) {}

  /**
   * Returns the Loans Notes Data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const loanId = route.paramMap.get('loanId') || route.parent.parent.paramMap.get('loanId');
    const datatableName = route.paramMap.get('datatableName');
    return this.dataTablesService.getDatatable1({
      datatable: datatableName,
      apptableId: Number(loanId)
    });
  }
}
