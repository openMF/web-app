import { Injectable } from '@angular/core';
import { Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { DataTablesService } from '@fineract/client';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SavingProductDatatablesResolver {
  /**
   * @param {DataTablesService} dataTablesService Data Tables service.
   */
  constructor(private dataTablesService: DataTablesService) {}

  /**
   * Returns the loan product data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    return this.dataTablesService.getDatatables({ apptable: 'm_savings_product' });
  }
}
