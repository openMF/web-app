/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { AuditsService } from '@fineract/client';

/**
 * Audit Trail Search Template data resolver.
 */
@Injectable()
export class AuditTrailSearchTemplateResolver {
  /**
   * @param {AuditsService} auditsService Audits service.
   */
  constructor(private auditsService: AuditsService) {}

  /**
   * Returns the Audit Trail Search Template data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.auditsService.retrieveAuditSearchTemplate();
  }
}
