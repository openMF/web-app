/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { OrganizationService } from 'app/organization/organization.service';

/**
 * Cashiers data resolver.
 */
@Injectable()
export class CashiersResolver {
  private organizationService = inject(OrganizationService);

  /**
   * Returns the cashiers data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const tellerId = route.parent.paramMap.get('id');
    return this.organizationService.getCashiers(tellerId);
  }
}
