/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { OrganizationService } from 'app/organization/organization.service';

/**
 * Adhoc Query and template data resolver.
 */
@Injectable()
export class AdhocQueryAndTemplateResolver {
  private organizationService = inject(OrganizationService);

  /**
   * Returns the adhoc query and template data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const adhocQueryId = route.paramMap.get('id');
    return this.organizationService.getAdhocQueryAndTemplate(adhocQueryId);
  }
}
