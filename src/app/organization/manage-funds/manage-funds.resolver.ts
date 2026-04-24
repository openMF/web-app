/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { FundsService } from '@fineract/client';

/**
 * Manage Funds data resolver.
 */
@Injectable()
export class ManageFundsResolver {
  /**
   * @param {FundsService} fundsService Funds service.
   */
  constructor(private fundsService: FundsService) {}

  /**
   * Returns the manage funds data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.fundsService.retrieveFunds();
  }
}
