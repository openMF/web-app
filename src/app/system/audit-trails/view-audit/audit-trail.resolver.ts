/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { AuditsService } from '@fineract/client';

/**
 * Audit Trail data resolver.
 */
@Injectable()
export class AuditTrailResolver {
  /**
   * @param {AuditsService} auditsService Audits service.
   */
  constructor(private auditsService: AuditsService) {}

  /**
   * Returns the Audit Trail data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const auditTrailId = route.paramMap.get('id');
    return this.auditsService.retrieveAuditEntries({ resourceId: auditTrailId ? Number(auditTrailId) : undefined });
  }
}
