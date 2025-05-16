/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SystemService } from '../system.service';

/**
 * Manage data tables data resolver.
 */
@Injectable()
export class ManageDataTablesResolver {
  /**
   * @param {SystemService} systemService System service.
   */
  constructor(private systemService: SystemService) {}

  /**
   * Returns the manage data tables data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.systemService.getDataTables();
  }
}
