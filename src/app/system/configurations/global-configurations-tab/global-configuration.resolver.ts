/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { GlobalConfigurationService } from '@fineract/client';

/**
 * Configurations data resolver.
 */
@Injectable()
export class GlobalConfigurationResolver {
  /**
   * @param {GlobalConfigurationService} globalConfigurationService Global Configuration Service.
   */
  constructor(private globalConfigurationService: GlobalConfigurationService) {}

  /**
   * Returns the Configuration data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const id = route.paramMap.get('id');
    return this.globalConfigurationService.retrieveConfiguration({ survey: false });
  }
}
