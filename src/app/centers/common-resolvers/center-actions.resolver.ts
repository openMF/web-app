/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable, of } from 'rxjs';

/** Custom Services */
import { CentersService, CalendarService, RunReportsService } from '@fineract/client';
import { CentersService as CustomCentersService } from 'app/customApis.service';

/**
 * Center actions resolver.
 */
@Injectable()
export class CenterActionsResolver {
  /**
   * @param {CentersService} centersService Centers service.
   * @param {CalendarService} calendarService Calendar service.
   * @param {RunReportsService} runReportsService RunReports service.
   * @param {HttpClient} http HttpClient.
   */
  constructor(
    private centersService: CentersService,
    private calendarService: CalendarService,
    private runReportsService: RunReportsService,
    private customCentersService: CustomCentersService
  ) {}

  /**
   * Returns the Center actions data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const actionName = route.paramMap.get('name');
    const centerId = parseInt(route.parent.paramMap.get('centerId'), 10);
    const calendarId = parseInt(route.queryParamMap.get('calendarId'), 10);

    switch (actionName) {
      case 'Assign Staff':
        return this.centersService.retrieveOne14({
          centerId,
          staffInSelectedOfficeOnly: true,
          template: 'true',
          groupOrCenter: 'centers'
        } as any);
      case 'Attendance':
        return this.centersService.retrieveOne14({
          centerId,
          associations: 'groupMembers,collectionMeetingCalendar'
        } as any);
      case 'Manage Groups':
        return this.centersService.retrieveOne14({ centerId, associations: 'groupMembers', template: 'true' } as any);
      case 'Attach Meeting':
        return this.customCentersService.getCalendarTemplate(centerId);
      case 'Edit Meeting':
        return this.calendarService.retrieveCalendar({
          calendarId,
          entityType: 'centers',
          entityId: centerId,
          template: 'true'
        } as any);
      case 'Staff Assignment History':
        return this.runReportsService.runReport({
          reportName: 'Staff Assignment History',
          R_centerId: centerId,
          tenantIdentifier: 'default',
          locale: 'en'
        } as any);
      default:
        return of(null);
    }
  }
}
