/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { LoansService } from '../loans.service';

/**
 * Loan accounts template data resolver.
 */
@Injectable()
export class LoansAccountTemplateResolver {
  private loansService = inject(LoansService);

  /**
   * Returns the loan account template data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const entityId = route.parent.parent.paramMap.get('clientId') || route.parent.parent.paramMap.get('groupId');
    const isGroup = route.parent.parent.paramMap.get('groupId') ? true : false;
    return this.loansService.getLoansAccountTemplateResource(entityId, isGroup);
  }
}
