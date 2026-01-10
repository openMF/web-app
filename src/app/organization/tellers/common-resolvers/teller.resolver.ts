/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { OrganizationService } from 'app/organization/organization.service';

/**
 * Teller data resolver.
 */
@Injectable()
export class TellerResolver {
  private organizationService = inject(OrganizationService);

  /**
   * Returns the teller data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const tellerId = route.paramMap.get('id');
    return this.organizationService.getTeller(tellerId);
  }
}
