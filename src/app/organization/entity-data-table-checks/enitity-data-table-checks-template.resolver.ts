/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { OrganizationService } from '../organization.service';

/**
 * Entity Data Table Checks data resolver.
 */
@Injectable()
export class EntityDataTableChecksTemplateResolver {
  private organizationService = inject(OrganizationService);

  /**
   * Returns the Entity Data Table Checks data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.organizationService.getEntityDataTableChecksTemplate();
  }
}
