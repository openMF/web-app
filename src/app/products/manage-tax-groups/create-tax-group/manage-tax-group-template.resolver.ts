/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

import { TaxGroupService } from '@fineract/client';

/**
 * Tax Group template data resolver.
 */
@Injectable()
export class ManageTaxGroupTemplateResolver {
  constructor(private taxGroupService: TaxGroupService) {}

  /**
   * Returns the tax groups template data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.taxGroupService.retrieveTemplate22();
  }
}
