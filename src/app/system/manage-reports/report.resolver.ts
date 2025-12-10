/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SystemService } from '../system.service';

/**
 * Report data resolver.
 */
@Injectable()
export class ReportResolver {
  private systemService = inject(SystemService);

  /**
   * Returns the Report data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const reportId = route.paramMap.get('id');
    return this.systemService.getReport(reportId);
  }
}
