/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SystemService } from '../../system.service';

/**
 * Account Number Preferences Template data resolver.
 */
@Injectable()
export class AccountNumberPreferencesTemplateResolver {
  private systemService = inject(SystemService);

  /**
   * Returns the Account Number Preferences Template data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.systemService.getAccountNumberPreferencesTemplate();
  }
}
