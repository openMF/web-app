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

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  /**
   * @param {SystemService} systemService System service.
   */
  constructor() {}

  /**
   * Returns the Audit Trail Search Template data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.systemService.getAuditTrailSearchTemplate();
  }
}
