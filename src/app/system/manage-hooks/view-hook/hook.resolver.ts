/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { HooksService } from '@fineract/client';

/**
 * Hook data resolver.
 */
@Injectable()
export class HookResolver {
  /**
   * @param {HooksService} hooksService Hooks service.
   */
  constructor(private hooksService: HooksService) {}

  /**
   * Returns the manage hooks data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const hookId = Number(route.paramMap.get('id'));
    return this.hooksService.retrieveHook({ hookId: hookId });
  }
}
