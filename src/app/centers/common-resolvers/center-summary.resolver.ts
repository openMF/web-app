/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

/** Custom Services */
import { RunReportsService } from '@fineract/client';

/**
 * Center summary resolver.
 */
@Injectable()
export class CenterSummaryResolver {
  /**
   * @param {RunReportsService} runReportsService RunReports service.
   */
  constructor(private runReportsService: RunReportsService) {}

  /**
   * Returns the Center summary data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const centerId = route.parent.parent.paramMap.get('centerId');
    return this.runReportsService
      .runReport({ reportName: 'GroupSummaryCounts', R_groupId: centerId, genericResultSet: 'false' } as any)
      .pipe(catchError(() => of([{}])));
  }
}
