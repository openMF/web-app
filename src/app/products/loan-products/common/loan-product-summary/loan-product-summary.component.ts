import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DelinquencyBucket, LoanProduct } from '../../models/loan-product.model';
import {
  AccountingMapping,
  Charge,
  ChargeOffReasonCodeValue,
  ChargeOffReasonToExpenseAccountMapping,
  ChargeToIncomeAccountMapping,
  GLAccount,
  PaymentChannelToFundSourceMapping,
  PaymentType,
  PaymentTypeOption
} from '../../../../shared/models/general.model';
import {
  AdvancePaymentAllocationData,
  CreditAllocation,
  PaymentAllocation
} from '../../loan-product-stepper/loan-product-payment-strategy-step/payment-allocation-model';
import { LoanProducts } from '../../loan-products';
import { CodeName, OptionData, StringEnumOptionData } from '../../../../shared/models/option-data.model';
import { Accounting } from 'app/core/utils/accounting';
import { DecimalPipe } from '@angular/common';
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
import { MatAccordion } from '@angular/material/expansion';
import { ViewAdvancePaymenyAllocationComponent } from '../../view-loan-product/shared/view-advance-paymeny-allocation/view-advance-paymeny-allocation.component';
import { GlAccountDisplayComponent } from '../../../../shared/accounting/gl-account-display/gl-account-display.component';
import { ChargesPenaltyFilterPipe } from '../../../../pipes/charges-penalty-filter.pipe';
import { DateFormatPipe } from '../../../../pipes/date-format.pipe';
import { FormatNumberPipe } from '../../../../pipes/format-number.pipe';
import { YesnoPipe } from '../../../../pipes/yesno.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-loan-product-summary',
  templateUrl: './loan-product-summary.component.html',
  styleUrls: ['./loan-product-summary.component.scss'],
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
    MatAccordion,
    ViewAdvancePaymenyAllocationComponent,
    GlAccountDisplayComponent,
    DecimalPipe,
    ChargesPenaltyFilterPipe,
    DateFormatPipe,
    FormatNumberPipe,
    YesnoPipe
  ]
})
export class LoanProductSummaryComponent implements OnInit, OnChanges {
  @Input() action: string;
  @Input() loanProduct: LoanProduct;
  @Input() loanProductsTemplate: any | null;
  @Input() useDueForRepaymentsConfigurations: boolean;
  @Input() paymentAllocations: PaymentAllocation | null;
  @Input() creditAllocations: CreditAllocation | null;
  @Input() supportedInterestRefundTypes: StringEnumOptionData[] | null;

