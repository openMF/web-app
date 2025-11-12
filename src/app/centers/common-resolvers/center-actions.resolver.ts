/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { GroupsService, CentersService, CalendarService, RunReportsService } from '@fineract/client';

/**
 * Group Actions data resolver.
 */
@Injectable()
export class CenterActionsResolver {
  /**
   * @param {GroupsService} groupsService Groups Service
   * @param {CentersService} centersService Centers Service
   * @param {CalendarService} calendarService Calendar Service
   * @param {RunReportsService} runReportsService Run Reports Service
   */
  constructor(
    private groupsService: GroupsService,
    private centersService: CentersService,
    private calendarService: CalendarService,
    private runReportsService: RunReportsService
  ) {}

  /**
   * Returns the Centers account actions data.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const actionName = route.paramMap.get('action');
    const centerId = route.paramMap.get('centerId') || route.parent.parent.paramMap.get('centerId');
    switch (actionName) {
      case 'Assign Staff':
        return this.groupsService.delete11({ groupId: Number(centerId) });
      case 'Attendance':
        return this.centersService.retrieveOne14({
          centerId: Number(centerId)
        });
      case 'Manage Groups':
        return this.centersService.retrieveOne14({
          centerId: Number(centerId),
          staffInSelectedOfficeOnly: true
        });
      case 'Attach Meeting':
        return this.calendarService.retrieveNewCalendarDetails({ entityType: 'centers', entityId: Number(centerId) });
      case 'Edit Meeting':
      case 'Edit Meeting Schedule':
        const calendarId = route.queryParamMap.get('calendarId');
        return this.calendarService.retrieveCalendar({
          calendarId: Number(calendarId),
          entityType: 'center',
          entityId: Number(centerId)
        });
      case 'Staff Assignment History':
        return this.runReportsService.runReport({
          reportName: 'Staff Assignment History'
        });
      default:
        return undefined;
    }
  }
}
