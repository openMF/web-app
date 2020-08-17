/** Angular Imports */
import { Component, OnInit, Input, ViewChild } from '@angular/core';

/** Custom Components */
import { LoanAccountTableComponent } from '../loan-account-table/loan-account-table.component';
import { SavingsAccountTableComponent } from '../savings-account-table/savings-account-table.component';
import { ShareAccountTableComponent } from '../share-account-table/share-account-table.component';
import { MemberGroupsComponent } from '../member-groups/member-groups.component';

@Component({
  selector: 'mifosx-client-navigation',
  templateUrl: './client-navigation.component.html',
  styleUrls: ['./client-navigation.component.scss']
})
export class ClientNavigationComponent implements OnInit {

  @ViewChild(LoanAccountTableComponent, { static: false }) loanAccountTableComponent: LoanAccountTableComponent;
  @ViewChild(SavingsAccountTableComponent, { static: false }) savingsAccountTableComponent: SavingsAccountTableComponent;
  @ViewChild(ShareAccountTableComponent, { static: false }) shareAccountTableComponent: ShareAccountTableComponent;
  @ViewChild(MemberGroupsComponent, { static: false }) memberGroupsComponent: MemberGroupsComponent;

  @Input() clientData: any;
  @Input() clientAccountsData: any;

  constructor() { }

  ngOnInit() {
  }

}
