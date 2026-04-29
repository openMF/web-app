/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { AuditsService } from '@fineract/client';

/**
 * Checker Inbox Detail resolver.
 */
@Injectable()
export class GetCheckerInboxDetailResolver {
  /**
   * @param {AuditsService} auditsService Audits service.
   */
  constructor(private auditsService: AuditsService) {}

  /**
   * Returns the detail data of the checker inbox.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const checkerId = Number(route.paramMap.get('id'));
    return this.auditsService.retrieveAuditEntries({ resourceId: checkerId });
  }
}
