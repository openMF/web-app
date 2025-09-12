/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { GroupsService } from '@fineract/client';

/**
 * Groups data and template resolver.
 */
@Injectable()
export class GroupDataAndTemplateResolver {
  /**
   * @param {GroupsService} GroupsService Groups service.
   */
  constructor(private groupsService: GroupsService) {}

  /**
   * Returns the Groups data and template.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const groupId = Number(route.paramMap.get('groupId'));
    return this.groupsService.retrieveOne15({ groupId: groupId });
  }
}
