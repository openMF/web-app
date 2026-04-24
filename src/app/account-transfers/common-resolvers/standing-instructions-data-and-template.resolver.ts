/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { StandingInstructionsService } from '@fineract/client';

/**
 * View Standing Instructions resolver.
 */
@Injectable()
export class StandingInstructionsDataAndTemplateResolver {
  /**
   * @param {StandingInstructionsService} StandingInstructionsService Standing Instructions service.
   */
  constructor(private standingInstructionsService: StandingInstructionsService) {}

  /**
   * Returns the Standing Instructions Data.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const standingInstructionsId = route.parent.paramMap.get('standingInstructionsId');
    return this.standingInstructionsService.retrieveOne10({
      standingInstructionId: Number(standingInstructionsId)
    });
  }
}
