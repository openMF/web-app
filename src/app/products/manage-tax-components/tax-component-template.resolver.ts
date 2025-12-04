/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from '../products.service';

/**
 * Tax Component template data resolver.
 */
@Injectable()
export class TaxComponentTemplateResolver {
  private productsService = inject(ProductsService);

  /**
   * Returns the tax components template data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.productsService.getTaxComponentTemplate();
  }
}
