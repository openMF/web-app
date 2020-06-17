/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SavingsService } from '../savings.service';

/**
 * Savings Account Template resolver.
 */
@Injectable()
export class SavingsAccountTemplateResolver implements Resolve<Object> {

  /**
   * @param {savingsService} SavingsService Savings service.
   */
  constructor(private savingsService: SavingsService) { }

  /**
   * Returns the Shares Account Template.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const clientId = route.parent.parent.paramMap.get('clientId');
    return this.savingsService.getSavingsAccountTemplate(clientId);
  }

}
