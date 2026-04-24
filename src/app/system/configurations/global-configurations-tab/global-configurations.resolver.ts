/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { GlobalConfigurationService } from '@fineract/client';

/**
 * Configurations data resolver.
 */
@Injectable()
export class GlobalConfigurationsResolver {
  /**
   * @param {GlobalConfigurationService} globalConfigurationService Global Configuration Service.
   */
  constructor(private globalConfigurationService: GlobalConfigurationService) {}

  /**
   * Returns the configurations data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.globalConfigurationService.retrieveConfiguration();
  }
}
