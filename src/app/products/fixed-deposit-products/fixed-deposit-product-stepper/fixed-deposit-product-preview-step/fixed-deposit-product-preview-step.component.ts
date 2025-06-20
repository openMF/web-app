import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { trigger, state, transition, animate, style } from '@angular/animations';
import { Accounting } from 'app/core/utils/accounting';
import { OptionData } from 'app/shared/models/option-data.model';
import { MatDivider } from '@angular/material/divider';
import { NgIf, NgFor, NgSwitch, NgSwitchCase } from '@angular/common';
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
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { ViewSavingsAccountingDetailsComponent } from '../../../../shared/accounting/view-savings-accounting-details/view-savings-accounting-details.component';
import { MatStepperPrevious } from '@angular/material/stepper';
import { FindPipe } from '../../../../pipes/find.pipe';
import { DateFormatPipe } from '../../../../pipes/date-format.pipe';
import { FormatNumberPipe } from '../../../../pipes/format-number.pipe';
import { YesnoPipe } from '../../../../pipes/yesno.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-fixed-deposit-product-preview-step',
  templateUrl: './fixed-deposit-product-preview-step.component.html',
  styleUrls: ['./fixed-deposit-product-preview-step.component.scss'],
  animations: [
    trigger('expandChartSlab', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))])

  ],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDivider,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    FaIconComponent,
    NgSwitch,
    NgSwitchCase,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    ViewSavingsAccountingDetailsComponent,
    MatStepperPrevious,
    FindPipe,
    DateFormatPipe,
    FormatNumberPipe,
    YesnoPipe
  ]
})
export class FixedDepositProductPreviewStepComponent implements OnInit, OnChanges {
  @Input() fixedDepositProductsTemplate: any;
  @Input() chartSlabsDisplayedColumns: any[];
  @Input() accountingRuleData: any;
  @Input() fixedDepositProduct: any;
  @Output() submitEvent = new EventEmitter();

  chartSlabsIncentivesDisplayedColumns: string[] = ['incentives'];
  incentivesDisplayedColumns: string[] = [
    'entityType',
    'attributeName',
    'conditionType',
    'attributeValue',
    'incentiveType',
    'amount'
  ];
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

  expandChartSlabIndex: number[] = [];

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
    if (this.isCashOrAccrualAccounting()) {
      this.accountingRule = this.accounting.getAccountingRuleFrom(this.fixedDepositProduct.accountingRule);

      const assetAccountData = this.fixedDepositProductsTemplate.accountingMappingOptions.assetAccountOptions || [];
      const incomeAccountData = this.fixedDepositProductsTemplate.accountingMappingOptions.incomeAccountOptions || [];
      const expenseAccountData = this.fixedDepositProductsTemplate.accountingMappingOptions.expenseAccountOptions || [];
      const liabilityAccountData =
        this.fixedDepositProductsTemplate.accountingMappingOptions.liabilityAccountOptions || [];

      this.accountingMappings = {
        savingsReferenceAccount: this.accounting.glAccountLookUp(
          this.fixedDepositProduct.savingsReferenceAccountId,
          assetAccountData
        ),
        savingsControlAccount: this.accounting.glAccountLookUp(
          this.fixedDepositProduct.savingsControlAccountId,
          liabilityAccountData
        ),
        transfersInSuspenseAccount: this.accounting.glAccountLookUp(
          this.fixedDepositProduct.transfersInSuspenseAccountId,
          liabilityAccountData
        ),
        interestOnSavingsAccount: this.accounting.glAccountLookUp(
          this.fixedDepositProduct.interestOnSavingsAccountId,
          expenseAccountData
        ),
        incomeFromFeeAccount: this.accounting.glAccountLookUp(
          this.fixedDepositProduct.incomeFromFeeAccountId,
          incomeAccountData
        ),
        incomeFromPenaltyAccount: this.accounting.glAccountLookUp(
          this.fixedDepositProduct.incomeFromPenaltyAccountId,
          incomeAccountData
        )
      };

      if (this.isAccrualAccounting()) {
        this.accountingMappings['feeReceivableAccount'] = this.accounting.glAccountLookUp(
          this.fixedDepositProduct.feesReceivableAccountId,
          assetAccountData
        );
        this.accountingMappings['penaltyReceivableAccount'] = this.accounting.glAccountLookUp(
          this.fixedDepositProduct.penaltiesReceivableAccountId,
          assetAccountData
        );
        this.accountingMappings['interestPayableAccount'] = this.accounting.glAccountLookUp(
          this.fixedDepositProduct.interestPayableAccountId,
          liabilityAccountData
        );
      }
    }
  }

  isNoneAccounting(): boolean {
    return this.accounting.isNoneAccountingRuleId(this.fixedDepositProduct.accountingRule);
  }

  isCashOrAccrualAccounting(): boolean {
    return this.accounting.isCashOrAccrualAccountingRuleId(this.fixedDepositProduct.accountingRule);
  }

  isAccrualAccounting(): boolean {
    return this.accounting.isAccrualAccountingRuleId(this.fixedDepositProduct.accountingRule);
  }
}
