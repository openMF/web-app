/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { LoansService } from '../loans.service';

/**
 * Loans notes data resolver.
 */
@Injectable()
export class LoanActionButtonResolver implements Resolve<Object> {

    /**
     * @param {LoansService} LoansService Loans service.
     */
    constructor(private loansService: LoansService) { }

    /**
     * Returns the Loans Notes Data.
     * @returns {Observable<any>}
     */
    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        const loanId = route.parent.paramMap.get('loanId');
        const loanActionButton = route.paramMap.get('action');
        // if (loanActionButton === 'assign-loan-officer') {
            return this.loansService.getLoanTemplate(loanId);
        // }
    }

}
