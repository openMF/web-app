/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { GroupsService } from '@fineract/client';

/**
 * Group Notes data resolver.
 */
@Injectable()
export class GroupNotesResolver {
  /**
   * @param {GroupsService} GroupsService Groups service.
   */
  constructor(private groupsService: GroupsService) {}

  /**
   * Returns the Group's Notes data.
   * @param {ActivatedRouteSnapshot} route Route Snapshot.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const groupId = Number(route.parent.paramMap.get('groupId'));
    return this.groupsService.retrieveOne15({ groupId });
  }
}
