/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { WorkingDaysService } from '@fineract/client';

/**
 * Working Days data resolver.
 */
@Injectable()
export class WorkingDaysResolver {
  /**
   * @param {WorkingDaysService} workingDaysService Working days service.
   */
  constructor(private workingDaysService: WorkingDaysService) {}

  /**
   * Returns the working days data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.workingDaysService.retrieveAll17();
  }
}
