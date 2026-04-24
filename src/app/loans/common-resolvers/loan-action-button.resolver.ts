/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { HttpClient } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import {
  LoansService,
  LoanTransactionsService,
  RescheduleLoansService,
  LoanCollateralService,
  GuarantorsService,
  UserGeneratedDocumentsService,
  LoanChargesService
} from '@fineract/client';

/**
 * Loans notes data resolver.
 */
@Injectable()
export class LoanActionButtonResolver {
  /**
   * @param {LoansService} loansService Loans service.
   * @param {LoanTransactionsService} loanTransactionsService Loan Transactions service.
   * @param {RescheduleLoansService} rescheduleLoansService Reschedule Loans service.
   * @param {LoanCollateralService} loanCollateralService Loan Collateral service.
   * @param {GuarantorsService} guarantorsService Guarantors service.
   * @param {UserGeneratedDocumentsService} userGeneratedDocumentsService User Generated Documents service.
   * @param {LoanChargesService} loanChargesService Loan Charges service.
   */
  constructor(
    private loansService: LoansService,
    private loanTransactionsService: LoanTransactionsService,
    private rescheduleLoansService: RescheduleLoansService,
    private loanCollateralService: LoanCollateralService,
    private guarantorsService: GuarantorsService,
    private userGeneratedDocumentsService: UserGeneratedDocumentsService,
    private loanChargesService: LoanChargesService
  ) {}

