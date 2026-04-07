/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { GlobalConfigurationService } from '@fineract/client';

/**
 * Offices data resolver.
 */
@Injectable()
export class ExternalAssetConfigurationResolver {
  /**
   * @param {GlobalConfigurationService} globalConfigurationService Global configuration service.
   */
  constructor(private globalConfigurationService: GlobalConfigurationService) {}

  /**
   * Returns the offices data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.globalConfigurationService.retrieveOneByName({ name: 'CONFIG_ASSET_EXTERNALIZATION' });
  }
}
