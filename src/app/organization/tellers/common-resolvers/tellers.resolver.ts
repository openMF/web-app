/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { OrganizationService } from '../../organization.service';

/**
 * Tellers data resolver.
 */
@Injectable()
export class TellersResolver {
  private organizationService = inject(OrganizationService);

  /**
   * Returns the Tellers data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.organizationService.getTellers();
  }
}
