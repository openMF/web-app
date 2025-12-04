/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from '../products.service';

/**
 * Charges template data resolver.
 */
@Injectable()
export class ChargesTemplateResolver {
  private productsService = inject(ProductsService);

  /**
   * Returns the charges template data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.productsService.getChargesTemplate();
  }
}
