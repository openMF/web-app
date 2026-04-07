/** Angular Imports */
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import {
  MatTableDataSource,
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
import { LongTextComponent } from '../../../shared/long-text/long-text.component';
import { NgIf, CurrencyPipe } from '@angular/common';
import { ExternalIdentifierComponent } from '../../../shared/external-identifier/external-identifier.component';
import { MatDivider } from '@angular/material/divider';
import { MatStepperPrevious } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { FindPipe } from '../../../pipes/find.pipe';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { FormatNumberPipe } from '../../../pipes/format-number.pipe';
import { YesnoPipe } from '../../../pipes/yesno.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Create Loans Account Preview Step
 */
@Component({
  selector: 'mifosx-loans-account-preview-step',
  templateUrl: './loans-account-preview-step.component.html',
  styleUrls: ['./loans-account-preview-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    LongTextComponent,
    ExternalIdentifierComponent,
    MatDivider,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatStepperPrevious,
    FaIconComponent,
    CurrencyPipe,
    FindPipe,
    DateFormatPipe,
    FormatNumberPipe,
    YesnoPipe
  ]
})
export class LoansAccountPreviewStepComponent implements OnChanges {
  /** Loans Account Template */
  @Input() loansAccountTemplate: any = [];
  /** Loans Account Product Template */
  @Input() loansAccountProductTemplate: any;
  /** Loans Account Data */
  @Input() loansAccount: any;
  /** active Client Members in case of GLIM Account */
  @Input() activeClientMembers?: any;

  /** Submit Loans Account */
  @Output() submitEvent = new EventEmitter();

  /** Charges Displayed Columns */
  chargesDisplayedColumns: string[] = [
    'name',
    'chargeCalculationType',
    'amount',
    'chargeTimeType',
    'date'
  ];
  /** Overdue Charges Displayed Columns */
  overdueChargesDisplayedColumns: string[] = [
    'name',
    'type',
    'amount',
    'collectedon'
  ];
  /** Columns to be displayed in active members table. */
  membersDisplayedColumns: string[] = [
    'id',
    'name',
    'purpose',
    'principal'
  ];

  /** Loan Purpose Options */
  loanPurposeOptions: any[] = [];

  /** Table Data Source */
  dataSource: any;
  productEnableDownPayment = false;

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    this.productEnableDownPayment = this.loansAccountProductTemplate.product.enableDownPayment;
    if (this.activeClientMembers) {
      this.loanPurposeOptions = this.loansAccountProductTemplate.loanPurposeOptions;
      this.dataSource = new MatTableDataSource<any>(
        this.activeClientMembers
          .filter((member: any) => member.selected)
          .map((member: any) => ({
            ...member,
            purpose: this.loanPurposeOptions.find((option) => option.id === member.loanPurposeId)?.name
          }))
      );
      this.loansAccount.principalAmount = this.activeClientMembers
        .filter((member: any) => member.selected)
        .reduce((acc: number, member: any) => acc + (member.principal ?? 0), 0);
    }
  }
}
