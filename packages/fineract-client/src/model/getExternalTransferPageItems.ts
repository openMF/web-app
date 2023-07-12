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
import { GetExternalTransferLoan } from './getExternalTransferLoan';
import { GetExternalTransferOwner } from './getExternalTransferOwner';


export interface GetExternalTransferPageItems { 
    effectiveFrom?: string;
    effectiveTo?: string;
    loan?: GetExternalTransferLoan;
    owner?: GetExternalTransferOwner;
    purchasePriceRatio?: string;
    settlementDate?: string;
    status?: GetExternalTransferPageItems.StatusEnum;
    transferExternalId?: string;
    transferId?: number;
}
export namespace GetExternalTransferPageItems {
    export type StatusEnum = 'ACTIVE' | 'DECLINED' | 'PENDING' | 'BUYBACK' | 'CANCELLED';
    export const StatusEnum = {
        Active: 'ACTIVE' as StatusEnum,
        Declined: 'DECLINED' as StatusEnum,
        Pending: 'PENDING' as StatusEnum,
        Buyback: 'BUYBACK' as StatusEnum,
        Cancelled: 'CANCELLED' as StatusEnum
    };
}


