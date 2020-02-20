/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from '../products.service';

@Injectable()
export class ChargesTemplateResolver implements Resolve<Object> {

  constructor(private productsService: ProductsService) {}

  /**
   * Returns the share products template data.
   * @returns {Observable<any>}
   */

  // resolve(): Observable<any> {
  //   return this.productsService.getChargesTemplate();
  // }

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const savingProductId = route.paramMap.get('id');
    return this.productsService.getSelectedCharge(savingProductId, true);
  }

}
