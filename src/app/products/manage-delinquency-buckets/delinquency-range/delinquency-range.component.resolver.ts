/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from '../../products.service';

/**
 * Delinquency Range Component data resolver.
 */
@Injectable()
export class DelinquencyRangeComponentsResolver {
  private productsService = inject(ProductsService);

  /**
   * Returns the delinquency ranges data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const delinquentcyRangeId = route.paramMap.get('rangeId');
    if (delinquentcyRangeId === null) {
      return this.productsService.getDelinquencyRanges();
    } else {
      return this.productsService.getDelinquencyRange(delinquentcyRangeId);
    }
  }
}
