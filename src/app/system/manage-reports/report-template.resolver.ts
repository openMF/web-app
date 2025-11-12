/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ReportsService } from '@fineract/client';

/**
 * Report Template data resolver.
 */
@Injectable()
export class ReportTemplateResolver {
  /**
   * @param {ReportsService} reportsService Reports service.
   */
  constructor(private reportsService: ReportsService) {}

  /**
   * Returns the Report Template data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.reportsService.retrieveOfficeTemplate();
  }
}
