/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { CodesService } from '@fineract/client';

/**
 * Codes data resolver.
 */
@Injectable()
export class CodesResolver {
  /**
   * @param {CodesService} codesService Codes service.
   */
  constructor(private codesService: CodesService) {}

  /**
   * Returns the Codes data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.codesService.retrieveCodes();
  }
}
