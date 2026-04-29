// Angular Imports
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

// rxjs Imports
import { Observable } from 'rxjs';

// Custom Service
import { DataTablesService } from '@fineract/client';

@Injectable()
export class TransactionDatatablesResolver {
  /**
   *
   * @param datatablesService DataTables Service
   */
  constructor(private dataTablesService: DataTablesService) {}
  /**
   *
   * @param route
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    return this.dataTablesService.getDatatables();
  }
}
