/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { OrganizationService } from '../organization.service';

/**
 * Advance Search Template resolver.
 */
@Injectable()
export class AdvanceSearchTemplateResolver {
  private organizationService = inject(OrganizationService);

  /**
   * Returns the Advance Search template.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.organizationService.getAdvanceSearchTemplate();
  }
}
