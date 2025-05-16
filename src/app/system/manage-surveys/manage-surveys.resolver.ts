/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SystemService } from '../system.service';

/**
 * Surveys data resolver.
 */
@Injectable()
export class ManageSurveysResolver {
  /**
   * @param {SystemService} systemService System service.
   */
  constructor(private systemService: SystemService) {}

  /**
   * Returns the Surveys data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.systemService.getSurveys();
  }
}
