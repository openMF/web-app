/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SystemService } from '../system.service';

/**
 * System data resolver.
 */
@Injectable()
export class SurveyResolver implements Resolve<Object> {

  /**
   * @param {SystemService} systemService System service.
   */
  constructor(private systemService: SystemService) {}

  /**
   * Returns the Survey data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const surveyId = route.paramMap.get('id');
    return this.systemService.getSurvey(surveyId);
  }

}
