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
import { GetClientsLoanAccountsType } from './getClientsLoanAccountsType';
import { GetClientsLoanAccountsStatus } from './getClientsLoanAccountsStatus';


export interface GetClientsLoanAccounts { 
    accountNo?: string;
    externalId?: number;
    id?: number;
    loanCycle?: number;
    loanType?: GetClientsLoanAccountsType;
    productId?: number;
    productName?: string;
    status?: GetClientsLoanAccountsStatus;
}

