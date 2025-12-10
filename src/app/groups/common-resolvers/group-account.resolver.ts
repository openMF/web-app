/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { GroupsService } from '../groups.service';

/**
 * Group Accounts data resolver.
 */
@Injectable()
export class GroupAccountsResolver {
  private groupsService = inject(GroupsService);

  /**
   * Returns the Group's Acccounts data.
   * @param {ActivatedRouteSnapshot} route Route Snapshot.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const groupId = route.parent.paramMap.get('groupId');
    return this.groupsService.getGroupAccountsData(groupId);
  }
}
