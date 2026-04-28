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
 * Breaches data resolver.
 */
@Injectable()
export class BreachResolver {
  private productsService = inject(ProductsService);

  /**
   * Returns the Breaches data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const breachId = route.parent.paramMap.get('id');
    return this.productsService.getWorkingCapitalBreach(breachId);
  }
}
