/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { LoansService } from '../loans.service';

/**
 * Loans Account Charge data resolver.
 */
@Injectable()
export class LoansAccountChargeResolver implements Resolve<Object> {

    /**
     * @param {LoansService} LoansService Loans service.
     */
    constructor(private loansService: LoansService) { }

    /**
     * Returns the Loans Account Charge data.
     * @param {ActivatedRouteSnapshot} route Route Snapshot
     * @returns {Observable<any>}
     */
    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        const loanAccountId = route.parent.parent.paramMap.get('loanId');
        const chargeId = route.paramMap.get('id');
        return this.loansService.getLoansAccountCharge(loanAccountId, chargeId);
    }

}
