/** Angular Imports */
import { Injectable, Inject } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, ActivatedRoute, RouterEvent } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { LoansService } from '../loans.service';

/**
 *  Loan Transaction Template resolver.
 */
@Injectable()
export class LoanTransactionTemplateResolver implements Resolve<Object> {

    /**
     * @param {LoansService} LoansService loans service.
     */
    constructor(private loansService: LoansService) { }

    /**
     * Returns the Loan Transaction Template.
     * @returns {Observable<any>}
     */
    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        const loanId = route.parent.paramMap.get('loanId');
        const command = route.routeConfig.path;
        return this.loansService.getLoanTransactionTemplate(loanId, command);
    }

}
