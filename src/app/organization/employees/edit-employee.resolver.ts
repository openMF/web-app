/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { StaffService } from '@fineract/client';

/**
 * Employees data resolver.
 */
@Injectable()
export class EditEmployeeResolver {
  /**
   * @param {StaffService} staffService Staff service.
   */
  constructor(private staffService: StaffService) {}

  /**
   * Returns the employees data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const employeeId = route.paramMap.get('id');
    return this.staffService.retrieveAll16({ officeId: employeeId ? Number(employeeId) : undefined });
  }
}
