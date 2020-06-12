import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoansService } from '../loans.service';

// Custom Imports
import { ButtonConfig } from './button-config';

@Component({
  selector: 'mifosx-loans-view',
  templateUrl: './loans-view.component.html',
  styleUrls: ['./loans-view.component.scss']
})
export class LoansViewComponent implements OnInit {

  loanDetailsData: any;
  loanDatatables: any;
  recalculateInterest: any;
  status: string;
  buttons: {
    singlebuttons: {
      name: string,
      icon: string,
      taskPermissionName: string,
    }[],
    options?: {
      name: string,
      taskPermissionName: string
    }[]
  };
  loanId: number;

  constructor(private route: ActivatedRoute,
    private router: Router) {
    this.route.data.subscribe((data: { loanDetailsData: any, loanDatatables: any}) => {
      this.loanDetailsData = data.loanDetailsData;
      this.loanDatatables = data.loanDatatables;
    });
    this.loanId = this.route.snapshot.params['loanId'];
  }

  ngOnInit() {

    this.recalculateInterest = this.loanDetailsData.recalculateInterest || true;
    this.status = this.loanDetailsData.status.value;

    // Defines the buttons based on the status of the loan account
    if (this.status === 'Submitted and pending approval') {
      this.buttons = ButtonConfig['Submitted and pending approval'];

      this.buttons.options.splice(1, 0, {
        name: (this.loanDetailsData.loanOfficerName ? 'Change Loan Officer' : 'Assign Loan Officer' ),
        taskPermissionName: 'DISBURSE_LOAN'
      });

      if (this.loanDetailsData.isVariableInstallmentsAllowed) {
        this.buttons.options.push({
            name: 'Edit Repayment Schedule',
            taskPermissionName: 'ADJUST_REPAYMENT_SCHEDULE'
        }) ;
    }

    } else if (this.status === 'Approved') {
      this.buttons = ButtonConfig['Approved'];

      this.buttons.singlebuttons.splice(1, 0, {
        name: (this.loanDetailsData.loanOfficerName ? 'Change Loan Officer' : 'Assign Loan Officer' ),
        icon: 'fa fa-user',
        taskPermissionName: 'DISBURSE_LOAN'
      });

    } else if (this.status === 'Active') {
      this.buttons = ButtonConfig['Active'];

      if (this.loanDetailsData.canDisburse) {
        this.buttons.singlebuttons.splice(1, 0, {
            name: 'Disburse',
            icon: 'fa fa-flag',
            taskPermissionName: 'DISBURSE_LOAN'
        });
        this.buttons.singlebuttons.splice(1, 0, {
            name: 'Disburse To Savings',
            icon: 'fa fa-flag',
            taskPermissionName: 'DISBURSETOSAVINGS_LOAN'
        });
      }

      // loan officer not assigned to loan, below logic
      // helps to display otherwise not
      if (!this.loanDetailsData.loanOfficerName) {
        this.buttons.singlebuttons.splice(1, 0, {
            name: 'Assign Loan Officer',
            icon: 'fa fa-user',
            taskPermissionName: 'UPDATELOANOFFICER_LOAN'
        });
      }

      if (this.recalculateInterest) {
          this.buttons.singlebuttons.splice(1, 0, {
              name: 'Prepay Loan',
              icon: 'fa fa-money',
              taskPermissionName: 'REPAYMENT_LOAN'
          });
      }

    } else if (this.status === 'Overpaid') {
      this.buttons = ButtonConfig['Overpaid'];
    } else if (this.status === 'Closed (written off)') {
      this.buttons = ButtonConfig['ClosedWrittenOff'];
    }

  }

  loanAction(button: string) {
    button = button.replace(/\s/g, '-').toLowerCase();
    this.router.navigate([button], { relativeTo: this.route });
  }

}
