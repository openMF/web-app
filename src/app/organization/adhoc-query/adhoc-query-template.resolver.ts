/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { OrganizationService } from 'app/organization/organization.service';

/**
 * Adhoc Query template data resolver.
 */
@Injectable()
export class AdhocQueryTemplateResolver {
  private organizationService = inject(OrganizationService);

  /**
   * Returns the adhoc query template data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.organizationService.getAdhocQueryTemplate();
  }
}
