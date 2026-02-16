/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

import { ChargesService } from '@fineract/client';

/**
 * Charges template data resolver.
 */
@Injectable()
export class ChargesTemplateResolver {
  constructor(private chargesService: ChargesService) {}

  /**
   * Returns the charges template data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.chargesService.retrieveNewChargeDetails();
  }
}
