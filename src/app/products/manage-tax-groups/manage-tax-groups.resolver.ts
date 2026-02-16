/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

import { TaxGroupService } from '@fineract/client';

/**
 * Manage Tax Groups data resolver.
 */
@Injectable()
export class ManageTaxGroupsResolver {
  constructor(private taxGroupService: TaxGroupService) {}

  /**
   * Returns the tax groups data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.taxGroupService.retrieveAllTaxGroups();
  }
}
