/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

import { TaxComponentsService } from '@fineract/client';

/**
 * Manage Tax Component data resolver.
 */
@Injectable()
export class ManageTaxComponentsResolver {
  constructor(private taxComponentsService: TaxComponentsService) {}

  /**
   * Returns the tax components data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.taxComponentsService.retrieveAllTaxComponents();
  }
}
