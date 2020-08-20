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
  /** Loan Id */
  loanId: number;
  /** Client Id */
  clientId: any;
  /** Button Configuration */
  buttonConfig: LoansAccountButtonConfiguration;

  constructor(private route: ActivatedRoute,
              private router: Router,
              public loansService: LoansService,
              public dialog: MatDialog) {
    this.route.data.subscribe((data: { loanDetailsData: any, loanDatatables: any}) => {
      this.loanDetailsData = data.loanDetailsData;
      this.loanDatatables = data.loanDatatables;
    });
    this.loanId = this.route.snapshot.params['loanId'];
    this.clientId = this.loanDetailsData.clientId;
  }

  ngOnInit() {

    this.recalculateInterest = this.loanDetailsData.recalculateInterest || true;
    this.status = this.loanDetailsData.status.value;
    this.setConditionalButtons();
  }

  // Defines the buttons based on the status of the loan account
  setConditionalButtons() {
    this.buttonConfig = new LoansAccountButtonConfiguration(this.status);

    if (this.status === 'Submitted and pending approval') {

      this.buttonConfig.addOption({
        name: (this.loanDetailsData.loanOfficerName ? 'Change Loan Officer' : 'Assign Loan Officer'),
        taskPermissionName: 'DISBURSE_LOAN'
      });

      if (this.loanDetailsData.isVariableInstallmentsAllowed) {
        this.buttonConfig.addOption({
          name: 'Edit Repayment Schedule',
          taskPermissionName: 'ADJUST_REPAYMENT_SCHEDULE'
        });
      }

    } else if (this.status === 'Approved') {

      this.buttonConfig.addButton({
        name: (this.loanDetailsData.loanOfficerName ? 'Change Loan Officer' : 'Assign Loan Officer'),
        icon: 'fa fa-user',
        taskPermissionName: 'DISBURSE_LOAN'
      });

    } else if (this.status === 'Active') {

      if (this.loanDetailsData.canDisburse) {
        this.buttonConfig.addButton({
          name: 'Disburse',
          icon: 'fa fa-flag',
          taskPermissionName: 'DISBURSE_LOAN'
        });
        this.buttonConfig.addButton({
          name: 'Disburse To Savings',
          icon: 'fa fa-flag',
          taskPermissionName: 'DISBURSETOSAVINGS_LOAN'
        });
      }

      // loan officer not assigned to loan, below logic
      // helps to display otherwise not
      if (!this.loanDetailsData.loanOfficerName) {
        this.buttonConfig.addButton({
          name: 'Assign Loan Officer',
          icon: 'fa fa-user',
          taskPermissionName: 'UPDATELOANOFFICER_LOAN'
        });
      }

      if (this.recalculateInterest) {
        this.buttonConfig.addButton({
          name: 'Prepay Loan',
          icon: 'fa fa-money',
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
        button = button.replace(/\s/g, '-').toLowerCase();
        button = button.replace(/\(/g, '');
        button = button.replace(/\)/g, '');
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
    this.router.navigateByUrl(`/clients/${clientId}/loans`, { skipLocationChange: true })
      .then(() => this.router.navigate([url]));
  }

}
