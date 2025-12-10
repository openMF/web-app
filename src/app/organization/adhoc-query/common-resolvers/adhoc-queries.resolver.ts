/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { OrganizationService } from '../../organization.service';

/**
 * Adhoc Queries data resolver.
 */
@Injectable()
export class AdhocQueriesResolver {
  private organizationService = inject(OrganizationService);

  /**
   * Returns the adhoc queries data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.organizationService.getAdhocQueries();
  }
}
