import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { BusinessStepConfigurationService } from '@fineract/client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkflowJobResolver {
  /**
   * @param {BusinessStepConfigurationService} businessStepConfigService Business step configuration service.
   */
  constructor(private businessStepConfigService: BusinessStepConfigurationService) {}

  /**
   * Returns the Configuration data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    return this.businessStepConfigService.retrieveAllConfiguredBusinessJobs();
  }
}
