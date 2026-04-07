/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

import { SavingsProductService } from '@fineract/client';

@Injectable()
export class SavingProductsTemplateResolver {
  constructor(private savingsProductService: SavingsProductService) {}

  /**
   * Returns the saving products template data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.savingsProductService.retrieveTemplate20();
  }
}
