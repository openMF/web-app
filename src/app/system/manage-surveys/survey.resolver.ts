/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SpmSurveysService } from '@fineract/client';

/**
 * System data resolver.
 */
@Injectable()
export class SurveyResolver {
  /**
   * @param { SpmSurveysService } surveyService Survey service.
   */
  constructor(private spmSurveysService: SpmSurveysService) {}

  /**
   * Returns the Survey data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const surveyId = route.paramMap.get('id');
    return this.spmSurveysService.fetchAllSurveys1({ isActive: surveyId === 'active' });
  }
}
