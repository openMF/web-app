/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Represents a remittance transaction returned by the Find-Remittance endpoint.
 * GET /v1/remittances/:tenant/:vendor/transactions/:id
 */
export interface RemittanceTransaction {
  sendingPartner: string;
  externalTransactionId: string;
  pin: string;
  created: string;
  processedAt: string;
  senderName: string;
  recipientName: string;
  receivingAmount: number;
  receivingCurrency: string;
  recipientAddress: string;
  status: string;
}

/**
 * Payout assignment response (Endpoint 3).
 * POST /v1/remittances/:tenant/:vendor/transactions/:id/payout-assignment
 */
export interface PayoutAssignmentResponse {
  sendingPartner: string;
  remittanceKey: string;
  created: string;
  receivingAmount: number;
  receivingCurrency: string;
  trackingNumber: string;
  sender: string;
  recipient: string;
  status: string;
}

/**
 * Payout confirmation response (Endpoint 4).
 * POST /v1/remittances/:tenant/:vendor/transactions/:id/payout-confirmation/:clientId
 */
export interface PayoutConfirmationResponse {
  transaction: {
    receivingAmount: number;
    receivingCurrency: string;
    status: string;
    sender: PersonName;
    recipient: RecipientDetails;
  };
}

export interface PersonName {
  firstName: string;
  lastName: string;
  middleName?: string;
  mothersMaidenName?: string;
}

export interface RecipientAddress {
  country: string;
  state: string;
  city: string;
  postalCode: string;
  line1: string;
  line2?: string;
}

export interface RecipientDocument {
  documentType: string;
  documentNumber: string;
  issuingCountry: string;
}

export interface RecipientDetails extends PersonName {
  phone?: string;
  email?: string;
  nationality?: string;
  dateOfBirth?: string;
  homeAddress?: RecipientAddress;
  primaryDocument?: RecipientDocument;
  occupation?: string;
  economicActivity?: string;
}

/** Vendor item from the GET /v1/remittances/:tenant/vendors endpoint */
export interface RemittanceVendor {
  name: string;
  headerValue: string;
}

/** Request body for payout assignment */
export interface PayoutAssignmentRequest {
  agent?: string;
  additionalInfo?: Record<string, string>;
}

/** Request body for payout confirmation */
export interface PayoutConfirmationRequest {
  additionalInfo?: Record<string, string>;
}
