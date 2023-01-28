/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/** Custom Services */
import { LoansService } from '../loans.service';

/** Custom Buttons Configuration */
import { LoansAccountButtonConfiguration } from './loan-accounts-button-config';

/** Dialog Components */
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { LoanStatus } from '../models/loan-status.nodel';

@Component({
  selector: 'mifosx-loans-view',
  templateUrl: './loans-view.component.html',
  styleUrls: ['./loans-view.component.scss']
})
export class LoansViewComponent implements OnInit {

  /** Loan Details Data */
  loanDetailsData: any;
  /** Loan Datatables */
  loanDatatables: any;
  /** Recalculate Interest */
  recalculateInterest: any;
  /** Status */
  status: string;
  entityType: string;
  /** Loan Id */
  loanId: number;
  /** Client Id */
  clientId: number;
  /** Button Configuration */
  buttonConfig: LoansAccountButtonConfiguration;
  /** Disburse Transaction number */
  disburseTransactionNo = 0;

  loanStatus: LoanStatus;

  constructor(private route: ActivatedRoute,
              private router: Router,
              public loansService: LoansService,
              public dialog: MatDialog) {
    this.route.data.subscribe((data: { loanDetailsData: any, loanDatatables: any}) => {
      this.loanDetailsData = data.loanDetailsData;
      this.loanDatatables = data.loanDatatables;
      this.loanStatus = this.loanDetailsData.status;
    });
    this.loanId = this.route.snapshot.params['loanId'];
    this.clientId = this.loanDetailsData.clientId;
  }

  ngOnInit() {
    this.recalculateInterest = this.loanDetailsData.recalculateInterest || true;
    this.status = this.loanDetailsData.status.value;
    if (this.loanDetailsData.status.active && this.loanDetailsData.multiDisburseLoan) {
      if (this.loanDetailsData && this.loanDetailsData.transactions) {
        this.loanDetailsData.transactions.forEach((transaction: any) => {
          if (transaction.type.disbursement) {
            this.disburseTransactionNo++;
          }
        });
      }
    }
    this.setConditionalButtons();
    if (this.router.url.includes('clients')) {
      this.entityType = 'Client';
    } else if (this.router.url.includes('groups')) {
      this.entityType = 'Group';
    } else if (this.router.url.includes('centers')) {
      this.entityType = 'Center';
    }
  }

  // Defines the buttons based on the status of the loan account
  setConditionalButtons() {
    this.buttonConfig = new LoansAccountButtonConfiguration(this.status);

    if (this.status === 'Submitted and pending approval') {

      this.buttonConfig.addOption({
        name: (this.loanDetailsData.loanOfficerName ? 'Change Loan Officer' : 'Assign Loan Officer'),
        icon: 'user-tie',
        taskPermissionName: 'DISBURSE_LOAN'
      });

      if (this.loanDetailsData.isVariableInstallmentsAllowed) {
        this.buttonConfig.addOption({
          name: 'Edit Repayment Schedule',
          icon: 'edit',
          taskPermissionName: 'ADJUST_REPAYMENT_SCHEDULE'
        });
      }

    } else if (this.status === 'Approved') {

      this.buttonConfig.addButton({
        name: (this.loanDetailsData.loanOfficerName ? 'Change Loan Officer' : 'Assign Loan Officer'),
        icon: 'user-tie',
        taskPermissionName: 'DISBURSE_LOAN'
      });

    } else if (this.status === 'Active') {
      if (this.loanDetailsData.canDisburse || this.loanDetailsData.multiDisburseLoan) {
        this.buttonConfig.addButton({
          name: 'Disburse',
          icon: 'hand-holding-usd',
          taskPermissionName: 'DISBURSE_LOAN'
        });
      }
      if (this.loanDetailsData.canDisburse) {
        this.buttonConfig.addButton({
          name: 'Disburse to Savings',
          icon: 'piggy-bank',
          taskPermissionName: 'DISBURSETOSAVINGS_LOAN'
        });
      }
      if (this.loanDetailsData.multiDisburseLoan && this.disburseTransactionNo > 1) {
        this.buttonConfig.addButton({
          name: 'Undo Last Disbursal',
          icon: 'undo',
          taskPermissionName: 'DISBURSALLASTUNDO_LOAN'
        });
      }
      // loan officer not assigned to loan, below logic
      // helps to display otherwise not
      if (!this.loanDetailsData.loanOfficerName) {
        this.buttonConfig.addButton({
          name: 'Assign Loan Officer',
          icon: 'user-tie',
          taskPermissionName: 'UPDATELOANOFFICER_LOAN'
        });
      }

      if (this.recalculateInterest) {
        this.buttonConfig.addButton({
          name: 'Prepay Loan',
          icon: 'coins',
          taskPermissionName: 'REPAYMENT_LOAN'
        });
      }

    }
  }

  loanAction(button: string) {
    switch (button) {
      case 'Recover From Guarantor':
        this.recoverFromGuarantor();
        break;
      case 'Delete':
        this.deleteLoanAccount();
        break;
      case 'Modify Application':
        this.router.navigate(['edit-loans-account'], { relativeTo: this.route});
        break;
      case 'Transfer Funds':
        const queryParams: any = { loanId: this.loanId, accountType: 'fromloans' };
        this.router.navigate(['transfer-funds/make-account-transfer'], { relativeTo: this.route, queryParams: queryParams });
        break;
      default:
        this.router.navigate(['actions', button], { relativeTo: this.route });
        break;
    }
  }

  /**
   * Recover from guarantor action
   */
  private recoverFromGuarantor() {
    const recoverFromGuarantorDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { heading: 'Recover from Guarantor', dialogContext: 'Are you sure you want recover from Guarantor', type: 'Mild' }
    });
    recoverFromGuarantorDialogRef.afterClosed().subscribe((response: any) => {
      if (response.confirm) {
        this.loansService.loanActionButtons(this.loanId, 'recoverGuarantees').subscribe(() => {
          this.reload();
        });
      }
    });
  }

  /**
   * Delete loan Account
   */
  private deleteLoanAccount() {
    const deleteGuarantorDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `with loan id: ${this.loanId}` }
    });
    deleteGuarantorDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.loansService.deleteLoanAccount(this.loanId).subscribe(() => {
          this.router.navigate(['../../'], { relativeTo: this.route });
        });
      }
    });
  }

  /**
   * Refetches data for the component
   * TODO: Replace by a custom reload component instead of hard-coded back-routing.
   */
  private reload() {
    const clientId = this.clientId;
    const url: string = this.router.url;
    this.router.navigateByUrl(`/clients/${clientId}/loans-accounts`, { skipLocationChange: true })
      .then(() => this.router.navigate([url]));
  }

}
