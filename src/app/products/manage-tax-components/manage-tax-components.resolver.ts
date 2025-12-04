/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from '../products.service';

/**
 * Manage Tax Component data resolver.
 */
@Injectable()
export class ManageTaxComponentsResolver {
  private productsService = inject(ProductsService);

  /**
   * Returns the tax components data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.productsService.getTaxComponents();
  }
}
