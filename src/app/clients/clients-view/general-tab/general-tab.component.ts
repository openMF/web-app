/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';



@Component({
  selector: 'mifosx-general-tab',
  templateUrl: './general-tab.component.html',
  styleUrls: ['./general-tab.component.scss']
})
export class GeneralTabComponent implements OnInit {
  openLoansColumns: string[] = ['Account No', 'Loan Account', 'Original Loan', 'Loan Balance', 'Amount Paid', 'Type', 'Actions'];
  closedLoansColumns: string[] = ['Account No', 'Loan Account', 'Original Loan', 'Loan Balance', 'Amount Paid', 'Type', 'Closed Date'];
  openSavingsColumns: string[] = ['Account No', 'Saving Account', 'Last Active', 'Balance', 'Actions'];
  closedSavingsColumns: string[] = ['Account No', 'Saving Account', 'Closed Date'];
  openSharesColumns: string[] = ['Account No', 'Share Account', 'Approved Shares', 'Pending For Approval Shares', 'Actions'];
  closedSharesColumns: string[] = ['Account No', 'Share Account', 'Approved Shares', 'Pending For Approval Shares', 'Closed Date'];
  upcomingChargesColumns: string[] = ['Name', 'Due as of', 'Due', 'Paid', 'Waived', 'Outstanding', 'Actions'];
  clientAccountData: any;
  loanAccounts: any;
  savingAccounts: any;
  shareAccounts: any;
  upcomingCharges: any;
  clientSummary: any;
  showClosedLoanAccounts = false;
  showClosedSavingAccounts = false;
  showClosedShareAccounts = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private datePipe: DatePipe,
  ) {
    this.route.data.subscribe((data: { clientAccountsData: any, clientChargesData: any, clientSummary: any }) => {
      this.clientAccountData = data.clientAccountsData;
      this.savingAccounts = data.clientAccountsData.savingsAccounts;
      this.loanAccounts = data.clientAccountsData.loanAccounts;
      this.shareAccounts = data.clientAccountsData.shareAccounts;
      this.upcomingCharges = data.clientChargesData.pageItems;
      this.clientSummary = data.clientSummary[0];
    });
  }

  ngOnInit() {
  }

  toggleLoanAccountsOverview() {
    this.showClosedLoanAccounts = !this.showClosedLoanAccounts;
  }

  toggleSavingAccountsOverview() {
    this.showClosedSavingAccounts = !this.showClosedSavingAccounts;
  }
  toggleShareAccountsOverview() {
    this.showClosedShareAccounts = !this.showClosedShareAccounts;
  }

}
