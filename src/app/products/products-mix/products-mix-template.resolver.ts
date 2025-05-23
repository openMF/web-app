/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from '../products.service';

/**
 * Products mix template data resolver.
 */
@Injectable()
export class ProductsMixTemplateResolver {
  /**
   * @param {ProductsService} productsService Products service.
   */
  constructor(private productsService: ProductsService) {}

  /**
   * Returns the products mix template data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.productsService.getProductsMixTemplate();
  }
}
