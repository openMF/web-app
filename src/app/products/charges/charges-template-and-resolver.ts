/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from '../products.service';

@Injectable()
export class ChargesTemplateAndResolver {
  constructor(private productsService: ProductsService) {}

  /**
   * Returns the changes template and data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const savingProductId = route.paramMap.get('id');
    return this.productsService.getCharge(savingProductId, true);
  }
}
