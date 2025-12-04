import { Injectable, inject } from '@angular/core';
import { Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { SystemService } from 'app/system/system.service';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShareProductDatatableResolver {
  private systemService = inject(SystemService);

  /**
   * Returns the loan product data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const productId = route.parent.parent.paramMap.get('productId');
    const datatableName = route.paramMap.get('datatableName');
    return this.systemService.getEntityDatatable(productId, datatableName);
  }
}
