/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { RunReportsService } from '@fineract/client';

/**
 * Centers data resolver.
 */
@Injectable()
export class CenterSummaryResolver {
  /**
   * @param {RunReportsService} runReportsService Run Reports Service.
   */
  constructor(private runReportsService: RunReportsService) {}

  /**
   * Returns the Centers Summary Data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const centerId = route.parent.paramMap.get('centerId');
    return this.runReportsService.runReport({ reportName: centerId });
  }
}
