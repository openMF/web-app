/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { ProductsService } from 'app/products/products.service';
import { Observable } from 'rxjs';

/**
 * Near Breaches data resolver.
 */
@Injectable()
export class NearBreachResolver {
  private productsService = inject(ProductsService);

  /**
   * Returns the Near Breach data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const nearBreachId = route.parent?.paramMap.get('id');
    if (nearBreachId) {
      return this.productsService.getWorkingCapitalNearBreach(nearBreachId);
    }
    throw new Error('Near Breach ID is required to fetch the breach data.');
  }
}
