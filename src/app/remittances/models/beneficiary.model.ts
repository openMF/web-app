/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Recipient validation request body.
 * POST /v1/remittances/:tenant/:vendor/transactions/:id/recipient
 */
export interface ValidateRecipientRequest {
  givenName: string;
  lastName: string;
  motherMaidenName?: string;
  dateOfBirth?: string;
  phone?: string;
  address?: {
    country?: string;
    state?: string;
    city?: string;
    postalCode?: string;
    line1?: string;
  };
  primaryDocument: {
    documentType: string;
    documentNumber: string;
    issuingCountry?: string;
  };
}

/**
 * Validated recipient response from the API.
 * Maps to all 17 beneficiary fields required by the spec.
 */
export interface ValidatedRecipient {
  valid?: boolean;
  givenName?: string;
  firstName?: string;
  lastName: string;
  motherMaidenName?: string;
  dateOfBirth?: string;
  phone?: string;
  identityCard?: string;
  address?: {
    country?: string;
    state?: string;
    city?: string;
    postalCode?: string;
    line1?: string;
    line2?: string;
  };
  primaryDocument?: {
    documentType?: string;
    documentNumber?: string;
    issuingCountry?: string;
  };
  occupation?: string;
  economicActivity?: string;
  /** Additional fields from spec (may be populated via additionalInfo or extended API) */
  municipality?: string;
  locality?: string;
  newLocality?: string;
  entityMember?: string;
}
