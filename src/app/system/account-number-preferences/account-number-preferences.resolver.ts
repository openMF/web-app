/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { AccountNumberFormatService } from '@fineract/client';

/**
 * Account Number Preferences data resolver.
 */
@Injectable()
export class AccountNumberPreferencesResolver {
  /**
   * @param {AccountNumberFormatService} accountNumberFormatService Account Number Format service.
   */
  constructor(private accountNumberFormatService: AccountNumberFormatService) {}

  /**
   * Returns the Account Number Preferences data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.accountNumberFormatService.retrieveAll3();
  }
}
