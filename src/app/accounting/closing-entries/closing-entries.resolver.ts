/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { AccountingService } from '../accounting.service';

/**
 * Closing entries data resolver.
 */
@Injectable()
export class ClosingEntriesResolver {
  private accountingService = inject(AccountingService);

  /**
   * Returns the gl account closures data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.accountingService.getAccountingClosures();
  }
}
