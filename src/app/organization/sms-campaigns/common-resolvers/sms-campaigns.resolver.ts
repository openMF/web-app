/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { DefaultService } from '@fineract/client';

/**
 * SMS Campaigns data resolver.
 */
@Injectable()
export class SmsCampaignsResolver {
  /**
   * @param {DefaultService} defaultService Default service.
   */
  constructor(private defaultService: DefaultService) {}

  /**
   * Returns the SMS Campaigns data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.defaultService.retrieveAllEmails1();
  }
}
