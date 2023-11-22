import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { LoanProduct } from '../../models/loan-product.model';
import { AccountingMapping, Charge, ChargeToIncomeAccountMapping, GLAccount, PaymentChannelToFundSourceMapping, PaymentType, PaymentTypeOption } from '../../../../shared/models/general.model';
import { AdvancePaymentAllocationData, PaymentAllocation } from '../../loan-product-stepper/loan-product-payment-strategy-step/payment-allocation-model';
import { LoanProducts } from '../../loan-products';
import { OptionData } from '../../../../shared/models/option-data.model';

@Component({
  selector: 'mifosx-loan-product-summary',
  templateUrl: './loan-product-summary.component.html',
  styleUrls: ['./loan-product-summary.component.scss']
})
export class LoanProductSummaryComponent implements OnInit, OnChanges {

  @Input() loanProduct: LoanProduct;
  @Input() loanProductsTemplate: any | null;
  @Input() useDueForRepaymentsConfigurations: boolean;
  @Input() paymentAllocations: PaymentAllocation | null;

  variationsDisplayedColumns: string[] = ['valueConditionType', 'borrowerCycleNumber', 'minValue', 'defaultValue', 'maxValue'];
  chargesDisplayedColumns: string[] = ['name', 'chargeCalculationType', 'amount', 'chargeTimeType'];
  paymentFundSourceDisplayedColumns: string[] = ['paymentTypeId', 'fundSourceAccountId'];
  feesPenaltyIncomeDisplayedColumns: string[] = ['chargeId', 'incomeAccountId'];
  accountingRuleData = ['None', 'Cash', 'Accrual (periodic)', 'Accrual (upfront)'];

  isAdvancedPaymentAllocation = false;

  advancePaymentAllocationData: AdvancePaymentAllocationData;

  accountingMappings: any = {};
  paymentChannelToFundSourceMappings: PaymentChannelToFundSourceMapping[] = [];
  feeToIncomeAccountMappings: ChargeToIncomeAccountMapping[] = [];
  penaltyToIncomeAccountMappings: ChargeToIncomeAccountMapping[] = [];

  constructor() { }

  ngOnInit() {
    this.setCurrentValues();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.setCurrentValues();
  }

