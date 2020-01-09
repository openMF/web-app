/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from '../products.service';

/**
 * Charges template data resolver.
 */
@Injectable()
export class ChargesTemplateResolver implements Resolve<Object> {

  /**
   * @param {ProductsService} productsService Products service.
   */
  constructor(private productsService: ProductsService) {}

  /**
   * Returns the charges template data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.productsService.getChargesTemplate();
  }

}
