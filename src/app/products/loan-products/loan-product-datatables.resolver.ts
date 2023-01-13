import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { SystemService } from 'app/system/system.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoanProductDatatablesResolver implements Resolve<boolean> {

  /**
   * @param {SystemService} systemService Products service.
   */
  constructor(private systemService: SystemService) { }

  /**
   * Returns the loan product data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    return this.systemService.getEntityDatatables('m_product_loan');
  }
}
