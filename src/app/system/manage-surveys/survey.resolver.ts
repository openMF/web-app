/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SystemService } from '../system.service';

/**
 * System data resolver.
 */
@Injectable()
export class SurveyResolver {
  private systemService = inject(SystemService);

  /**
   * Returns the Survey data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const surveyId = route.paramMap.get('id');
    return this.systemService.getSurvey(surveyId);
  }
}
