/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { GroupsService } from '../groups.service';

/**
 * Groups data resolver.
 */
@Injectable()
export class GroupViewResolver {
  private groupsService = inject(GroupsService);

  /**
   * Returns the Groups data.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const groupId = route.paramMap.get('groupId');
    return this.groupsService.getGroupData(groupId);
  }
}
