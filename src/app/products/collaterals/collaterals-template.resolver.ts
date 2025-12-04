/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom services */
import { ProductsService } from '../products.service';

/**
 * Collaterals Template Resolver
 */
@Injectable()
export class CollateralTemplateResolver {
  private productsService = inject(ProductsService);

  /**
   * Returns the product Data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.productsService.getCollateralTemplate();
  }
}
