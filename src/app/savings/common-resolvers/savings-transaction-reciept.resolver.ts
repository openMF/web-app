/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ReportsService } from 'app/reports/reports.service';
import { SettingsService } from 'app/settings/settings.service';

/**
 * Savings Transaction Reciept resolver.
 */
@Injectable()
export class SavingsTransactionRecieptResolver {
  private reportsService = inject(ReportsService);
  private settingsService = inject(SettingsService);

  /**
   * Returns the Savings Transaction Reciept
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const transactionId = route.paramMap.get('id');
    const data = {
      'output-type': 'PDF',
      R_transactionId: transactionId
    };
    return this.reportsService.getPentahoRunReportData(
      'Savings Transaction Receipt',
      data,
      'default',
      this.settingsService.language.code,
      this.settingsService.dateFormat
    );
  }
}
