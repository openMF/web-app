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
export class LoansAccountTemplateResolver implements Resolve<Object> {
    /**
     * @param {ProductsService} productsService Products service.
     */
    constructor(private loansService: LoansService) { }

    /**
     * Returns the loan account template data.
     * @returns {Observable<any>}
     */
    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        const entityId = route.parent.parent.paramMap.get('clientId') || route.parent.parent.paramMap.get('groupId');
        const isGroup = (route.parent.parent.paramMap.get('groupId')) ? true : false;
        return this.loansService.getLoansAccountTemplateResource(entityId, isGroup);
    }
}
