/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { GroupsService } from '@fineract/client';

/**
 * Group Actions data resolver.
 */
@Injectable()
export class GroupActionsResolver {
  /**
   * @param {GroupsService} groupsService,
   */
  constructor(
    private groupsService: GroupsService,
  ) {}

  /**
   * Returns the group actions data.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const actionName = route.paramMap.get('action');
    const groupIdStr = route.paramMap.get('groupId') || route.parent.parent.paramMap.get('groupId');
    const groupId = groupIdStr ? Number(groupIdStr) : undefined;
    switch (actionName) {
      case 'Attendance':
      case 'Manage Members':
      case 'Transfer Clients':
        return this.groupsService.retrieveOne15({ groupId });
      case 'Assign Staff':
        return this.groupsService.retrieveOne15({ groupId, staffInSelectedOfficeOnly: true });
      case 'Close':
        return this.groupsService.retrieveTemplate7({ command: 'close' });
      case 'Attach Meeting':
        return this.groupsService.retrieveOne15({ groupId });
      case 'Edit Meeting':
      case 'Edit Meeting Schedule':
        const calendarId = route.queryParamMap.get('calendarId');
        return this.groupsService.retrieveOne15({ groupId });
      default:
        return undefined;
    }
  }
}