  setCurrentValues(): void {
    if (this.loanProduct.accountingMappings) {
      this.accountingMappings = this.loanProduct.accountingMappings;
      this.paymentChannelToFundSourceMappings = this.loanProduct.paymentChannelToFundSourceMappings || [];
      this.feeToIncomeAccountMappings = this.loanProduct.feeToIncomeAccountMappings || [];
      this.penaltyToIncomeAccountMappings = this.loanProduct.penaltyToIncomeAccountMappings || [];

    } else {
      this.accountingMappings = {};
      if ((this.loanProduct.accountingRule && this.loanProduct.accountingRule > 1) || this.loanProductsTemplate.accountingRule.value !== 'NONE') {
        const assetAccountData = this.loanProductsTemplate.accountingMappingOptions.assetAccountOptions || [];
        const incomeAccountData = this.loanProductsTemplate.accountingMappingOptions.incomeAccountOptions || [];
        const expenseAccountData = this.loanProductsTemplate.accountingMappingOptions.expenseAccountOptions || [];
        const liabilityAccountData = this.loanProductsTemplate.accountingMappingOptions.liabilityAccountOptions || [];
        const assetAndLiabilityAccountData = this.loanProductsTemplate.accountingMappingOptions.assetAndLiabilityAccountOptions || [];

        this.accountingMappings = {
          'fundSourceAccount': this.glAccountLookUp(this.loanProduct.fundSourceAccountId, assetAndLiabilityAccountData),
          'loanPortfolioAccount': this.glAccountLookUp(this.loanProduct.loanPortfolioAccountId, assetAccountData),
          'receivableInterestAccount': this.glAccountLookUp(this.loanProduct.receivableInterestAccountId, assetAccountData),
          'receivableFeeAccount': this.glAccountLookUp(this.loanProduct.receivableFeeAccountId, assetAccountData),
          'receivablePenaltyAccount': this.glAccountLookUp(this.loanProduct.receivablePenaltyAccountId, assetAccountData),
          'transfersInSuspenseAccount': this.glAccountLookUp(this.loanProduct.transfersInSuspenseAccountId, assetAccountData),

          'interestOnLoanAccount': this.glAccountLookUp(this.loanProduct.interestOnLoanAccountId, incomeAccountData),
          'incomeFromFeeAccount': this.glAccountLookUp(this.loanProduct.incomeFromFeeAccountId, incomeAccountData),
          'incomeFromPenaltyAccount': this.glAccountLookUp(this.loanProduct.incomeFromPenaltyAccountId, incomeAccountData),
          'incomeFromRecoveryAccount': this.glAccountLookUp(this.loanProduct.incomeFromRecoveryAccountId, incomeAccountData),
          'incomeFromChargeOffInterestAccount': this.glAccountLookUp(this.loanProduct.incomeFromChargeOffInterestAccountId, incomeAccountData),
          'incomeFromChargeOffFeesAccount': this.glAccountLookUp(this.loanProduct.incomeFromChargeOffFeesAccountId, incomeAccountData),
          'incomeFromChargeOffPenaltyAccount': this.glAccountLookUp(this.loanProduct.incomeFromChargeOffPenaltyAccountId, incomeAccountData),

          'writeOffAccount': this.glAccountLookUp(this.loanProduct.writeOffAccountId, expenseAccountData),
          'goodwillCreditAccount': this.glAccountLookUp(this.loanProduct.goodwillCreditAccountId, expenseAccountData),
          'chargeOffExpenseAccount': this.glAccountLookUp(this.loanProduct.writeOffAccountId, expenseAccountData),
          'chargeOffFraudExpenseAccount': this.glAccountLookUp(this.loanProduct.writeOffAccountId, expenseAccountData),

          'overpaymentLiabilityAccount': this.glAccountLookUp(this.loanProduct.overpaymentLiabilityAccountId, liabilityAccountData),
        };

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
      }

      if (this.loanProduct.isInterestRecalculationEnabled) {
        this.loanProduct.interestRecalculationData = {
          interestRecalculationCompoundingType: this.optionDataLookUp(this.loanProduct.interestRecalculationCompoundingMethod,
            this.loanProductsTemplate.interestRecalculationCompoundingTypeOptions),
          rescheduleStrategyType: this.optionDataLookUp(this.loanProduct.rescheduleStrategyMethod,
            this.loanProductsTemplate.rescheduleStrategyTypeOptions),
          recalculationCompoundingFrequencyType: this.optionDataLookUp(this.loanProduct.recalculationCompoundingFrequencyType,
            this.loanProductsTemplate.interestRecalculationFrequencyTypeOptions),
          recalculationRestFrequencyType: this.optionDataLookUp(this.loanProduct.recalculationRestFrequencyType,
            this.loanProductsTemplate.interestRecalculationFrequencyTypeOptions),
          preClosureInterestCalculationStrategy: this.optionDataLookUp(this.loanProduct.preClosureInterestCalculationStrategy,
            this.loanProductsTemplate.preClosureInterestCalculationStrategyOptions),
            allowCompoundingOnEod: this.loanProduct.allowCompoundingOnEod,
            isArrearsBasedOnOriginalSchedule: this.loanProduct.isArrearsBasedOnOriginalSchedule,
            isCompoundingToBePostedAsTransaction: this.loanProduct.isCompoundingToBePostedAsTransaction,
            recalculationRestFrequencyInterval: this.loanProduct.recalculationRestFrequencyInterval
        };
      }
    }

    this.isAdvancedPaymentAllocation = LoanProducts.isAdvancedPaymentAllocationStrategy(this.loanProduct.transactionProcessingStrategyCode);

    if (this.loanProduct.advancedPaymentAllocationTransactionTypes) {
      this.advancePaymentAllocationData = {
        transactionTypes: this.loanProduct.advancedPaymentAllocationTransactionTypes,
        allocationTypes: this.loanProduct.advancedPaymentAllocationTypes,
        futureInstallmentAllocationRules: this.loanProduct.advancedPaymentAllocationFutureInstallmentAllocationRules
      };
    } else {
      this.advancePaymentAllocationData = {
        transactionTypes: this.loanProductsTemplate.advancedPaymentAllocationTransactionTypes,
        allocationTypes: this.loanProductsTemplate.advancedPaymentAllocationTypes,
        futureInstallmentAllocationRules: this.loanProductsTemplate.advancedPaymentAllocationFutureInstallmentAllocationRules
      };
    }

  }

  optionDataLookUp(itemId: number, optionsData: any[]): OptionData {
    let optionData: OptionData | null;
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

  glAccountLookUp(glAccountId: number, glAccounts: GLAccount[]): AccountingMapping {
    let accountMapping: AccountingMapping | null = null;
    if (glAccountId) {
      glAccounts.some((glAccount: GLAccount) => {
        if (glAccount.id === glAccountId) {
          accountMapping = {id: glAccount.id, name: glAccount.name, glCode: glAccount.glCode};
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
          chargeData = {id: charge.id, name: charge.name, penalty: charge.penalty};
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

  accountingRule(): number {
    return this.loanProduct.accountingRule.id ?
      this.loanProduct.accountingRule.id : this.loanProduct.accountingRule;
  }

  isAccountingEnabled(): boolean {
    return (this.accountingRule() >= 2);
  }

  isAdvancedAccountingEnabled(): boolean {
    return (this.loanProduct.paymentChannelToFundSourceMappings?.length > 0
      || this.loanProduct.feeToIncomeAccountMappings?.length > 0
      || this.loanProduct.penaltyToIncomeAccountMappings?.length > 0);
  }

  isAdvancedPaymentAllocationStrategy(): boolean {
    return LoanProducts.isAdvancedPaymentAllocationStrategy(this.loanProduct.transactionProcessingStrategyCode);
  }

}
