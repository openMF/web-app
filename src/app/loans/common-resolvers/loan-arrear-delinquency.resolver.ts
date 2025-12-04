import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { SystemService } from 'app/system/system.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoanArrearDelinquencyResolver {
  private systemService = inject(SystemService);

  /**
   * Returns the loan-arrears-delinquency-display-data configuration data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    return this.systemService.getConfigurationByName('loan-arrears-delinquency-display-data');
  }
}
