/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { OrganizationService } from 'app/organization/organization.service';

/**
 * Adhoc Query data resolver.
 */
@Injectable()
export class AdhocQueryResolver {
  private organizationService = inject(OrganizationService);

  /**
   * Returns the adhoc query data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const adhocQueryId = route.paramMap.get('id');
    return this.organizationService.getAdhocQuery(adhocQueryId);
  }
}
