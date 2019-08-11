/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from '../products.service';

@Injectable()
export class FixedDepositProductsTemplateResolver implements Resolve<Object> {

  constructor(private productsService: ProductsService) {}

  /**
   * Returns the fixed deposit products template data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.productsService.getFixedDepositProductsTemplate();
  }

}
