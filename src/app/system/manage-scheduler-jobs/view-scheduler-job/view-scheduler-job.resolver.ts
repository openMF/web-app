/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable, forkJoin } from 'rxjs';

/** Custom Services */
import { SystemService } from '../../system.service';

/**
 * Selected Scheduler Jobs data resolver.
 */
@Injectable()
export class ViewSchedulerJobResolver implements Resolve<Object> {

  /**
   * @param {SystemService} systemService System service.
   */
  constructor(private systemService: SystemService) {}

  /**
   * Returns the selected scheduler job data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const jobId = route.paramMap.get('id');
    return this.systemService.getSelectedJob(jobId);
  }

}
