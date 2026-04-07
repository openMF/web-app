/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable, forkJoin } from 'rxjs';

/** Custom Services */
import { SCHEDULERJOBService, SchedulerService } from '@fineract/client';

/**
 * Manage Scheduler Jobs data resolver.
 */
@Injectable()
export class ManageSchedulerJobsResolver implements Resolve<Object> {
  /**
   * @param {SCHEDULERJOBService} schedulerJobService Scheduler Job service.
   * @param {SchedulerService} schedulerService Scheduler service.
   */
  constructor(
    private schedulerJobService: SCHEDULERJOBService,
    private schedulerService: SchedulerService
  ) {}

  /**
   * Returns the manage scheduler jobs data.
   * @returns {Observable<any>}
   */
  resolve() {
    return forkJoin([
      this.schedulerJobService.retrieveAll8(),
      this.schedulerService.retrieveStatus()
    ]);
  }
}
