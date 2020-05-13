/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable} from 'rxjs';

/** Custom Services */
import { SystemService } from '../system.service';

/**
 * Edit Scheduler Job data resolver.
 */
@Injectable()
export class ManageSchedulerJobResolver implements Resolve<Object> {

  /**
   * @param {SystemService} systemService System service.
   */
  constructor(private systemService: SystemService) {}

  /**
   * Returns the edit scheduler jobs data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const jobId = route.paramMap.get('id');
    return this.systemService.getSelectedJob(jobId);
  }

}
