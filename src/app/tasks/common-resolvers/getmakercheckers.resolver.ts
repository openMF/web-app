/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { MakerCheckerOr4EyeFunctionalityService } from '@fineract/client';

/**
 * Maker Checker Data data resolver.
 */
@Injectable()
export class GetMakerCheckers {
  /**
   * @param {MakerCheckerOr4EyeFunctionalityService} makerCheckerService Maker Checker service.
   */
  constructor(private makerCheckerService: MakerCheckerOr4EyeFunctionalityService) {}

  /**
   * Returns the maker checker data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.makerCheckerService.retrieveCommands();
  }
}
