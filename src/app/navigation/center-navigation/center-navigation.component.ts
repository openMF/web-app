/** Angular Imports */
import { Component, Input, ViewChild } from '@angular/core';

/** Custom Components */
import { LoanAccountTableComponent } from '../loan-account-table/loan-account-table.component';
import { SavingsAccountTableComponent } from '../savings-account-table/savings-account-table.component';
import {
  MatCardHeader,
  MatCardTitleGroup,
  MatCardTitle,
  MatCardSubtitle,
  MatCardContent
} from '@angular/material/card';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatTooltip } from '@angular/material/tooltip';
import { AccountNumberComponent } from '../../shared/account-number/account-number.component';
import { NgIf } from '@angular/common';
import { ExternalIdentifierComponent } from '../../shared/external-identifier/external-identifier.component';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';
import { StatusLookupPipe } from '../../pipes/status-lookup.pipe';
import { DateFormatPipe } from '../../pipes/date-format.pipe';

@Component({
  selector: 'mifosx-center-navigation',
  templateUrl: './center-navigation.component.html',
  styleUrls: ['./center-navigation.component.scss'],
  imports: [
    MatCardHeader,
    FaIconComponent,
    MatCardTitleGroup,
    MatCardTitle,
    MatTooltip,
    MatCardSubtitle,
    AccountNumberComponent,
    NgIf,
    ExternalIdentifierComponent,
    MatCardContent,
    MatTabGroup,
    MatTab,
    LoanAccountTableComponent,
    SavingsAccountTableComponent,
    TranslatePipe,
    StatusLookupPipe,
    DateFormatPipe,
    NgxTranslatePipe
  ]
})
export class CenterNavigationComponent {
  @ViewChild(LoanAccountTableComponent) loanAccountTableComponent: LoanAccountTableComponent;
  @ViewChild(SavingsAccountTableComponent) savingsAccountTableComponent: SavingsAccountTableComponent;

  @Input() centerData: any;
  @Input() centerAccountsData: any;
  @Input() centerSummaryData: any;
  @Input() groupData: any;

  constructor() {}
}
