/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { OrganizationService } from 'app/organization/organization.service';

/**
 * Adhoc Query template data resolver.
 */
@Injectable()
export class AdhocQueryTemplateResolver implements Resolve<Object> {

  /**
   * @param {OrganizationService} organizationService Organization service.
   */
  constructor(private organizationService: OrganizationService) {}

  /**
   * Returns the adhoc query template data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.organizationService.getAdhocQueryTemplate();
  }

}
