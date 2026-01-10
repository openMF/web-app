/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { OrganizationService } from '../organization.service';

/**
 * Working Days data resolver.
 */
@Injectable()
export class WorkingDaysResolver {
  private organizationService = inject(OrganizationService);

  /**
   * Returns the working days data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.organizationService.getWorkingDays();
  }
}
