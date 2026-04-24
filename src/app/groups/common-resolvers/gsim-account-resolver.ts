/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { GroupsService } from '@fineract/client';

/**
 * GSIM Accounts data resolver.
 */
@Injectable()
export class GSIMAccountsResolver {
  /**
   * @param {GroupsService} groupsService Groups service.
   */
  constructor(private groupsService: GroupsService) {}

  /**
   * Returns the Group's GSIM Acccounts data.
   * @param {ActivatedRouteSnapshot} route Route Snapshot.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const groupIdParam = route.parent.paramMap.get('groupId');
    const groupId = groupIdParam ? Number(groupIdParam) : undefined;
    return this.groupsService.retrieveGsimAccounts({ groupId: groupId as number });
  }
}
