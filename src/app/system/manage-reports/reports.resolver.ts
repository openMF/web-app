/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SystemService } from '../system.service';

/**
 * Reports data resolver.
 */
@Injectable()
export class ReportsResolver {
  private systemService = inject(SystemService);

  /**
   * Returns the Reports data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.systemService.getReports();
  }
}
