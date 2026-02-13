/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { GroupsService } from '@fineract/client';

/**
 * GSIM Account data resolver.
 */
@Injectable()
export class GSIMViewResolver {
  /**
   * @param {GroupsService} groupsService Groups service.
   */
  constructor(private groupsService: GroupsService) {}

  /**
   * Returns the Savings Account data.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const groupId = route.paramMap.get('groupId');
    const savingAccountId = route.paramMap.get('savingAccountId');
    return this.groupsService.retrieveGsimAccounts({
      groupId: Number(groupId),
      parentGSIMId: Number(savingAccountId)
    });
  }
}
