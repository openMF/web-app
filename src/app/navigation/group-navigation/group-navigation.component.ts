/** Angular Imports */
import { Component, OnInit, Input, ViewChild } from '@angular/core';

/** Custom Components */
import { LoanAccountTableComponent } from '../loan-account-table/loan-account-table.component';
import { SavingsAccountTableComponent } from '../savings-account-table/savings-account-table.component';


@Component({
  selector: 'mifosx-group-navigation',
  templateUrl: './group-navigation.component.html',
  styleUrls: ['./group-navigation.component.scss']
})
export class GroupNavigationComponent implements OnInit {

  @ViewChild(LoanAccountTableComponent) loanAccountTableComponent: LoanAccountTableComponent;
  @ViewChild(SavingsAccountTableComponent) savingsAccountTableComponent: SavingsAccountTableComponent;

  @Input() groupData: any;
  @Input() groupAccountsData: any;
  @Input() clientData: any;

  constructor() { }

  ngOnInit() {
  }

}
