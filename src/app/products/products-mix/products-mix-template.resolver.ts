/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from '../products.service';

/**
 * Products mix template data resolver.
 */
@Injectable()
export class ProductsMixTemplateResolver {
  private productsService = inject(ProductsService);

  /**
   * Returns the products mix template data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.productsService.getProductsMixTemplate();
  }
}
