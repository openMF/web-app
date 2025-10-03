/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { TellerCashManagementService } from '@fineract/client';

/**
 * Tellers data resolver.
 */
@Injectable()
export class TellersResolver {
  /**
   * @param {OrganizationService} organizationService Organization service.
   */
  constructor(private tellerCashManagementService: TellerCashManagementService) {}

  /**
   * Returns the Tellers data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.tellerCashManagementService.getTellerData();
  }
}
