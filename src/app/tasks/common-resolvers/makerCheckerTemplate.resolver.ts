/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { MakerCheckerOr4EyeFunctionalityService } from '@fineract/client';

/**
 * Maker Checker Template resolver.
 */
@Injectable()
export class MakerCheckerTemplate {
  /**
   * @param {MakerCheckerOr4EyeFunctionalityService} makerCheckerService Maker Checker service.
   */
  constructor(private makerCheckerService: MakerCheckerOr4EyeFunctionalityService) {}

  /**
   * Returns the maker checker template data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.makerCheckerService.retrieveCommands();
  }
}
