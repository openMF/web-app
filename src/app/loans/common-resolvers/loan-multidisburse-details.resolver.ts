/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { LoansService } from '../loans.service';

/**
 * Clients data resolver.
 */
@Injectable()
export class MultiDisburseLoanDetailsResolver implements Resolve<Object> {

    /**
     * @param {LoansService} LoansService Loans service.
     */
    constructor(private loansService: LoansService) { }

    /**
     * Returns the Loans with Multi Disburse data.
     * @returns {Observable<any>}
     */
    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        const loanId = route.parent.paramMap.get('loanId');
        return this.loansService.getLoanAccountAssociationDetails(loanId);
    }

}
