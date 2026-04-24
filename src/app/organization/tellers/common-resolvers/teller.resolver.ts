/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { TellerCashManagementService } from '@fineract/client';

/**
 * Teller data resolver.
 */
@Injectable()
export class TellerResolver {
  /**
   * @param {TellerCashManagementService} tellerCashManagementService Teller Cash Management service.
   */
  constructor(private tellerCashManagementService: TellerCashManagementService) {}

  /**
   * Returns the teller data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const tellerId = route.paramMap.get('id');
    return this.tellerCashManagementService.getTellerData({ officeId: Number(tellerId) });
  }
}
