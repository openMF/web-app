/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { LoansService } from '@fineract/client';

/**
 * Loan accounts template data resolver.
 */
@Injectable()
export class LoansAccountTemplateResolver {
  /**
   * @param {ProductsService} productsService Products service.
   */
  constructor(private loansService: LoansService) {}

  /**
   * Returns the loan account template data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const entityId = route.parent.parent.paramMap.get('clientId') || route.parent.parent.paramMap.get('groupId');
    const isGroup = route.parent.parent.paramMap.get('groupId') ? true : false;

    const params: any = {
      activeOnly: true,
      staffInSelectedOfficeOnly: true,
      templateType: isGroup ? 'group' : 'individual'
    };

    if (isGroup) {
      params.groupId = Number(entityId);
    } else {
      params.clientId = Number(entityId);
    }

    return this.loansService.template10(params);
  }
}
