/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { AccountNumberFormatService } from '@fineract/client';

/**
 * Account Number Preference data resolver.
 */
@Injectable()
export class AccountNumberPreferenceResolver {
  /**
   * @param {AccountNumberFormatService} accountNumberFormatService Account Number Format service.
   */
  constructor(private accountNumberFormatService: AccountNumberFormatService) {}

  /**
   * Returns the Account Number Preference data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const accountNumberPreferenceId = route.paramMap.get('id');
    return this.accountNumberFormatService.retrieveOne({
      accountNumberFormatId: Number(accountNumberPreferenceId)
    });
  }
}
