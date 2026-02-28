/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

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
   * For JLG loans, reads clientId and templateType from query params.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const templateType = route.queryParamMap.get('templateType');
    const jlgClientId = route.queryParamMap.get('clientId');

    if (templateType === 'jlg' && jlgClientId) {
      const groupId = route.parent.parent.paramMap.get('groupId');
      return this.loansService.getJlgLoanTemplate(jlgClientId, groupId);
    }

    const entityId = route.parent.parent.paramMap.get('clientId') || route.parent.parent.paramMap.get('groupId');
    const isGroup = route.parent.parent.paramMap.get('groupId') ? true : false;
    return this.loansService.getLoansAccountTemplateResource(entityId, isGroup);
  }
}
