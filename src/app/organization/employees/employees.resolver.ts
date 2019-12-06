/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { OrganizationService } from '../organization.service';

/**
 * Employees data resolver.
 */
@Injectable()
export class EmployeesResolver implements Resolve<Object> {

  /**
   * @param {OrganizationService} organizationService Organization service.
   */
  constructor(private organizationService: OrganizationService) {}

  /**
   * Returns the employees data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.organizationService.getEmployees();
  }

}
