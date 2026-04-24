/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

import { ChargesService } from '@fineract/client';

/**
 * Charges data resolver.
 */
@Injectable()
export class ChargesResolver {
  constructor(private chargesService: ChargesService) {}

  /**
   * Returns the products data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.chargesService.retrieveAllCharges();
  }
}
