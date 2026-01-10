/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SystemService } from '../../system.service';

/**
 * Configurations data resolver.
 */
@Injectable()
export class GlobalConfigurationsResolver {
  private systemService = inject(SystemService);

  /**
   * Returns the configurations data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.systemService.getConfigurations();
  }
}
