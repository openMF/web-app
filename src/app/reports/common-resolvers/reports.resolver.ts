/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ReportsService } from '../reports.service';

/**
 * Reports data resolver.
 */
@Injectable()
export class ReportsResolver {
  private reportsService = inject(ReportsService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  /**
   * @param {ReportsService} reportsService Reports service.
   */
  constructor() {}

  /**
   * Returns the reports data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.reportsService.getReports();
  }
}
