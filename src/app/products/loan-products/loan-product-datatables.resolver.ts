import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { SystemService } from 'app/system/system.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoanProductDatatablesResolver {
  private systemService = inject(SystemService);

  /**
   * Returns the loan product data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    return this.systemService.getEntityDatatables('m_product_loan');
  }
}
