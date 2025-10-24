/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from '../../products.service';

/**
 * Delinquency Range Component data resolver.
 */
@Injectable()
export class DelinquencyRangeComponentsResolver {
  private productsService = inject(ProductsService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  /**
   * @param {ProductsService} productsService Products service.
   */
  constructor() {}

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
