/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from '../products.service';

/**
 * Floating Rates data resolver.
 */
@Injectable()
export class FloatingRatesResolver {
  private productsService = inject(ProductsService);

  /**
   * Returns the floating rates data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.productsService.getFloatingRates();
  }
}
