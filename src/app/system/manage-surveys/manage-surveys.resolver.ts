/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SurveyService } from '@fineract/client';

/**
 * Surveys data resolver.
 */
@Injectable()
export class ManageSurveysResolver {
  /**
   * @param {SurveyService} surveyService Survey service.
   */
  constructor(private surveyService: SurveyService) {}

  /**
   * Returns the Surveys data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.surveyService.retrieveSurveys();
  }
}
