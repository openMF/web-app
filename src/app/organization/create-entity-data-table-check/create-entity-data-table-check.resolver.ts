/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { OrganizationService } from '../organization.service';

/**
 *  Create Entity Data Table Check data resolver.
 */
@Injectable()
export class CreateEntityDataTableCheckResolver implements Resolve<Object> {

  /**
   * @param {OrganizationService} organizationService Organization service.
   */
  constructor(private organizationService: OrganizationService) {}

  /**
   * Returns the Create Entity Data Table Check data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.organizationService.getEntityDataTableChecks();
  }
}
