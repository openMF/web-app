/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SystemService } from 'app/system/system.service';

/**
 * Offices data resolver.
 */
@Injectable()
export class ExternalAssetConfigurationResolver {
  private systemService = inject(SystemService);

  /**
   * Returns the offices data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.systemService.getConfigurationByName(SystemService.CONFIG_ASSET_EXTERNALIZATION);
  }
}
