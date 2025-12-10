/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SystemService } from '../../system.service';

/**
 * Hook data resolver.
 */
@Injectable()
export class HookResolver {
  private systemService = inject(SystemService);

  /**
   * Returns the manage hooks data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const hookId = route.paramMap.get('id');
    return this.systemService.getHook(hookId);
  }
}
