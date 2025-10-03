/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { StaffService } from '@fineract/client';

/**
 * Employees data resolver.
 */
@Injectable()
export class EmployeesResolver {
  /**
   * @param {StaffService} staffService Staff service.
   */
  constructor(private staffService: StaffService) {}

  /**
   * Returns the employees data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.staffService.retrieveAll16();
  }
}
