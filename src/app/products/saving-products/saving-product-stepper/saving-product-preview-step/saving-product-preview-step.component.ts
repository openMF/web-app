import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Accounting } from 'app/core/utils/accounting';
import { OptionData } from 'app/shared/models/option-data.model';
import { MatDivider } from '@angular/material/divider';
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
import { ViewSavingsAccountingDetailsComponent } from '../../../../shared/accounting/view-savings-accounting-details/view-savings-accounting-details.component';
import { MatStepperPrevious } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { FindPipe } from '../../../../pipes/find.pipe';
import { FormatNumberPipe } from '../../../../pipes/format-number.pipe';
import { YesnoPipe } from '../../../../pipes/yesno.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-saving-product-preview-step',
  templateUrl: './saving-product-preview-step.component.html',
  styleUrls: ['./saving-product-preview-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
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
    ViewSavingsAccountingDetailsComponent,
    MatStepperPrevious,
    FaIconComponent,
    FindPipe,
    FormatNumberPipe,
    YesnoPipe
  ]
})
export class SavingProductPreviewStepComponent implements OnInit, OnChanges {
  @Input() savingProductsTemplate: any;
  @Input() accountingRuleData: any;
  @Input() savingProduct: any;
  @Input() taskPermission: string;
  @Output() submitEvent = new EventEmitter();

  chargesDisplayedColumns: string[] = [
    'name',
    'chargeCalculationType',
    'amount',
    'chargeTimeType'
  ];
  paymentFundSourceDisplayedColumns: string[] = [
    'paymentTypeId',
    'fundSourceAccountId'
  ];
  feesPenaltyIncomeDisplayedColumns: string[] = [
    'chargeId',
    'incomeAccountId'
  ];

  accountingMappings: any = {};
  accountingRule: OptionData;

  constructor(private accounting: Accounting) {}

  ngOnInit() {
    this.setCurrentValues();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.setCurrentValues();
  }

  setCurrentValues(): void {
    this.accountingRule = this.accounting.getAccountingRuleFrom(this.savingProduct.accountingRule);

    if (this.isCashOrAccrualAccounting()) {
      const assetAccountData = this.savingProductsTemplate.accountingMappingOptions.assetAccountOptions || [];
      const incomeAccountData = this.savingProductsTemplate.accountingMappingOptions.incomeAccountOptions || [];
      const expenseAccountData = this.savingProductsTemplate.accountingMappingOptions.expenseAccountOptions || [];
      const liabilityAccountData = this.savingProductsTemplate.accountingMappingOptions.liabilityAccountOptions || [];

      this.accountingMappings = {
        savingsReferenceAccount: this.accounting.glAccountLookUp(
          this.savingProduct.savingsReferenceAccountId,
          assetAccountData
        ),
        overdraftPortfolioControl: this.accounting.glAccountLookUp(
          this.savingProduct.overdraftPortfolioControlId,
          assetAccountData
        ),
        savingsControlAccount: this.accounting.glAccountLookUp(
          this.savingProduct.savingsControlAccountId,
          liabilityAccountData
        ),
        transfersInSuspenseAccount: this.accounting.glAccountLookUp(
          this.savingProduct.transfersInSuspenseAccountId,
          liabilityAccountData
        ),
        escheatLiability: this.accounting.glAccountLookUp(this.savingProduct.escheatLiabilityId, liabilityAccountData),
        interestOnSavingsAccount: this.accounting.glAccountLookUp(
          this.savingProduct.interestOnSavingsAccountId,
          expenseAccountData
        ),
        writeOffAccount: this.accounting.glAccountLookUp(this.savingProduct.writeOffAccountId, expenseAccountData),
        incomeFromFeeAccount: this.accounting.glAccountLookUp(
          this.savingProduct.incomeFromFeeAccountId,
          incomeAccountData
        ),
        incomeFromPenaltyAccount: this.accounting.glAccountLookUp(
          this.savingProduct.incomeFromPenaltyAccountId,
          incomeAccountData
        ),
        incomeFromInterest: this.accounting.glAccountLookUp(this.savingProduct.incomeFromInterestId, incomeAccountData)
      };

      if (this.isAccrualAccounting()) {
        this.accountingMappings['feesReceivableAccount'] = this.accounting.glAccountLookUp(
          this.savingProduct.feesReceivableAccountId,
          assetAccountData
        );
        this.accountingMappings['penaltiesReceivableAccount'] = this.accounting.glAccountLookUp(
          this.savingProduct.penaltiesReceivableAccountId,
          assetAccountData
        );
        this.accountingMappings['interestPayableAccount'] = this.accounting.glAccountLookUp(
          this.savingProduct.interestPayableAccountId,
          liabilityAccountData
        );
      }
    }
  }

  isCashOrAccrualAccounting(): boolean {
    return this.accounting.isCashOrAccrualAccounting(this.accountingRule);
  }

  isAccrualAccounting(): boolean {
    return this.accounting.isAccrualAccounting(this.accountingRule);
  }
}
