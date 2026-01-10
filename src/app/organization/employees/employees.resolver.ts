/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { OrganizationService } from '../organization.service';

/**
 * Employees data resolver.
 */
@Injectable()
export class EmployeesResolver {
  private organizationService = inject(OrganizationService);

  /**
   * Returns the employees data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.organizationService.getEmployees();
  }
}
