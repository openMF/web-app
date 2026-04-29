/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { DefaultService } from '@fineract/client';

/**
 * SMS Campaign data resolver.
 */
@Injectable()
export class SmsCampaignResolver {
  /**
   * @param {DefaultService} defaultService Default service.
   */
  constructor(private defaultService: DefaultService) {}

  /**
   * Returns the SMS Campaign data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const smsCampaignId = route.paramMap.get('id');
    // Replace with the correct parameter(s) as per RetrieveAllEmails1RequestParams definition
    return this.defaultService.retrieveAllEmails1({});
  }
}
