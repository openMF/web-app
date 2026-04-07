/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ReportsService } from '@fineract/client';

/**
 * Report data resolver.
 */
@Injectable()
export class ReportResolver {
  /**
   * @param {ReportsService} reportsService Reports service.
   */
  constructor(private reportsService: ReportsService) {}

  /**
   * Returns the Report data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const reportId = Number(route.paramMap.get('id'));
    return this.reportsService.retrieveReport({ id: reportId });
  }
}
