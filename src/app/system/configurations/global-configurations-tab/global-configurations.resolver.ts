/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SystemService } from '../../system.service';

/**
 * Configurations data resolver.
 */
@Injectable()
export class GlobalConfigurationsResolver {
  /**
   * @param {SystemService} systemService System service.
   */
  constructor(private systemService: SystemService) {}

  /**
   * Returns the configurations data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.systemService.getConfigurations();
  }
}
