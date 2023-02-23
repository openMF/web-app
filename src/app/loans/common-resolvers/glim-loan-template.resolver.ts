/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { LoansService } from '../loans.service';

/**
 * GLIM Loan template data resolver.
 */
@Injectable()
export class GLIMLoanTemplateResolver implements Resolve<Object> {
    /**
     * @param {ProductsService} loansService Loan service.
     */
    constructor(private loansService: LoansService) { }

    /**
     * Returns the loan account template data.
     * @returns {Observable<any>}
     */
    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        const groupId = route.paramMap.get('groupId');
        return this.loansService.getGLIMLoanAccountTemplate(groupId);
    }
}
