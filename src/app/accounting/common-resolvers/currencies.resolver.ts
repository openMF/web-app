/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { AccountingService } from '../accounting.service';

/**
 * Currencies data resolver.
 */
@Injectable()
export class CurrenciesResolver {
  private accountingService = inject(AccountingService);

  /**
   * Returns the currencies data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.accountingService.getCurrencies();
  }
}
