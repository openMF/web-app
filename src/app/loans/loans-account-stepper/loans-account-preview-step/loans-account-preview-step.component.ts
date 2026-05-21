/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges
} from '@angular/core';
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
import { CurrencyPipe } from '@angular/common';
import { ExternalIdentifierComponent } from '../../../shared/external-identifier/external-identifier.component';
import { MatDivider } from '@angular/material/divider';
import { MatStepperPrevious } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { FindPipe } from '../../../pipes/find.pipe';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { FormatNumberPipe } from '../../../pipes/format-number.pipe';
import { YesnoPipe } from '../../../pipes/yesno.pipe';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanProductBaseComponent } from 'app/products/loan-products/common/loan-product-base.component';
import { LoanProductBasicDetails } from 'app/loans/models/loan-product.model';
import { LongTextComponent } from 'app/shared/long-text/long-text.component';
import { Breach, NearBreach } from 'app/products/loan-products/models/loan-product.model';
import { BreachDisplayComponent } from 'app/shared/loan/breach-display/breach-display.component';

/**
 * Create Loans Account Preview Step
 */
@Component({
  selector: 'mifosx-loans-account-preview-step',
  templateUrl: './loans-account-preview-step.component.html',
  styleUrls: ['./loans-account-preview-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
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
    YesnoPipe,
    TranslatePipe,
    LongTextComponent,
    BreachDisplayComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoansAccountPreviewStepComponent extends LoanProductBaseComponent implements OnChanges {
  /** Loans Account Template */
  @Input() loansAccountTemplate: any;
  /** Loans Account Product Template */
  @Input() loansAccountProductTemplate: any;
  /** Loans Account Data */
  @Input() loansAccount: any;
  /** active Client Members in case of GLIM Account */
  @Input() activeClientMembers?: any;
  @Input() loanProductsBasicDetails: LoanProductBasicDetails[];

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

  constructor() {
    super();
  }

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

  loanProductName(id: number): string {
    const productType: string = this.loanProductService.productType.value;
    const product = this.loanProductsBasicDetails.find((p) => p.productType === productType && p.id === id);
    return product?.name ?? '';
  }

  loanProductType(): string {
    return this.loanProductService.loanProductTypeLabel;
  }

  fundName(fundId: number): string {
    const fundOptions = this.loanProductService.isLoanProduct
      ? this.loansAccountProductTemplate.fundOptions
      : this.loansAccountProductTemplate.options.fundOptions;
    const fund = fundOptions.find((fund: any) => fund.id === fundId);
    return fund ? fund.name : '';
  }

  camalize(word: string) {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  getBreach(breachId: number | null | undefined): Breach | null {
    if (breachId === null || breachId === undefined) {
      return null;
    }
    return this.loansAccountProductTemplate.options.breachOptions?.find((b: Breach) => b.id === breachId) || null;
  }

  getNearBreach(nearBreachId: number | null | undefined): NearBreach | null {
    if (nearBreachId === null || nearBreachId === undefined) {
      return null;
    }
    return (
      this.loansAccountProductTemplate.options.nearBreachOptions?.find((b: NearBreach) => b.id === nearBreachId) || null
    );
  }
}
