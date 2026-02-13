/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SavingsAccountService } from '@fineract/client';

/**
 * Savings Account Template resolver.
 */
@Injectable()
export class SavingsAccountTemplateResolver {
  /**
   * @param {SavingsAccountService} savingsAccountService Savings Account service.
   */
  constructor(private savingsAccountService: SavingsAccountService) {}

  /**
   * Returns the Shares Account Template.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const entityId = route.paramMap.get('clientId') || route.paramMap.get('groupId') || route.paramMap.get('centerId');
    const isGroup = route.paramMap.get('groupId') || route.paramMap.get('centerId') ? true : false;

    const clientId = route.paramMap.get('clientId');
    const groupId = route.paramMap.get('groupId') || route.paramMap.get('centerId');

    return this.savingsAccountService.template14({
      clientId: clientId ? Number(clientId) : undefined,
      groupId: groupId ? Number(groupId) : undefined,
      staffInSelectedOfficeOnly: undefined
    });
  }
}
