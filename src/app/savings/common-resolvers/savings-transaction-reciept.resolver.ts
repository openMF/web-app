/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ReportsService } from 'app/reports/reports.service';

/**
 * Savings Transaction Reciept resolver.
 */
@Injectable()
export class SavingsTransactionRecieptResolver implements Resolve<Object> {

  /**
   * @param {ReportsService} reportsService Reports service.
   */
  constructor(private reportsService: ReportsService) { }

  /**
   * Returns the Savings Transaction Reciept
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const transactionId = route.paramMap.get('id');
    const data = {
      'output-type':	'PDF',
      R_transactionId:	transactionId
    };
    return this.reportsService.getPentahoRunReportData('Savings Transaction Receipt', data, 'default', 'en', 'dd MMMM yyyy');
  }

}
