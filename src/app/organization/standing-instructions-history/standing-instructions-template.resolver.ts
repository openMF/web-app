/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { StandingInstructionsService } from '@fineract/client';

/**
 * Standing Instructions Template resolver.
 */
@Injectable()
export class StandingInstructionsTemplateResolver {
  /**
   * @param {StandingInstructionsService} standingInstructionsService Standing Instructions service.
   */
  constructor(private standingInstructionsService: StandingInstructionsService) {}

  /**
   * Returns the Standing Instruction template.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.standingInstructionsService.template6();
  }
}
