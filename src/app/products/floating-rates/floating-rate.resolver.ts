/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

import { FloatingRatesService } from '@fineract/client';

/**
 * Floating Rate data resolver.
 */
@Injectable()
export class FloatingRateResolver {
  constructor(private floatingRatesService: FloatingRatesService) {}

  /**
   * Returns the floating rate data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const floatingRateId = route.paramMap.get('id');
    return this.floatingRatesService.retrieveOne13({ floatingRateId: +floatingRateId });
  }
}
