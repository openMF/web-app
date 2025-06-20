/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIf, NgClass } from '@angular/common';
import {
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow
} from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';
import { StatusLookupPipe } from '../../../pipes/status-lookup.pipe';
import { AccountsFilterPipe } from '../../../pipes/accounts-filter.pipe';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Groups View General Tab Component.
 */
@Component({
  selector: 'mifosx-general-tab',
  templateUrl: './general-tab.component.html',
  styleUrls: ['./general-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    NgClass,
    MatTooltip,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    StatusLookupPipe,
    AccountsFilterPipe,
    DateFormatPipe
  ]
})
export class GeneralTabComponent {
  /** Group's all accounts data */
  groupAccountData: any;
  /** Group's loan accounts data */
  loanAccounts: any;
  /** Group's savings accounts data */
  savingAccounts: any;
  /** GSIM Accounts */
  gsimAccounts: any;
  /** GLIM Accounts */
  glimAccounts: any;
  /** Group Summary */
  groupSummary: any;
  /** Group's Client Members */
  groupClientMembers: any;
  /** Columns to be Displayed for client members table */
  clientMemberColumns: string[] = [
    'Name',
    'Account No',
    'Office',
    'JLG Loan Application'
  ];
  /** Columns to be displayed for open loan accounts table */
  openLoansColumns: string[] = [
    'Account No',
    'Loan Account',
    'Original Loan',
    'Loan Balance',
    'Amount Paid',
    'Type',
    'Actions'
  ];
  /** Columns to be displayed for closed loan accounts table */
  closedLoansColumns: string[] = [
    'Account No',
    'Loan Account',
    'Original Loan',
    'Loan Balance',
    'Amount Paid',
    'Type',
    'Closed Date'
  ];
  /** Columns to be displayed for open savings accounts table */
  openSavingsColumns: string[] = [
    'Account No',
    'Saving Account',
    'Last Active',
    'Balance',
    'Actions'
  ];
  /** Columns to be displayed for closed accounts table */
  closedSavingsColumns: string[] = [
    'Account No',
    'Saving Account',
    'Closed Date'
  ];
  /** Columns to be displayed for GSIM Accounts Table */
  gsimAccountsColumns: string[] = [
    'GSIM Id',
    'Account Number',
    'Product',
    'Balance',
    'Status'
  ];
  /** Columns to be displayed for GLIM Accounts Table */
  glimAccountsColumns: string[] = [
    'GLIM Id',
    'Account Number',
    'Product',
    'Original Loan',
    'Status'
  ];
  /** Boolean for toggling loan accounts table */
  showClosedLoanAccounts = false;
  /** Boolean for toggling savings accounts table */
  showClosedSavingAccounts = false;

  /**
   * Fetches group's related data from `resolve`
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe(
      (data: { groupAccountsData: any; groupClientMembers: any; groupSummary: any; glimData: any; gsimData: any }) => {
        this.glimAccounts = data.glimData;
        this.gsimAccounts = data.gsimData;
        this.groupAccountData = data.groupAccountsData;
        this.savingAccounts = data.groupAccountsData.savingsAccounts;
        this.loanAccounts = data.groupAccountsData.loanAccounts;
        this.groupSummary = data.groupSummary[0];
      }
    );
    this.route.parent.data.subscribe((data: { groupViewData: any }) => {
      this.groupClientMembers = data.groupViewData.clientMembers;
    });
  }

  /**
   * Toggles loan accounts table.
   */
  toggleLoanAccountsOverview() {
    this.showClosedLoanAccounts = !this.showClosedLoanAccounts;
  }

  /**
   * Toggles savings account table.
   */
  toggleSavingAccountsOverview() {
    this.showClosedSavingAccounts = !this.showClosedSavingAccounts;
  }

  /**
   * Stops the propagation to view pages.
   * @param $event Mouse Event
   */
  routeEdit($event: MouseEvent) {
    $event.stopPropagation();
  }
}
