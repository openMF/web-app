/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from '../products.service';

/**
 * Floating Rates data resolver.
 */
@Injectable()
export class FloatingRatesResolver {
  /**
   * @param {ProductsService} productsService Products service.
   */
  constructor(private productsService: ProductsService) {}

  /**
   * Returns the floating rates data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.productsService.getFloatingRates();
  }
}
