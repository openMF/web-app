/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { StaffService } from '@fineract/client';

/**
 * Employee data resolver.
 */
@Injectable()
export class EmployeeResolver {
  /**
   * @param {StaffService} staffService Staff service.
   */
  constructor(private staffService: StaffService) {}

  /**
   * Returns the employee data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const employeeId = route.paramMap.get('id');
    return this.staffService.retrieveAll16({ officeId: employeeId ? Number(employeeId) : undefined });
  }
}
