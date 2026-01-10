/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SystemService } from '../../../system.service';

/**
 * Selected Scheduler Jobs data resolver.
 */
@Injectable()
export class ViewSchedulerJobResolver {
  private systemService = inject(SystemService);

  /**
   * Returns the selected scheduler job data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const jobId = route.paramMap.get('id');
    return this.systemService.getSelectedJob(jobId);
  }
}
