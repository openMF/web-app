/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SCHEDULERJOBService } from '@fineract/client';

/**
 * Selected Scheduler Jobs data resolver.
 */
@Injectable()
export class ViewSchedulerJobResolver {
  /**
   * @param {SCHEDULERJOBService} schedulerJobService Scheduler Job Service.
   */
  constructor(private schedulerJobService: SCHEDULERJOBService) {}

  /**
   * Returns the selected scheduler job data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const jobId = route.paramMap.get('id');
    return this.schedulerJobService.retrieveHistory({ jobId: Number(jobId) });
  }
}
