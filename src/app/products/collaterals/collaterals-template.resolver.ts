/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom services */
import { ProductsService } from '../products.service';

/**
 * Collaterals Template Resolver
 */
@Injectable()
export class CollateralTemplateResolver {
  /**
   * @param {ProductsService} productsService products Service
   */
  constructor(private productsService: ProductsService) {}

  /**
   * Returns the product Data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.productsService.getCollateralTemplate();
  }
}
