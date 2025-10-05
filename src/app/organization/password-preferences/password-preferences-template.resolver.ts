/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { PasswordPreferencesService } from '@fineract/client';

/**
 * Password Preferences Template data resolver.
 */
@Injectable()
export class PasswordPreferencesTemplateResolver {
  /**
   * @param {PasswordPreferencesService} passwordPreferencesService Password Preferences service.
   */
  constructor(private passwordPreferencesService: PasswordPreferencesService) {}

  /**
   * Returns the password preferences template data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.passwordPreferencesService.template21();
  }
}
