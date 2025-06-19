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
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { NgIf } from '@angular/common';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';
import { StatusLookupPipe } from '../../pipes/status-lookup.pipe';
import { DateFormatPipe } from '../../pipes/date-format.pipe';

@Component({
  selector: 'mifosx-group-navigation',
  templateUrl: './group-navigation.component.html',
  styleUrls: ['./group-navigation.component.scss'],
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
    TranslatePipe,
    StatusLookupPipe,
    DateFormatPipe,
    NgxTranslatePipe
  ]
})
export class GroupNavigationComponent {
  @ViewChild(LoanAccountTableComponent) loanAccountTableComponent: LoanAccountTableComponent;
  @ViewChild(SavingsAccountTableComponent) savingsAccountTableComponent: SavingsAccountTableComponent;

  @Input() groupData: any;
  @Input() groupAccountsData: any;
  @Input() clientData: any;

  constructor() {}
}
