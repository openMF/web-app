/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from '../../products.service';

/**
 * View product mix data resolver.
 */
@Injectable()
export class ViewProductMixResolver {
  private productsService = inject(ProductsService);

  /**
   * Returns the product mix.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const id = route.paramMap.get('id');
    return this.productsService.getProductMix(id);
  }
}