  /**
   * Returns the Loans Notes Data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const loanId = route.paramMap.get('loanId') || route.parent.paramMap.get('loanId');
    const clientId =
      route.parent && route.parent.paramMap.get('clientId') ? route.parent.paramMap.get('clientId') : undefined;
    const loanActionButton = route.paramMap.get('action');
    if (loanActionButton === 'Assign Loan Officer' || loanActionButton === 'Change Loan Officer') {
      // Fetch loan details and loan officer options for assigning/changing loan officer
      return new Observable((observer) => {
        this.loansService
          .retrieveLoan({
            loanId: parseInt(loanId, 10),
            associations: 'all'
          })
          .subscribe(
            (loanResp: any) => {
              // Try to get loan officer options from loanResp, fallback to template endpoint if needed
              if (loanResp && loanResp.loanOfficerOptions) {
                observer.next({ ...loanResp, loanOfficerOptions: loanResp.loanOfficerOptions });
                observer.complete();
              } else {
                // Try to fetch from /loans/template (without templateType)
                this.loansService
                  .template10({
                    clientId: clientId ? parseInt(clientId, 10) : undefined,
                    templateType: 'individual'
                  })
                  .subscribe(
                    (templateResp: any) => {
                      observer.next({ ...loanResp, loanOfficerOptions: templateResp?.loanOfficerOptions || [] });
                      observer.complete();
                    },
                    (err) => {
                      observer.next({ ...loanResp, loanOfficerOptions: [] });
                      observer.complete();
                    }
                  );
              }
            },
            (err) => observer.error(err)
          );
      });
    } else if (loanActionButton === 'Make Repayment') {
      return this.loanTransactionsService.retrieveTransactionTemplate({
        loanId: parseInt(loanId, 10),
        command: 'repayment'
      });
    } else if (loanActionButton === 'Goodwill Credit') {
      return this.loanTransactionsService.retrieveTransactionTemplate({
        loanId: parseInt(loanId, 10),
        command: 'goodwillCredit'
      });
    } else if (loanActionButton === 'Interest Payment Waiver') {
      return this.loanTransactionsService.retrieveTransactionTemplate({
        loanId: parseInt(loanId, 10),
        command: 'interestPaymentWaiver'
      });
    } else if (loanActionButton === 'Payout Refund') {
      return this.loanTransactionsService.retrieveTransactionTemplate({
        loanId: parseInt(loanId, 10),
        command: 'payoutRefund'
      });
    } else if (loanActionButton === 'Merchant Issued Refund') {
      return this.loanTransactionsService.retrieveTransactionTemplate({
        loanId: parseInt(loanId, 10),
        command: 'merchantIssuedRefund'
      });
    } else if (loanActionButton === 'Credit Balance Refund') {
      return this.loanTransactionsService.retrieveTransactionTemplate({
        loanId: parseInt(loanId, 10),
        command: 'creditBalanceRefund'
      });
    } else if (loanActionButton === 'Waive Interest') {
      return this.loanTransactionsService.retrieveTransactionTemplate({
        loanId: parseInt(loanId, 10),
        command: 'waiveinterest'
      });
    } else if (loanActionButton === 'Write Off') {
      return this.loanTransactionsService.retrieveTransactionTemplate({
        loanId: parseInt(loanId, 10),
        command: 'writeoff'
      });
    } else if (loanActionButton === 'Close') {
      return this.loanTransactionsService.retrieveTransactionTemplate({
        loanId: parseInt(loanId, 10),
        command: 'close'
      });
    } else if (loanActionButton === 'Close (as Rescheduled)') {
      return this.loanTransactionsService.retrieveTransactionTemplate({
        loanId: parseInt(loanId, 10),
        command: 'close-rescheduled'
      });
    } else if (loanActionButton === 'Reschedule') {
      return this.rescheduleLoansService.retrieveTemplate10();
    } else if (loanActionButton === 'Prepay Loan') {
      return this.loanTransactionsService.retrieveTransactionTemplate({
        loanId: parseInt(loanId, 10),
        command: 'prepayLoan'
      });
    } else if (loanActionButton === 'Add Collateral') {
      return this.loanCollateralService.newCollateralTemplate({ loanId: parseInt(loanId, 10) });
    } else if (loanActionButton === 'Disburse to Savings') {
      return this.loanTransactionsService.retrieveTransactionTemplate({
        loanId: parseInt(loanId, 10),
        command: 'disburseToSavings'
      });
    } else if (loanActionButton === 'Recovery Payment') {
      return this.loanTransactionsService.retrieveTransactionTemplate({
        loanId: parseInt(loanId, 10),
        command: 'recoverypayment'
      });
    } else if (loanActionButton === 'View Guarantors') {
      return this.loansService.retrieveLoan({ loanId: parseInt(loanId, 10), associations: 'guarantors' });
    } else if (loanActionButton === 'Create Guarantor') {
      return this.guarantorsService.newGuarantorTemplate({ loanId: parseInt(loanId, 10) });
    } else if (loanActionButton === 'Disburse') {
      return this.loanTransactionsService.retrieveTransactionTemplate({
        loanId: parseInt(loanId, 10),
        command: 'disburse'
      });
    } else if (loanActionButton === 'Loan Screen Reports') {
      return this.userGeneratedDocumentsService.retrieveAll40();
    } else if (loanActionButton === 'Approve') {
      // Use template10 for approval and map to expected structure
      return new Observable((observer) => {
        this.loansService
          .retrieveLoan({
            loanId: parseInt(loanId, 10)
          })
          .subscribe(
            (resp: any) => {
              observer.next({
                approvalAmount: resp.approvedPrincipal || resp.principal || 0,
                currency: resp.currency?.code || '',
                minApprovalAmount: 0, // Set as needed
                maxApprovalAmount: resp.approvedPrincipal || resp.principal || 0, // Set as needed
                ...resp
              });
              observer.complete();
            },
            (err) => observer.error(err)
          );
      });
    } else if (loanActionButton === 'Add Loan Charge') {
      return this.loanChargesService.retrieveTemplate8({ loanId: parseInt(loanId, 10) });
    } else if (loanActionButton === 'Foreclosure') {
      return this.loanTransactionsService.retrieveTransactionTemplate({
        loanId: parseInt(loanId, 10),
        command: 'foreclosure'
      });
    } else if (loanActionButton === 'Charge-Off') {
      return this.loanTransactionsService.retrieveTransactionTemplate({
        loanId: parseInt(loanId, 10),
        command: 'charge-off'
      });
    } else if (loanActionButton === 'Capitalized Income') {
      return this.loanTransactionsService.retrieveTransactionTemplate({
        loanId: parseInt(loanId, 10),
        command: 'capitalizedIncome'
      });
    } else if (loanActionButton === 'Contract Termination') {
      return this.loanTransactionsService.retrieveTransactionTemplate({
        loanId: parseInt(loanId, 10),
        command: 'contractTermination'
      });
    } else if (loanActionButton === 'Buy Down Fee') {
      return this.loanTransactionsService.retrieveTransactionTemplate({
        loanId: parseInt(loanId, 10),
        command: 'buyDownFee'
      });
    } else if (loanActionButton === 'Re-Age') {
      return this.loanTransactionsService.retrieveTransactionTemplate({
        loanId: parseInt(loanId, 10),
        command: 'reAge'
      });
    } else if (loanActionButton === 'Re-Amortize') {
      return this.loanTransactionsService.retrieveTransactionTemplate({
        loanId: parseInt(loanId, 10),
        command: 'reAmortization'
      });
    } else {
      return undefined;
    }
  }
}
