/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { FixedDepositsService } from '../fixed-deposits.service';

/**
 * Fixed Deposits Account Template resolver.
 */
@Injectable()
export class FixedDepositsAccountTemplateResolver {
  private fixedDepositsService = inject(FixedDepositsService);

  /**
   * Returns the Fixed Deposits Account Template.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const clientId = route.parent.parent.paramMap.get('clientId');
    return this.fixedDepositsService.getFixedDepositsAccountTemplate(clientId);
  }
}
