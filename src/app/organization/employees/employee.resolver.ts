/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { OrganizationService } from 'app/organization/organization.service';

/**
 * Employee data resolver.
 */
@Injectable()
export class EmployeeResolver {
  private organizationService = inject(OrganizationService);

  /**
   * Returns the employee data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const employeeId = route.paramMap.get('id');
    return this.organizationService.getEmployee(employeeId);
  }
}
