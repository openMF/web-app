/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from '../products.service';

/**
 * Products Mix data resolver.
 */
@Injectable()
export class ProductsMixResolver implements Resolve<Object> {

  /**
   * @param {ProductsService} productsService Products service.
   */
  constructor(private productsService: ProductsService) {}

  /**
   * Returns the products mix data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.productsService.getProductMixes();
  }

}
