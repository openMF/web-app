/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { CurrencyService } from '@fineract/client';

/**
 * Currencies data resolver.
 */
@Injectable()
export class CurrenciesResolver {
  /**
   * @param {CurrencyService} currencyService Currency service.
   */
  constructor(private currencyService: CurrencyService) {}

  /**
   * Returns the currencies data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.currencyService.retrieveCurrencies();
  }
}
