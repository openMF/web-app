/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from '../products.service';

@Injectable()
export class LoanProductsTemplateResolver {
  private productsService = inject(ProductsService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  /**
   * Returns the loan products template data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.productsService.getLoanProductsTemplate();
  }
}
