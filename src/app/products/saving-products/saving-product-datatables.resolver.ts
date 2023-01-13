import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { SystemService } from 'app/system/system.service';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SavingProductDatatablesResolver implements Resolve<boolean> {

  /**
   * @param {SystemService} systemService Products service.
   */
  constructor(private systemService: SystemService) { }

  /**
   * Returns the loan product data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    return this.systemService.getEntityDatatables('m_savings_product');
  }
}
