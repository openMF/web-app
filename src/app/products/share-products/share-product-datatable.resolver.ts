import { Injectable } from '@angular/core';
import { Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { DataTablesService } from '@fineract/client';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShareProductDatatableResolver {
  /**
   * @param {DataTablesService} dataTablesService Data Tables service.
   */
  constructor(private dataTablesService: DataTablesService) {}

  /**
   * Returns the loan product data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const productId = route.parent.parent.paramMap.get('productId');
    const datatableName = route.paramMap.get('datatableName');
    return this.dataTablesService.getDatatables({ apptable: datatableName ?? undefined });
  }
}
