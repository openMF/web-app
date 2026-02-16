/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

import { FloatingRatesService } from '@fineract/client';

/**
 * Floating Rates data resolver.
 */
@Injectable()
export class FloatingRatesResolver {
  constructor(private floatingRatesService: FloatingRatesService) {}

  /**
   * Returns the floating rates data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.floatingRatesService.retrieveAll22();
  }
}
