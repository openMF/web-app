/**
 * Apache Fineract REST API
 * Apache Fineract is a secure, multi-tenanted microfinance platform. The goal of the Apache Fineract API is to empower developers to build apps on top of the Apache Fineract Platform. The https://cui.fineract.dev[reference app] (username: mifos, password: password) works on the same demo tenant as the interactive links in this documentation. Until we complete the new REST API documentation you still have the legacy documentation available https://fineract.apache.org/legacy-docs/apiLive.htm[here]. Please check https://fineract.apache.org/docs/current[the Fineract documentation] for more information.
 *
 * The version of the OpenAPI document: 0.0.0-9ca128fc
 * Contact: dev@fineract.apache.org
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { GetLoansLoanIdLoanInstallmentChargeData } from './getLoansLoanIdLoanInstallmentChargeData';
import { GetLoansLoanIdCurrency } from './getLoansLoanIdCurrency';
import { GetLoansLoanIdEnumOptionData } from './getLoansLoanIdEnumOptionData';


/**
 * Set of charges
 */
export interface GetLoansLoanIdLoanChargeData { 
    amount?: number;
    amountOrPercentage?: number;
    amountOutstanding?: number;
    amountPaid?: number;
    amountPercentageAppliedTo?: number;
    amountWaived?: number;
    amountWrittenOff?: number;
    chargeCalculationType?: GetLoansLoanIdEnumOptionData;
    chargeId?: number;
    chargePayable?: boolean;
    chargePaymentMode?: GetLoansLoanIdEnumOptionData;
    chargeTimeType?: GetLoansLoanIdEnumOptionData;
    currency?: GetLoansLoanIdCurrency;
    dueDate?: string;
    id?: number;
    /**
     * List of GetLoansLoanIdLoanInstallmentChargeData
     */
    installmentChargeData?: Array<GetLoansLoanIdLoanInstallmentChargeData>;
    loanId?: number;
    maxCap?: number;
    minCap?: number;
    name?: string;
    paid?: boolean;
    penalty?: boolean;
    percentage?: number;
    waived?: boolean;
}

