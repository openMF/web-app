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
    const loanId = route.paramMap.get('loanId') || route.parent.paramMap.get('loanId');
    const loanActionButton = route.paramMap.get('action');
    if (loanActionButton === 'Assign Loan Officer' || loanActionButton === 'Change Loan Officer') {
      return this.loansService.getLoanTemplate(loanId);
    } else if (loanActionButton === 'Make Repayment') {
      return this.loansService.getLoanActionTemplate(loanId, 'repayment');
    } else if (loanActionButton === 'Goodwill Credit') {
      return this.loansService.getLoanActionTemplate(loanId, 'goodwillCredit');
    } else if (loanActionButton === 'Payout Refund') {
      return this.loansService.getLoanActionTemplate(loanId, 'payoutRefund');
    } else if (loanActionButton === 'Merchant Issued Refund') {
      return this.loansService.getLoanActionTemplate(loanId, 'merchantIssuedRefund');
    } else if (loanActionButton === 'Credit Balance Refund') {
      return this.loansService.getLoanActionTemplate(loanId, 'creditBalanceRefund');
    } else if (loanActionButton === 'Waive Interest') {
      return this.loansService.getLoanActionTemplate(loanId, 'waiveinterest');
    } else if (loanActionButton === 'Write Off') {
      return this.loansService.getLoanActionTemplate(loanId, 'writeoff');
    } else if (loanActionButton === 'Close') {
      return this.loansService.getLoanActionTemplate(loanId, 'close');
    } else if (loanActionButton === 'Close (as Rescheduled)') {
      return this.loansService.getLoanActionTemplate(loanId, 'close-rescheduled');
    } else if (loanActionButton === 'Reschedule') {
      return this.loansService.rescheduleLoanTemplate();
    } else if (loanActionButton === 'Prepay Loan') {
      return this.loansService.getLoanPrepayLoanActionTemplate(loanId, null);
    } else if (loanActionButton === 'Add Collateral') {
      return this.loansService.getLoanCollateralTemplate(loanId);
    } else if (loanActionButton === 'Disburse to Savings') {
      return this.loansService.getLoanActionTemplate(loanId, 'disburseToSavings');
    } else if (loanActionButton === 'Recovery Payment') {
      return this.loansService.getLoanActionTemplate(loanId, 'recoverypayment');
    } else if (loanActionButton === 'View Guarantors') {
      return this.loansService.getLoanAccountResource(loanId, 'guarantors');
    } else if (loanActionButton === 'Create Guarantor') {
      return this.loansService.getGuarantorTemplate(loanId);
    } else if (loanActionButton === 'Disburse') {
      return this.loansService.getLoanActionTemplate(loanId, 'disburse');
    } else if (loanActionButton === 'Loan Screen Reports') {
      return this.loansService.getLoanScreenReportsData();
    } else if (loanActionButton === 'Approve') {
      return this.loansService.getLoanApprovalTemplate(loanId);
    } else if (loanActionButton === 'Add Loan Charge') {
      return this.loansService.getLoanChargeTemplateResource(loanId);
    } else if (loanActionButton === 'Foreclosure') {
      return this.loansService.getLoanForeclosureActionTemplate(loanId);
    } else {
      return undefined;
    }
  }

}
