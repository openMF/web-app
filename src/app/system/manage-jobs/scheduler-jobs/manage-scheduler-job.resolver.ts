/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SCHEDULERJOBService } from '@fineract/client';

/**
 * Edit Scheduler Job data resolver.
 */
@Injectable()
export class ManageSchedulerJobResolver {
  /**
   * @param {SCHEDULERJOBService} schedulerJobService Scheduler Job service.
   */
  constructor(private schedulerJobService: SCHEDULERJOBService) {}

  /**
   * Returns the edit scheduler jobs data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const jobId = route.paramMap.get('id');
    return this.schedulerJobService.retrieveOne5({ jobId: Number(jobId) });
  }
}
