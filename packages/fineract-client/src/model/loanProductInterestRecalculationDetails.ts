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


export interface LoanProductInterestRecalculationDetails { 
    arrearsBasedOnOriginalSchedule?: boolean;
    compoundingFrequencyNthDay?: number;
    compoundingFrequencyOnDay?: number;
    compoundingFrequencyType?: LoanProductInterestRecalculationDetails.CompoundingFrequencyTypeEnum;
    compoundingFrequencyWeekday?: number;
    compoundingInterval?: number;
    id?: number;
    interestRecalculationCompoundingMethod?: number;
    isCompoundingToBePostedAsTransaction?: boolean;
    _new?: boolean;
    rescheduleStrategyMethod?: number;
    restFrequencyNthDay?: number;
    restFrequencyOnDay?: number;
    restFrequencyType?: LoanProductInterestRecalculationDetails.RestFrequencyTypeEnum;
    restFrequencyWeekday?: number;
    restInterval?: number;
}
export namespace LoanProductInterestRecalculationDetails {
    export type CompoundingFrequencyTypeEnum = 'INVALID' | 'SAME_AS_REPAYMENT_PERIOD' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
    export const CompoundingFrequencyTypeEnum = {
        Invalid: 'INVALID' as CompoundingFrequencyTypeEnum,
        SameAsRepaymentPeriod: 'SAME_AS_REPAYMENT_PERIOD' as CompoundingFrequencyTypeEnum,
        Daily: 'DAILY' as CompoundingFrequencyTypeEnum,
        Weekly: 'WEEKLY' as CompoundingFrequencyTypeEnum,
        Monthly: 'MONTHLY' as CompoundingFrequencyTypeEnum
    };
    export type RestFrequencyTypeEnum = 'INVALID' | 'SAME_AS_REPAYMENT_PERIOD' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
    export const RestFrequencyTypeEnum = {
        Invalid: 'INVALID' as RestFrequencyTypeEnum,
        SameAsRepaymentPeriod: 'SAME_AS_REPAYMENT_PERIOD' as RestFrequencyTypeEnum,
        Daily: 'DAILY' as RestFrequencyTypeEnum,
        Weekly: 'WEEKLY' as RestFrequencyTypeEnum,
        Monthly: 'MONTHLY' as RestFrequencyTypeEnum
    };
}


