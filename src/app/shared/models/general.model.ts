import { OptionData } from './option-data.model';

export interface Currency {
  code:           string;
  name:           string;
  decimalPlaces?: number;
  inMultiplesOf?: number;
  displaySymbol?: string;
  nameCode?:      string;
  displayLabel?:  string;
}

export interface GLAccount {
  id:                     number;
  name:                   string;
  glCode:                 string;
  description:            string;
  disabled:               boolean;
  manualEntriesAllowed:   boolean;
  type:                   OptionData;
  usage:                  OptionData;
}

export interface AccountingMapping {
  id:     number;
  name:   string;
  glCode: string;
}

export interface ChargeToIncomeAccountMapping {
  charge:          Charge;
  incomeAccount:   AccountingMapping;
}

export interface PaymentChannelToFundSourceMapping {
  paymentType:       PaymentType;
  fundSourceAccount: AccountingMapping;
}

export interface PaymentType {
  id:              number;
  name:            string;
  isSystemDefined: boolean;
}

export interface PaymentTypeOption {
  id:              number;
  name:            string;
  description:     string;
  isCashPayment:   boolean;
  isSystemDefined: boolean;
  position:        number;
}

export interface Charge {
  id:                             number;
  name:                           string;
  active?:                        boolean;
  penalty:                        boolean;
  freeWithdrawal?:                boolean;
  freeWithdrawalChargeFrequency?: number;
  restartFrequency?:              number;
  restartFrequencyEnum?:          number;
  isPaymentType?:                 boolean;
  currency?:                      Currency;
  amount?:                        number;
  chargeTimeType?:                Charge;
  chargeAppliesTo?:               Charge;
  chargeCalculationType?:         Charge;
  chargePaymentMode?:             Charge;
}
