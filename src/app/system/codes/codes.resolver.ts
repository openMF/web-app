/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SystemService } from '../system.service';

/**
 * Codes data resolver.
 */
@Injectable()
export class CodesResolver {
  /**
   * @param {SystemService} systemService System service.
   */
  constructor(private systemService: SystemService) {}

  /**
   * Returns the Codes data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.systemService.getCodes();
  }
}
