/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable, of } from 'rxjs';

/** Custom Services */
import { SystemService } from '../../system.service';
import { map, switchMap } from 'rxjs/operators';

/**
 * Configurations data resolver.
 */
@Injectable()
export class GlobalConfigurationResolver implements Resolve<Object> {

  /**
   * @param {SystemService} systemService System service.
   */
   constructor(private systemService: SystemService) {}

   /**
    * Returns the Configuration data.
    * @returns {Observable<any>}
    */
   resolve(route: ActivatedRouteSnapshot): Observable<any> {
     const configurationId = route.paramMap.get('id');
     return this.systemService.getConfiguration(configurationId).pipe(
      switchMap((config: any) => {
        if (config.codeId) {
          return this.systemService.getCodeValues(config.codeId).pipe(
            map(options => ({ ...config, options }))
          );
        }
        return of(config);
      }
     ));
   }

}
