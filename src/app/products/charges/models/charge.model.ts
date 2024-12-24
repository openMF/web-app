import { Currency, PaymentTypeOption } from 'app/shared/models/general.model';
import { OptionData } from 'app/shared/models/option-data.model';

export interface Charge {
  id: number;
  name: string;
  active: boolean;
  penalty: boolean;
  freeWithdrawal: boolean;
  freeWithdrawalChargeFrequency: number;
  restartFrequency: number;
  restartFrequencyEnum: number;
  isPaymentType: boolean;
  currency: Currency;
  amount: number;
  chargeTimeType: OptionData;
  chargeAppliesTo: OptionData;
  chargeCalculationType: OptionData;
  chargePaymentMode: OptionData;
  feeInterval?: number;
  feeFrequency?: OptionData;
  feeOnMonthDay?: number[];
  paymentTypeOptions?: PaymentTypeOption;
}

export enum ChargeAppliesToCode {
  ChargeAppliesToClient = 'chargeAppliesTo.client',
  ChargeAppliesToLoan = 'chargeAppliesTo.loan',
  ChargeAppliesToSavings = 'chargeAppliesTo.savings',
  ChargeAppliesToShares = 'chargeAppliesTo.shares',
  ChargeCalculationTypeFlat = 'chargeCalculationType.flat',
  ChargeCalculationTypePercentOfAmount = 'chargeCalculationType.percent.of.amount',
  ChargeCalculationTypePercentOfAmountAndInterest = 'chargeCalculationType.percent.of.amount.and.interest',
  ChargeCalculationTypePercentOfInterest = 'chargeCalculationType.percent.of.interest',
  ChargeTimeTypeActivation = 'chargeTimeType.activation',
  ChargeTimeTypeAnnualFee = 'chargeTimeType.annualFee',
  ChargeTimeTypeDisbursement = 'chargeTimeType.disbursement',
  ChargeTimeTypeInstalmentFee = 'chargeTimeType.instalmentFee',
  ChargeTimeTypeMonthlyFee = 'chargeTimeType.monthlyFee',
  ChargeTimeTypeOverdueInstallment = 'chargeTimeType.overdueInstallment',
  ChargeTimeTypeSavingsActivation = 'chargeTimeType.savingsActivation',
  ChargeTimeTypeSavingsNoActivityFee = 'chargeTimeType.savingsNoActivityFee',
  ChargeTimeTypeSharespurchase = 'chargeTimeType.sharespurchase',
  ChargeTimeTypeSharesredeem = 'chargeTimeType.sharesredeem',
  ChargeTimeTypeSolidarityFund = 'chargeTimeType.solidarityFund',
  ChargeTimeTypeSpecifiedDueDate = 'chargeTimeType.specifiedDueDate',
  ChargeTimeTypeWeeklyFee = 'chargeTimeType.weeklyFee',
  ChargeTimeTypeWithdrawalFee = 'chargeTimeType.withdrawalFee',
  ChargepaymentmodeAccounttransfer = 'chargepaymentmode.accounttransfer',
  ChargepaymentmodeRegular = 'chargepaymentmode.regular',
  FeeFrequencyperiodFrequencyTypeMonths = 'feeFrequencyperiodFrequencyType.months'
}
