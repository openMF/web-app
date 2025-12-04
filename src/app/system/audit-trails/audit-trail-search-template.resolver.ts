/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SystemService } from '../system.service';

/**
 * Audit Trail Search Template data resolver.
 */
@Injectable()
export class AuditTrailSearchTemplateResolver {
  private systemService = inject(SystemService);

  /**
   * Returns the Audit Trail Search Template data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.systemService.getAuditTrailSearchTemplate();
  }
}
