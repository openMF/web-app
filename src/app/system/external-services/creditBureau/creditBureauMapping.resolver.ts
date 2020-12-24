/** Angular Imports */
import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, Resolve} from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SystemService } from '../../system.service';

/**
 * CreditBureau LoanProduct Mapping Resolver data resolver.
 */
@Injectable()
export class CreditBureauMappingResolver implements Resolve<Object> {

  loanProductId: any;
  /**
   * @param {SystemService} systemService System service.
   */
  constructor(private systemService: SystemService) {}

  /**
   * Returns the All Credit Bureau - Loan Mapping Data
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    return this.systemService.getCreditBureauAllMappings();
  }

}
