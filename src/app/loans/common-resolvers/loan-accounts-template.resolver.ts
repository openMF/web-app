/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { LoansService } from '../loans.service';

/**
 * Loan accounts template data resolver.
 */
@Injectable()
export class LoanAccountsTemplateResolver implements Resolve<Object> {
  /**
   * @param {ProductsService} productsService Products service.
   */
  constructor(private loansService: LoansService) {}

  /**
   * Returns the loan account template data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const clientId = route.paramMap.get('clientId');
    const groupId = route.paramMap.get('groupId');

    let templateType;
    if (clientId && groupId) {
      templateType = 'jlg';
    } else if (groupId) {
      templateType = 'group';
    } else if (clientId) {
      templateType = 'individual';
    }

    let params: any = {
      activeOnly: 'true',
      templateType: templateType,
      staffInSelectedOfficeOnly: true
    };
    if (clientId) {
      params = {
        ...params,
        clientId: clientId
      };
    } else if (groupId) {
      params = {
        ...params,
        groupId: groupId
      };
    }
    return this.loansService.getLoanAccountsTemplateResource(params);
  }
}
