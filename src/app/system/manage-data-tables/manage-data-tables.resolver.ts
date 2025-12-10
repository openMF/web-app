/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SystemService } from '../system.service';

/**
 * Manage data tables data resolver.
 */
@Injectable()
export class ManageDataTablesResolver {
  private systemService = inject(SystemService);

  /**
   * Returns the manage data tables data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.systemService.getDataTables();
  }
}
