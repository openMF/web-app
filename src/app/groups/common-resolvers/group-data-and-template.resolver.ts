/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { GroupsService } from '../groups.service';

/**
 * Groups data and template resolver.
 */
@Injectable()
export class GroupDataAndTemplateResolver {
  private groupsService = inject(GroupsService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  /**
   * @param {GroupsService} GroupsService Groups service.
   */
  constructor() {}

  /**
   * Returns the Groups data and template.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const groupId = route.paramMap.get('groupId');
    return this.groupsService.getGroupData(groupId, 'true');
  }
}
