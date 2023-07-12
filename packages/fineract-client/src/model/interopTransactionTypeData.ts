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


export interface InteropTransactionTypeData { 
    initiator: InteropTransactionTypeData.InitiatorEnum;
    initiatorType: InteropTransactionTypeData.InitiatorTypeEnum;
    scenario: InteropTransactionTypeData.ScenarioEnum;
    subScenario?: string;
}
export namespace InteropTransactionTypeData {
    export type InitiatorEnum = 'PAYER' | 'PAYEE';
    export const InitiatorEnum = {
        Payer: 'PAYER' as InitiatorEnum,
        Payee: 'PAYEE' as InitiatorEnum
    };
    export type InitiatorTypeEnum = 'CONSUMER' | 'AGENT' | 'BUSINESS' | 'DEVICE';
    export const InitiatorTypeEnum = {
        Consumer: 'CONSUMER' as InitiatorTypeEnum,
        Agent: 'AGENT' as InitiatorTypeEnum,
        Business: 'BUSINESS' as InitiatorTypeEnum,
        Device: 'DEVICE' as InitiatorTypeEnum
    };
    export type ScenarioEnum = 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'PAYMENT' | 'REFUND';
    export const ScenarioEnum = {
        Deposit: 'DEPOSIT' as ScenarioEnum,
        Withdrawal: 'WITHDRAWAL' as ScenarioEnum,
        Transfer: 'TRANSFER' as ScenarioEnum,
        Payment: 'PAYMENT' as ScenarioEnum,
        Refund: 'REFUND' as ScenarioEnum
    };
}


