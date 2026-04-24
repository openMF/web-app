/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable, forkJoin } from 'rxjs';

/** Custom Services */
import { SCHEDULERJOBService } from '@fineract/client';

/**
 * View History Scheduler Jobs data resolver.
 */
@Injectable()
export class ViewHistorySchedulerJobsResolver {
  /**
   * @param {SCHEDULERJOBService} schedulerJobService Scheduler Job Service.
   */
  constructor(private schedulerJobService: SCHEDULERJOBService) {}

  /**
   * Returns the Scheduler Jobs History data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const jobId = route.paramMap.get('id');
    return this.schedulerJobService.retrieveHistory({ jobId: Number(jobId) });
  }
}
