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

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  /**
   * @param {ProductsService} productsService products Service
   */
  constructor() {}

  /**
   * Returns the product Data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.productsService.getCollateralTemplate();
  }
}
