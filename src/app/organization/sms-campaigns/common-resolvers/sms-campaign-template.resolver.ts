/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { DefaultService } from '@fineract/client';

/**
 * SMS Campaign Template resolver.
 */
@Injectable()
export class SmsCampaignTemplateResolver {
  /**
   * @param {DefaultService} defaultService Default service.
   */
  constructor(private defaultService: DefaultService) {}

  /**
   * Returns the SMS Campaign Template.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.defaultService.template2();
  }
}
