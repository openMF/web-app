/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SystemService } from '../system.service';

/**
 * Audit Trail Search Template data resolver.
 */
@Injectable()
export class AuditTrailSearchTemplateResolver {
  /**
   * @param {SystemService} systemService System service.
   */
  constructor(private systemService: SystemService) {}

  /**
   * Returns the Audit Trail Search Template data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.systemService.getAuditTrailSearchTemplate();
  }
}
