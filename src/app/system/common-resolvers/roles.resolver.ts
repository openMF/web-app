/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';


/** Custom Services */
import { SystemService } from '../system.service';

/**
 * Offices data resolver.
 */
@Injectable()
export class RolesesResolver implements Resolve<Object> {

  /**
   * @param {AccountingService} accountingService Accounting service.
   */
  constructor(private systemService: SystemService) {}

  /**
   * Returns the offices data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.systemService.getRoles();
  }

}
