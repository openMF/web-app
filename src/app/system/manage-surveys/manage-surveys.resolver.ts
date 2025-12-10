/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SystemService } from '../system.service';

/**
 * Surveys data resolver.
 */
@Injectable()
export class ManageSurveysResolver {
  private systemService = inject(SystemService);

  /**
   * Returns the Surveys data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.systemService.getSurveys();
  }
}
