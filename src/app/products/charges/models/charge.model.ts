/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

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
  ChargeTimeTypeDownPayment = 'chargeTimeType.downPayment',
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

export const DOWN_PAYMENT_CHARGE_TIME_TYPE_ID = 17;

/** Fineract accepts only Flat and % Amount (of the down payment amount) for a down payment fee. */
export const DOWN_PAYMENT_CHARGE_CALCULATION_TYPE_IDS = [
  1,
  2
];

export function isDownPaymentCharge(charge: { chargeTimeType?: { id?: number } } | null | undefined): boolean {
  return charge?.chargeTimeType?.id === DOWN_PAYMENT_CHARGE_TIME_TYPE_ID;
}

/**
 * True for a down payment fee that is not Flat, i.e. % Amount or not chosen yet:
 * its percentage applies to the down payment amount, not to the disbursed amount.
 */
export function isDownPaymentPercentageCharge(chargeTimeType: unknown, chargeCalculationType: unknown): boolean {
  return chargeTimeType === DOWN_PAYMENT_CHARGE_TIME_TYPE_ID && chargeCalculationType !== 1;
}
