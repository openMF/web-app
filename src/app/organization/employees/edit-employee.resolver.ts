/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { OrganizationService } from '../organization.service';

/**
 * Employees data resolver.
 */
@Injectable()
export class EditEmployeeResolver {
  private organizationService = inject(OrganizationService);

  /**
   * Returns the employees data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const employeeId = route.paramMap.get('id');
    return this.organizationService.getEmployee(employeeId);
  }
}
