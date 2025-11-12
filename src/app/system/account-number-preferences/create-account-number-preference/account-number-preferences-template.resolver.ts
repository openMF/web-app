/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { AccountNumberFormatService } from '@fineract/client';

/**
 * Account Number Preferences Template data resolver.
 */
@Injectable()
export class AccountNumberPreferencesTemplateResolver {
  /**
   * @param {AccountNumberFormatService} accountNumberFormatService Account Number Format service.
   */
  constructor(private accountNumberFormatService: AccountNumberFormatService) {}

  /**
   * Returns the Account Number Preferences Template data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.accountNumberFormatService.retrieveTemplate2();
  }
}
