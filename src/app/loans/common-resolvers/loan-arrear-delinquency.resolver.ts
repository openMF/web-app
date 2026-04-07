import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { GlobalConfigurationService } from '@fineract/client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoanArrearDelinquencyResolver {
  /**
   * @param {GlobalConfigurationService} globalConfigurationService Global configuration service.
   */
  constructor(private globalConfigurationService: GlobalConfigurationService) {}

  /**
   * Returns the loan-arrears-delinquency-display-data configuration data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    return this.globalConfigurationService.retrieveOneByName({ name: 'loan-arrears-delinquency-display-data' });
  }
}
