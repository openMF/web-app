import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { trigger, state, transition, animate, style } from '@angular/animations';
import { OptionData } from 'app/shared/models/option-data.model';
import { Accounting } from 'app/core/utils/accounting';

@Component({
  selector: 'mifosx-recurring-deposit-product-preview-step',
  templateUrl: './recurring-deposit-product-preview-step.component.html',
  styleUrls: ['./recurring-deposit-product-preview-step.component.scss'],
  animations: [
    trigger('expandChartSlab', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))])

  ]
})
export class RecurringDepositProductPreviewStepComponent implements OnInit, OnChanges {
  @Input() recurringDepositProductsTemplate: any;
  @Input() chartSlabsDisplayedColumns: any[];
  @Input() accountingRuleData: any;
  @Input() recurringDepositProduct: any;
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
      this.accountingRule = this.accounting.getAccountingRuleFrom(this.recurringDepositProduct.accountingRule);

      const assetAccountData = this.recurringDepositProductsTemplate.accountingMappingOptions.assetAccountOptions || [];
      const incomeAccountData =
        this.recurringDepositProductsTemplate.accountingMappingOptions.incomeAccountOptions || [];
      const expenseAccountData =
        this.recurringDepositProductsTemplate.accountingMappingOptions.expenseAccountOptions || [];
      const liabilityAccountData =
        this.recurringDepositProductsTemplate.accountingMappingOptions.liabilityAccountOptions || [];

      this.accountingMappings = {
        savingsReferenceAccount: this.accounting.glAccountLookUp(
          this.recurringDepositProduct.savingsReferenceAccountId,
          assetAccountData
        ),
        savingsControlAccount: this.accounting.glAccountLookUp(
          this.recurringDepositProduct.savingsControlAccountId,
          liabilityAccountData
        ),
        transfersInSuspenseAccount: this.accounting.glAccountLookUp(
          this.recurringDepositProduct.transfersInSuspenseAccountId,
          liabilityAccountData
        ),
        interestOnSavingsAccount: this.accounting.glAccountLookUp(
          this.recurringDepositProduct.interestOnSavingsAccountId,
          expenseAccountData
        ),
        incomeFromFeeAccount: this.accounting.glAccountLookUp(
          this.recurringDepositProduct.incomeFromFeeAccountId,
          incomeAccountData
        ),
        incomeFromPenaltyAccount: this.accounting.glAccountLookUp(
          this.recurringDepositProduct.incomeFromPenaltyAccountId,
          incomeAccountData
        )
      };

      if (this.isAccrualAccounting()) {
        this.accountingMappings['feeReceivableAccount'] = this.accounting.glAccountLookUp(
          this.recurringDepositProduct.feesReceivableAccountId,
          assetAccountData
        );
        this.accountingMappings['penaltyReceivableAccount'] = this.accounting.glAccountLookUp(
          this.recurringDepositProduct.penaltiesReceivableAccountId,
          assetAccountData
        );
        this.accountingMappings['interestPayableAccount'] = this.accounting.glAccountLookUp(
          this.recurringDepositProduct.interestPayableAccountId,
          liabilityAccountData
        );
      }
    }
  }

  isNoneAccounting(): boolean {
    return this.accounting.isNoneAccountingRuleId(this.recurringDepositProduct.accountingRule);
  }

  isCashOrAccrualAccounting(): boolean {
    return this.accounting.isCashOrAccrualAccountingRuleId(this.recurringDepositProduct.accountingRule);
  }

  isAccrualAccounting(): boolean {
    return this.accounting.isAccrualAccountingRuleId(this.recurringDepositProduct.accountingRule);
  }
}
