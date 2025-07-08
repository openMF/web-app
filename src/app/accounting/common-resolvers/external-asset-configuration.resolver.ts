/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SystemService } from 'app/system/system.service';

/**
 * Offices data resolver.
 */
@Injectable()
export class ExternalAssetConfigurationResolver {
  /**
   * @param {AccountingService} accountingService Accounting service.
   */
  constructor(private systemService: SystemService) {}

  /**
   * Returns the offices data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.systemService.getConfigurationByName(SystemService.CONFIG_ASSET_EXTERNALIZATION);
  }
}
