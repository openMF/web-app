/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable, forkJoin } from 'rxjs';

/** Custom Services */
import { SystemService } from '../system.service';

/**
 * Manage Scheduler Jobs data resolver.
 */
@Injectable()
export class ManageSchedulerJobsResolver implements Resolve<Object> {

  /**
   * @param {SystemService} systemService System service.
   */
  constructor(private systemService: SystemService) {}

  /**
   * Returns the manage scheduler jobs data.
   * @returns {Observable<any>}
   */
  resolve() {
    return forkJoin([
      this.systemService.getJobs(),
      this.systemService.getScheduler()
    ]);
  }

}
