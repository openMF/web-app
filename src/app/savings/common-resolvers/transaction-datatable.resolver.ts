// Angular Imports
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

// rxjs Imports
import { Observable } from 'rxjs';

// Custom Service
import { DataTablesService } from '@fineract/client';

@Injectable()
export class TransactionDatatableResolver {
  /**
   *
   * @param {DataTablesService} dataTablesService
   */
  constructor(private dataTablesService: DataTablesService) {}
  /**
   * Returns the Transactions Account's Datatable data.
   * @returns {Observable<any>}
   */

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const accountId = route.parent.parent.paramMap.get('id');
    const datatableName = route.paramMap.get('datatableName');
    return this.dataTablesService.getDatatables({
      apptable: datatableName
    });
  }
}
