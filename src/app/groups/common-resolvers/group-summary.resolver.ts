/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { RunReportsService } from 'app/customApis.service';

/**
 * Group Summary resolver.
 */
@Injectable()
export class GroupSummaryResolver {
  /**
   * @param {RunReportsService} runReportsService Groups service.
   */
  constructor(private runReportsService: RunReportsService) {}

  /**
   * Returns the Group Summary data.
   * @param {ActivatedRouteSnapshot} route Route Snapshot.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const groupId = route.parent.paramMap.get('groupId');
    return this.runReportsService.getGroupSummary(groupId);
  }
}