  variationsDisplayedColumns: string[] = [
    'valueConditionType',
    'borrowerCycleNumber',
    'minValue',
    'defaultValue',
    'maxValue'
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
  chargeOffReasonExpenseDisplayedColumns: string[] = [
    'chargeOffReasonCodeValueId',
    'expenseAccountId'
  ];
  accountingRuleData: string[] = [];

  isAdvancedPaymentAllocation = false;

  advancePaymentAllocationData: AdvancePaymentAllocationData;

  accountingMappings: any = {};
  paymentChannelToFundSourceMappings: PaymentChannelToFundSourceMapping[] = [];
  feeToIncomeAccountMappings: ChargeToIncomeAccountMapping[] = [];
  penaltyToIncomeAccountMappings: ChargeToIncomeAccountMapping[] = [];
  chargeOffReasonToExpenseAccountMappings: ChargeOffReasonToExpenseAccountMapping[] = [];

  constructor(private accounting: Accounting) {}

  ngOnInit() {
    this.accountingRuleData = this.accounting.getAccountingRulesForLoans();
    this.setCurrentValues();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.setCurrentValues();
  }

  setCurrentValues(): void {
    this.isAdvancedPaymentAllocation = LoanProducts.isAdvancedPaymentAllocationStrategy(
      this.loanProduct.transactionProcessingStrategyCode
    );

    if (!this.loanProduct.currency) {
      this.loanProductsTemplate.currencyOptions.some((o: any) => {
        if (o.code === this.loanProduct.currencyCode) {
          this.loanProduct.currency = o;
        }
      });
    }

    if (this.action === 'view') {
      this.accountingMappings = this.loanProduct.accountingMappings;
      this.paymentChannelToFundSourceMappings = this.loanProduct.paymentChannelToFundSourceMappings || [];
      this.feeToIncomeAccountMappings = this.loanProduct.feeToIncomeAccountMappings || [];
      this.penaltyToIncomeAccountMappings = this.loanProduct.penaltyToIncomeAccountMappings || [];
      this.chargeOffReasonToExpenseAccountMappings = this.loanProduct.chargeOffReasonToExpenseAccountMappings || [];
    } else {
      this.accountingMappings = {};

      if (
        (this.loanProduct.accountingRule && this.loanProduct.accountingRule > 1) ||
        this.loanProductsTemplate.accountingRule.value !== 'NONE'
      ) {
        const assetAccountData = this.loanProductsTemplate.accountingMappingOptions.assetAccountOptions || [];
        const incomeAccountData = this.loanProductsTemplate.accountingMappingOptions.incomeAccountOptions || [];
        const expenseAccountData = this.loanProductsTemplate.accountingMappingOptions.expenseAccountOptions || [];
        const liabilityAccountData = this.loanProductsTemplate.accountingMappingOptions.liabilityAccountOptions || [];
        const assetAndLiabilityAccountData =
          this.loanProductsTemplate.accountingMappingOptions.assetAndLiabilityAccountOptions || [];
        const chargeOffReasonOptions: any = this.loanProductsTemplate.chargeOffReasonOptions || [];

        this.accountingMappings = {
          fundSourceAccount: this.glAccountLookUp(this.loanProduct.fundSourceAccountId, assetAndLiabilityAccountData),
          loanPortfolioAccount: this.glAccountLookUp(this.loanProduct.loanPortfolioAccountId, assetAccountData),
          receivableInterestAccount: this.glAccountLookUp(
            this.loanProduct.receivableInterestAccountId,
            assetAccountData
          ),
          receivableFeeAccount: this.glAccountLookUp(this.loanProduct.receivableFeeAccountId, assetAccountData),
          receivablePenaltyAccount: this.glAccountLookUp(this.loanProduct.receivablePenaltyAccountId, assetAccountData),
          transfersInSuspenseAccount: this.glAccountLookUp(
            this.loanProduct.transfersInSuspenseAccountId,
            assetAccountData
          ),

          interestOnLoanAccount: this.glAccountLookUp(this.loanProduct.interestOnLoanAccountId, incomeAccountData),
          incomeFromFeeAccount: this.glAccountLookUp(this.loanProduct.incomeFromFeeAccountId, incomeAccountData),
          incomeFromPenaltyAccount: this.glAccountLookUp(
            this.loanProduct.incomeFromPenaltyAccountId,
            incomeAccountData
          ),
          incomeFromRecoveryAccount: this.glAccountLookUp(
            this.loanProduct.incomeFromRecoveryAccountId,
            incomeAccountData
          ),
          incomeFromChargeOffInterestAccount: this.glAccountLookUp(
            this.loanProduct.incomeFromChargeOffInterestAccountId,
            incomeAccountData
          ),
          incomeFromChargeOffFeesAccount: this.glAccountLookUp(
            this.loanProduct.incomeFromChargeOffFeesAccountId,
            incomeAccountData
          ),
          incomeFromChargeOffPenaltyAccount: this.glAccountLookUp(
            this.loanProduct.incomeFromChargeOffPenaltyAccountId,
            incomeAccountData
          ),
          incomeFromCapitalizationAccount: this.glAccountLookUp(
            this.loanProduct.incomeFromCapitalizationAccountId,
            incomeAccountData
          ),
          incomeFromBuyDownAccount: this.glAccountLookUp(
            this.loanProduct.incomeFromBuyDownAccountId,
            incomeAccountData
          ),

          writeOffAccount: this.glAccountLookUp(this.loanProduct.writeOffAccountId, expenseAccountData),
          goodwillCreditAccount: this.glAccountLookUp(this.loanProduct.goodwillCreditAccountId, expenseAccountData),
          chargeOffExpenseAccount: this.glAccountLookUp(this.loanProduct.writeOffAccountId, expenseAccountData),
          chargeOffFraudExpenseAccount: this.glAccountLookUp(this.loanProduct.writeOffAccountId, expenseAccountData),
          buyDownExpenseAccount: this.glAccountLookUp(this.loanProduct.buyDownExpenseAccountId, expenseAccountData),

          overpaymentLiabilityAccount: this.glAccountLookUp(
            this.loanProduct.overpaymentLiabilityAccountId,
            liabilityAccountData
          ),
          deferredIncomeLiabilityAccount: this.glAccountLookUp(
            this.loanProduct.deferredIncomeLiabilityAccountId,
            liabilityAccountData
          )
        };

        this.paymentChannelToFundSourceMappings = [];
        if (this.loanProduct.paymentChannelToFundSourceMappings?.length > 0) {
          const paymentTypesData = this.loanProductsTemplate.paymentTypeOptions || [];
          this.loanProduct.paymentChannelToFundSourceMappings.forEach((m: any) => {
            this.paymentChannelToFundSourceMappings.push({
              fundSourceAccount: this.glAccountLookUp(m.fundSourceAccountId, assetAndLiabilityAccountData),
              paymentType: this.paymentTypeLookUp(m.paymentTypeId, paymentTypesData)
            });
          });
        }

        this.feeToIncomeAccountMappings = [];
        if (this.loanProduct.feeToIncomeAccountMappings?.length > 0) {
          this.loanProduct.feeToIncomeAccountMappings.forEach((m: any) => {
            this.feeToIncomeAccountMappings.push({
              incomeAccount: this.glAccountLookUp(m.incomeAccountId, incomeAccountData),
              charge: this.chargeLookUp(m.chargeId, this.loanProductsTemplate.chargeOptions)
            });
          });
        }

        this.penaltyToIncomeAccountMappings = [];
        if (this.loanProduct.penaltyToIncomeAccountMappings?.length > 0) {
          this.loanProduct.penaltyToIncomeAccountMappings.forEach((m: any) => {
            this.penaltyToIncomeAccountMappings.push({
              incomeAccount: this.glAccountLookUp(m.incomeAccountId, incomeAccountData),
              charge: this.chargeLookUp(m.chargeId, this.loanProductsTemplate.penaltyOptions)
            });
          });
        }

        this.chargeOffReasonToExpenseAccountMappings = [];
        if (this.loanProduct.chargeOffReasonToExpenseAccountMappings?.length > 0) {
          this.loanProduct.chargeOffReasonToExpenseAccountMappings.forEach(
            (m: ChargeOffReasonToExpenseAccountMapping) => {
              let optionData = this.optionDataLookUp(m.chargeOffReasonCodeValueId, chargeOffReasonOptions);
              this.chargeOffReasonToExpenseAccountMappings.push({
                expenseAccount: this.glAccountLookUp(m.expenseAccountId, expenseAccountData),
                chargeOffReasonCodeValue: {
                  id: optionData.id,
                  name: optionData.value
                } as ChargeOffReasonCodeValue
              });
            }
          );
        }
      }

      if (this.loanProduct.isInterestRecalculationEnabled) {
        this.loanProduct.interestRecalculationData = {
          interestRecalculationCompoundingType: this.optionDataLookUp(
            this.loanProduct.interestRecalculationCompoundingMethod,
            this.loanProductsTemplate.interestRecalculationCompoundingTypeOptions
          ),
          rescheduleStrategyType: this.optionDataLookUp(
            this.loanProduct.rescheduleStrategyMethod,
            this.loanProductsTemplate.rescheduleStrategyTypeOptions
          ),
          recalculationCompoundingFrequencyType: this.optionDataLookUp(
            this.loanProduct.recalculationCompoundingFrequencyType,
            this.loanProductsTemplate.interestRecalculationFrequencyTypeOptions
          ),
          recalculationRestFrequencyType: this.optionDataLookUp(
            this.loanProduct.recalculationRestFrequencyType,
            this.loanProductsTemplate.interestRecalculationFrequencyTypeOptions
          ),
          preClosureInterestCalculationStrategy: this.optionDataLookUp(
            this.loanProduct.preClosureInterestCalculationStrategy,
            this.loanProductsTemplate.preClosureInterestCalculationStrategyOptions
          ),
          allowCompoundingOnEod: this.loanProduct.allowCompoundingOnEod,
          isArrearsBasedOnOriginalSchedule: this.loanProduct.isArrearsBasedOnOriginalSchedule,
          isCompoundingToBePostedAsTransaction: this.loanProduct.isCompoundingToBePostedAsTransaction,
          recalculationRestFrequencyInterval: this.loanProduct.recalculationRestFrequencyInterval,
          disallowInterestCalculationOnPastDue: this.loanProduct.disallowInterestCalculationOnPastDue
        };
      }

      let optionValue: OptionData = this.optionDataLookUp(
        this.loanProduct.amortizationType,
        this.loanProductsTemplate.amortizationTypeOptions
      );
      this.loanProduct.amortizationType = optionValue;

      optionValue = this.optionDataLookUp(this.loanProduct.interestType, this.loanProductsTemplate.interestTypeOptions);
      this.loanProduct.interestType = optionValue;

      optionValue = this.optionDataLookUp(
        this.loanProduct.interestCalculationPeriodType,
        this.loanProductsTemplate.interestCalculationPeriodTypeOptions
      );
      this.loanProduct.interestCalculationPeriodType = optionValue;

      if (!this.loanProduct.repaymentFrequencyType || !this.loanProduct.repaymentFrequencyType.value) {
        optionValue = this.optionDataLookUp(
          this.loanProduct.repaymentFrequencyType,
          this.loanProductsTemplate.repaymentFrequencyTypeOptions
        );
        this.loanProduct.repaymentFrequencyType = optionValue;
      }

      optionValue = this.optionDataLookUp(
        this.loanProduct.daysInMonthType,
        this.loanProductsTemplate.daysInMonthTypeOptions
      );
      this.loanProduct.daysInMonthType = optionValue;
      optionValue = this.optionDataLookUp(
        this.loanProduct.daysInYearType,
        this.loanProductsTemplate.daysInYearTypeOptions
      );
      this.loanProduct.daysInYearType = optionValue;
      if (this.isAdvancedPaymentAllocation && this.loanProduct.daysInYearType?.id == 1) {
        optionValue = this.optionDataLookUp(
          this.loanProduct.daysInYearCustomStrategy,
          this.loanProductsTemplate.daysInYearCustomStrategyOptions
        );
      }
      this.loanProduct.daysInYearCustomStrategy = optionValue;
      if (this.isAdvancedPaymentAllocation && this.loanProduct.enableIncomeCapitalization) {
        optionValue = this.optionDataLookUp(
          this.loanProduct.capitalizedIncomeCalculationType,
          this.loanProductsTemplate.capitalizedIncomeCalculationTypeOptions
        );
        this.loanProduct.capitalizedIncomeCalculationType = optionValue;
        optionValue = this.optionDataLookUp(
          this.loanProduct.capitalizedIncomeStrategy,
          this.loanProductsTemplate.capitalizedIncomeStrategyOptions
        );
        this.loanProduct.capitalizedIncomeStrategy = optionValue;
        optionValue = this.optionDataLookUp(
          this.loanProduct.capitalizedIncomeType,
          this.loanProductsTemplate.capitalizedIncomeTypeOptions
        );
        this.loanProduct.capitalizedIncomeType = optionValue;
      }
      if (this.isAdvancedPaymentAllocation && this.loanProduct.enableBuyDownFee) {
        optionValue = this.optionDataLookUp(
          this.loanProduct.buyDownFeeCalculationType,
          this.loanProductsTemplate.buyDownFeeCalculationTypeOptions
        );
        this.loanProduct.buyDownFeeCalculationType = optionValue;
        optionValue = this.optionDataLookUp(
          this.loanProduct.buyDownFeeStrategy,
          this.loanProductsTemplate.buyDownFeeStrategyOptions
        );
        this.loanProduct.buyDownFeeStrategy = optionValue;
        optionValue = this.optionDataLookUp(
          this.loanProduct.buyDownFeeIncomeType,
          this.loanProductsTemplate.buyDownFeeIncomeTypeOptions
        );
        this.loanProduct.buyDownFeeIncomeType = optionValue;
      }
      optionValue = this.optionDataLookUp(
        this.loanProduct.interestRateFrequencyType,
        this.loanProductsTemplate.interestRateFrequencyTypeOptions
      );
      this.loanProduct.interestRateFrequencyType = optionValue;

      optionValue = this.optionDataLookUp(
        this.loanProduct.repaymentStartDateType,
        this.loanProductsTemplate.repaymentStartDateTypeOptions
      );
      this.loanProduct.repaymentStartDateType = optionValue;

      if (this.loanProduct.delinquencyBucketId) {
        this.loanProduct.delinquencyBucket = this.delinquencyBucketLookUp(
          this.loanProduct.delinquencyBucketId,
          this.loanProductsTemplate.delinquencyBucketOptions
        );
      }

      const codeValue: CodeName = this.codeNameLookUpByCode(
        this.loanProduct.transactionProcessingStrategyCode,
        this.loanProductsTemplate.transactionProcessingStrategyOptions
      );
      this.loanProduct.transactionProcessingStrategyName = codeValue.name;

      if (!this.loanProduct.loanScheduleType || !this.loanProduct.loanScheduleType.value) {
        this.loanProduct.loanScheduleType = this.optionDataLookUpByCode(
          this.loanProduct.loanScheduleType,
          this.loanProductsTemplate.loanScheduleTypeOptions
        );
      }

      if (this.isAdvancedPaymentAllocation) {
        if (!this.loanProduct.loanScheduleProcessingType || !this.loanProduct.loanScheduleProcessingType.value) {
          this.loanProduct.loanScheduleProcessingType = this.optionDataLookUpByCode(
            this.loanProduct.loanScheduleProcessingType,
            this.loanProductsTemplate.loanScheduleProcessingTypeOptions
          );
        }
        if (!this.loanProduct.chargeOffBehaviour.value) {
          this.loanProduct.chargeOffBehaviour = this.stringEnumOptionDataLookUp(
            this.loanProduct.chargeOffBehaviour,
            this.loanProductsTemplate.chargeOffBehaviourOptions
          );
        }
      }
    }

    if (this.loanProduct.advancedPaymentAllocationTransactionTypes) {
      const advancedAllocationTransactionTypes: OptionData[] =
        this.loanProduct.advancedPaymentAllocationTransactionTypes.concat(
          this.loanProduct.creditAllocationTransactionTypes
        );
      const advancedPaymentAllocationTypes: OptionData[] = this.loanProduct.advancedPaymentAllocationTypes.concat(
        this.loanProduct.creditAllocationAllocationTypes
      );
      this.advancePaymentAllocationData = {
        transactionTypes: advancedAllocationTransactionTypes,
        allocationTypes: advancedPaymentAllocationTypes,
        futureInstallmentAllocationRules: this.loanProduct.advancedPaymentAllocationFutureInstallmentAllocationRules
      };
    } else {
      const advancedAllocationTransactionTypes: OptionData[] =
        this.loanProductsTemplate.advancedPaymentAllocationTransactionTypes.concat(
          this.loanProductsTemplate.creditAllocationTransactionTypes
        );
      const advancedPaymentAllocationTypes: OptionData[] =
        this.loanProductsTemplate.advancedPaymentAllocationTypes.concat(
          this.loanProductsTemplate.creditAllocationAllocationTypes
        );
      this.advancePaymentAllocationData = {
        transactionTypes: advancedAllocationTransactionTypes,
        allocationTypes: advancedPaymentAllocationTypes,
        futureInstallmentAllocationRules:
          this.loanProductsTemplate.advancedPaymentAllocationFutureInstallmentAllocationRules
      };
    }
  }

  optionDataLookUp(itemId: any, optionsData: any[]): OptionData {
    let optionData: OptionData | null;
    optionsData.some((o: any) => {
      if (o.id === itemId) {
        optionData = {
          id: o.id,
          code: o.code,
          value: o.value || o.name
        };
      }
    });
    return optionData;
  }

  stringEnumOptionDataLookUp(itemId: any, optionsData: any[]): StringEnumOptionData {
    let optionData: StringEnumOptionData | null;
    optionsData.some((o: any) => {
      if (o.id === itemId) {
        optionData = {
          id: o.id,
          code: o.code,
          value: o.value
        };
      }
    });
    return optionData;
  }

  optionDataLookUpByCode(currentValue: any, optionsData: any[]): OptionData {
    let optionData: OptionData | null;
    optionsData.some((o: any) => {
      if (o.code === currentValue) {
        optionData = {
          id: o.id || 0,
          code: o.code,
          value: o.value || o.name
        };
      }
    });
    return optionData;
  }

  codeNameLookUpByCode(currentValue: any, optionsData: any[]): CodeName {
    let optionData: CodeName | null;
    optionsData.some((o: any) => {
      if (o.code === currentValue) {
        optionData = {
          code: o.code,
          name: o.name
        };
      }
    });
    return optionData;
  }

  glAccountLookUp(glAccountId: number, glAccounts: GLAccount[]): AccountingMapping {
    let accountMapping: AccountingMapping | null = null;
    if (glAccountId) {
      glAccounts.some((glAccount: GLAccount) => {
        if (glAccount.id === glAccountId) {
          accountMapping = { id: glAccount.id, name: glAccount.name, glCode: glAccount.glCode };
        }
      });
    }
    return accountMapping;
  }

  chargeLookUp(chargeId: number, charges: Charge[]): Charge {
    let chargeData: Charge | null = null;
    if (chargeId) {
      charges.some((charge: Charge) => {
        if (charge.id === chargeId) {
          chargeData = { id: charge.id, name: charge.name, penalty: charge.penalty };
        }
      });
    }
    return chargeData;
  }

  paymentTypeLookUp(paymentTypeId: number, paymentTypes: PaymentTypeOption[]): PaymentType {
    let paymentType: PaymentType | null = null;
    if (paymentTypeId) {
      paymentTypes.some((payment: any) => {
        if (payment.id === paymentTypeId) {
          paymentType = {
            id: payment.id,
            name: payment.name,
            isSystemDefined: false
          };
        }
      });
    }
    return paymentType;
  }

  delinquencyBucketLookUp(delinquencyBucketId: any, delinquencyBuckets: DelinquencyBucket[]): DelinquencyBucket {
    let delinquencyBucketData: DelinquencyBucket | null = null;
    if (delinquencyBucketId) {
      delinquencyBuckets.some((delinquencyBucket: DelinquencyBucket) => {
        if (delinquencyBucket.id === delinquencyBucketId) {
          delinquencyBucketData = { id: delinquencyBucket.id, name: delinquencyBucket.name };
        }
      });
    }
    return delinquencyBucketData;
  }

  accountingRule(): number {
    return this.loanProduct.accountingRule.id ? this.loanProduct.accountingRule.id : this.loanProduct.accountingRule;
  }

  get isAccountingAccrualBased(): boolean {
    return this.accountingRule() === 3 || this.accountingRule() === 4;
  }

  isAccountingEnabled(): boolean {
    return this.accountingRule() >= 2;
  }

  isAdvancedAccountingEnabled(): boolean {
    return (
      this.loanProduct.paymentChannelToFundSourceMappings?.length > 0 ||
      this.loanProduct.feeToIncomeAccountMappings?.length > 0 ||
      this.loanProduct.penaltyToIncomeAccountMappings?.length > 0 ||
      this.loanProduct.chargeOffReasonToExpenseAccountMappings?.length > 0
    );
  }

  getAccountingRuleName(value: string): string {
    return this.accounting.getAccountRuleName(value.toUpperCase());
  }

  mapHumanReadableValueStringEnumOptionDataList(incomingParameter: StringEnumOptionData[]): string[] {
    return incomingParameter.map((v) => v.value);
  }
}
