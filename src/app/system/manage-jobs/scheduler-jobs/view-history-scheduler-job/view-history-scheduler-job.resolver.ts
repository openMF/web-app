/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable, forkJoin } from 'rxjs';

/** Custom Services */
import { SystemService } from '../../../system.service';

/**
 * View History Scheduler Jobs data resolver.
 */
@Injectable()
export class ViewHistorySchedulerJobsResolver {
  private systemService = inject(SystemService);

  /**
   * Returns the Scheduler Jobs History data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const jobId = route.paramMap.get('id');
    return this.systemService.getHistoryScheduler(jobId);
  }
}
