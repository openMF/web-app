/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from '../../products.service';

/**
 * Delinquency Range Component data resolver.
 */
@Injectable()
export class DelinquencyRangeComponentsResolver implements Resolve<Object> {

  /**
   * @param {ProductsService} productsService Products service.
   */
  constructor(private productsService: ProductsService) {}

  /**
   * Returns the delinquency ranges data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const delinquentcyRangeId = route.paramMap.get('rangeId');
    if (delinquentcyRangeId === null) {
      return this.productsService.getDelinquencyRanges();
    } else {
      return this.productsService.getDelinquencyRange(delinquentcyRangeId);
    }
  }

}
