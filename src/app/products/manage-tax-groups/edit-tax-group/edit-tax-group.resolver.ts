/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from '../../products.service';

/**
 * tax Group data resolver.
 */
@Injectable()
export class EditTaxGroupResolver {
  private productsService = inject(ProductsService);

  /**
   * Returns the tax Group data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const taxGroupId = route.parent.paramMap.get('id');
    return this.productsService.getTaxGroup(taxGroupId, 'true');
  }
}
