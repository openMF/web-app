/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from '../products.service';

/**
 * Collaterals data resolver
 */
@Injectable()
export class CollateralsResolver {
  private productsService = inject(ProductsService);

  /**
   * Returns the All Collaterals Data
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.productsService.getCollaterals();
  }
}
