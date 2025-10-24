/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from '../products.service';

@Injectable()
export class SavingProductsTemplateResolver {
  private productsService = inject(ProductsService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  /**
   * Returns the saving products template data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.productsService.getSavingProductsTemplate();
  }
}
