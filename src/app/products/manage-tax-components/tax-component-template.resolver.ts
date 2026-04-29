/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

import { TaxComponentsService } from '@fineract/client';

/**
 * Tax Component template data resolver.
 */
@Injectable()
export class TaxComponentTemplateResolver {
  constructor(private taxComponentsService: TaxComponentsService) {}

  /**
   * Returns the tax components template data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.taxComponentsService.retrieveTemplate21();
  }
}
