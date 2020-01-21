/** Angular Imports */
import { Component, OnInit, Input, ViewChild } from '@angular/core';

/** Custom Components */
import { LoanAccountTableComponent } from '../loan-account-table/loan-account-table.component';
import { SavingsAccountTableComponent } from '../savings-account-table/savings-account-table.component';


@Component({
  selector: 'mifosx-center-navigation',
  templateUrl: './center-navigation.component.html',
  styleUrls: ['./center-navigation.component.scss']
})
export class CenterNavigationComponent implements OnInit {

  @ViewChild(LoanAccountTableComponent) loanAccountTableComponent: LoanAccountTableComponent;
  @ViewChild(SavingsAccountTableComponent) savingsAccountTableComponent: SavingsAccountTableComponent;

  @Input() centerData: any;
  @Input() centerAccountsData: any;
  @Input() centerSummaryData: any;
  @Input() groupData: any;

  constructor() { }

  ngOnInit() {
  }

}
