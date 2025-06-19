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
import { NgIf } from '@angular/common';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';
import { StatusLookupPipe } from '../../pipes/status-lookup.pipe';
import { DateFormatPipe } from '../../pipes/date-format.pipe';

@Component({
  selector: 'mifosx-client-navigation',
  templateUrl: './client-navigation.component.html',
  styleUrls: ['./client-navigation.component.scss'],
  imports: [
    MatCardHeader,
    FaIconComponent,
    MatCardTitleGroup,
    MatCardTitle,
    MatTooltip,
    MatCardSubtitle,
    MatCardContent,
    MatTabGroup,
    MatTab,
    NgIf,
    LoanAccountTableComponent,
    SavingsAccountTableComponent,
    ShareAccountTableComponent,
    MemberGroupsComponent,
    TranslatePipe,
    StatusLookupPipe,
    DateFormatPipe,
    NgxTranslatePipe
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
