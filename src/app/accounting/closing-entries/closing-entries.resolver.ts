/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { AccountingClosureService } from '@fineract/client';

/**
 * Closing entries data resolver.
 */
@Injectable()
export class ClosingEntriesResolver {
  /**
   * @param {AccountingClosureService} accountingClosureService Accounting closure service.
   */
  constructor(private accountingClosureService: AccountingClosureService) {}

  /**
   * Returns the gl account closures data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.accountingClosureService.retrieveAllClosures();
  }
}
