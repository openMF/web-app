/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from '../products.service';

/**
 * Floating Rate data resolver.
 */
@Injectable()
export class FloatingRateResolver {
  private productsService = inject(ProductsService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  /**
   * @param {ProductsService} productsService Products service.
   */
  constructor() {}

  /**
   * Returns the floating rate data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const floatingRateId = route.paramMap.get('id');
    return this.productsService.getFloatingRate(floatingRateId);
  }
}
