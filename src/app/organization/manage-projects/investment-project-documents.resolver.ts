/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SystemService } from 'app/system/system.service';

/**
 * Manage Funds data resolver.
 */
@Injectable()
export class InvestmentProjectDocumentsResolver implements Resolve<Object> {
  /**
   * @param {SystemService} systemService System service.
   */
  constructor(private systemService: SystemService) {}

  /**
   * Returns the manage funds data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const projectId = route.parent.paramMap.get('id');
    return this.systemService.getObjectDocuments('projects', projectId);
  }
}
