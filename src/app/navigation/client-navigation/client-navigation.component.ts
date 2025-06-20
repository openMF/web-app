/** Angular Imports */
import { Component, Input, ViewChild } from '@angular/core';

/** Custom Components */
import { LoanAccountTableComponent } from '../loan-account-table/loan-account-table.component';
import { SavingsAccountTableComponent } from '../savings-account-table/savings-account-table.component';
import { ShareAccountTableComponent } from '../share-account-table/share-account-table.component';
import { MemberGroupsComponent } from '../member-groups/member-groups.component';
import {
  MatCardHeader,
  MatCardTitleGroup,
  MatCardTitle,
  MatCardSubtitle,
  MatCardContent
} from '@angular/material/card';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatTooltip } from '@angular/material/tooltip';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { StatusLookupPipe } from '../../pipes/status-lookup.pipe';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-client-navigation',
  templateUrl: './client-navigation.component.html',
  styleUrls: ['./client-navigation.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCardHeader,
    FaIconComponent,
    MatCardTitleGroup,
    MatCardTitle,
    MatTooltip,
    MatCardSubtitle,
    MatTabGroup,
    MatTab,
    LoanAccountTableComponent,
    SavingsAccountTableComponent,
    ShareAccountTableComponent,
    MemberGroupsComponent,
    StatusLookupPipe,
    DateFormatPipe
  ]
})
export class ClientNavigationComponent {
  @ViewChild(LoanAccountTableComponent) loanAccountTableComponent: LoanAccountTableComponent;
  @ViewChild(SavingsAccountTableComponent) savingsAccountTableComponent: SavingsAccountTableComponent;
  @ViewChild(ShareAccountTableComponent) shareAccountTableComponent: ShareAccountTableComponent;
  @ViewChild(MemberGroupsComponent) memberGroupsComponent: MemberGroupsComponent;

  @Input() clientData: any;
  @Input() clientAccountsData: any;

  constructor() {}
}
