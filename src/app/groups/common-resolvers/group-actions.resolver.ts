/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { GroupsService } from '../groups.service';

/**
 * Group Actions data resolver.
 */
@Injectable()
export class GroupActionsResolver implements Resolve<Object> {

  /**
   * @param {GroupsService} groupsService Groups service.
   */
  constructor(private groupsService: GroupsService) { }

  /**
   * Returns the group actions data.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const actionName = route.paramMap.get('name');
    const groupId = route.paramMap.get('groupId') || route.parent.parent.paramMap.get('groupId');
    switch (actionName) {
      case 'Attendance':
      case 'Manage Members':
      case 'Transfer Clients':
        return this.groupsService.getGroupData(groupId);
      case 'Assign Staff':
        return this.groupsService.getGroupData(groupId, 'true');
      case 'Close':
        return this.groupsService.getGroupCommandTemplate('close');
      case 'Attach Meeting':
        return this.groupsService.getGroupCalendarTemplate(groupId);
      case 'Edit Meeting':
      case 'Edit Meeting Schedule':
        const calendarId = route.queryParamMap.get('calendarId');
        return this.groupsService.getGroupCalendarAndTemplate(groupId, calendarId);
      default:
        return undefined;
    }
  }

}
