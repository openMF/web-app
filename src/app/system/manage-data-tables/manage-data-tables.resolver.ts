/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SystemService } from '../system.service';

/**
 * Manage data tables data resolver.
 */
@Injectable()
export class ManageDataTablesResolver implements Resolve<Object> {

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
