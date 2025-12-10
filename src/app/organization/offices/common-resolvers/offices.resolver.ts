/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { OrganizationService } from '../../organization.service';

/**
 * Manage Offices data resolver.
 */
@Injectable()
export class OfficesResolver {
  private organizationService = inject(OrganizationService);

  /**
   * Returns the offices data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.organizationService.getOffices();
  }
}
