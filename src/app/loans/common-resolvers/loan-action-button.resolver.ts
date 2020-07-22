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
        if (loanActionButton === 'assign-loan-officer' || loanActionButton === 'change-loan-officer') {
            return this.loansService.getLoanTemplate(loanId);
        // } else if (loanActionButton === 'make-repayment') {
        //     return this.loansService.getLoanActionTemplate(loanId, 'repayment');
        } else if (loanActionButton === 'waive-interest') {
            return this.loansService.getLoanActionTemplate(loanId, 'waiveinterest');
        } else if (loanActionButton === 'write-off') {
            return this.loansService.getLoanActionTemplate(loanId, 'writeoff');
        } else if (loanActionButton === 'close') {
            return this.loansService.getLoanActionTemplate(loanId, 'close');
        } else if (loanActionButton === 'close-as-rescheduled') {
            return this.loansService.getLoanActionTemplate(loanId, 'close-rescheduled');
        } else if (loanActionButton === 'reschedule') {
            return this.loansService.rescheduleLoanTemplate();
        } else if (loanActionButton === 'prepay-loan') {
            return this.loansService.getLoanActionTemplate(loanId, 'prepayLoan');
        } else if (loanActionButton === 'add-collateral') {
            return this.loansService.getLoanCollateralTemplate(loanId);
        } else if (loanActionButton === 'disburse-to-savings') {
            return this.loansService.getLoanActionTemplate(loanId, 'disburseToSavings');
        } else if (loanActionButton === 'recovery-payment') {
            return this.loansService.getLoanActionTemplate(loanId, 'recoverypayment');
        } else if (loanActionButton === 'view-guarantors') {
            return this.loansService.getLoanAccountResource(loanId, 'guarantors');
        } else if (loanActionButton === 'create-guarantor') {
            return this.loansService.getGuarantorTemplate(loanId);
        } else if (loanActionButton === 'disburse') {
            return this.loansService.getLoanActionTemplate(loanId, 'disburse');
        } else if (loanActionButton === 'loan-screen-reports') {
            return this.loansService.getLoanScreenReportsData();
        } else if (loanActionButton === 'approve') {
            return this.loansService.getLoanApprovalTemplate(loanId);
        } else if (loanActionButton === 'add-loan-charge') {
            return this.loansService.getLoanChargeTemplateResource(loanId);
        } else {
            return undefined;
        }
    }

}
