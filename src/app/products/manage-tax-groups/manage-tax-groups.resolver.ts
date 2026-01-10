/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from '../products.service';

/**
 * Manage Tax Groups data resolver.
 */
@Injectable()
export class ManageTaxGroupsResolver {
  private productsService = inject(ProductsService);

  /**
   * Returns the tax groups data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.productsService.getTaxGroups();
  }
}
