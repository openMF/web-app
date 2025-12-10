/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from '../products.service';

/**
 * tax Component data resolver.
 */
@Injectable()
export class TaxComponentResolver {
  private productsService = inject(ProductsService);

  /**
   * Returns the tax Component data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const taxComponentId = route.paramMap.get('id');
    return this.productsService.getTaxComponent(taxComponentId);
  }
}
