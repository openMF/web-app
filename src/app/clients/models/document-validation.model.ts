/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Validation status options for a customer data review */
export enum ValidationStatus {
  INCOMPLETE = 'INCOMPLETE',
  COMPLETE = 'COMPLETE'
}

/** Reason flags for a document inconsistency */
export interface DocumentReasons {
  missingDocument: boolean;
  illegibleDocument: boolean;
  invalidDocument: boolean;
  expiredDocument: boolean;
}

/** Per-document-type validation state */
export interface DocumentTypeValidation {
  selected: boolean;
  reasons: DocumentReasons;
}

/** Full validation payload stored in the datatable */
export interface CustomerDataValidation {
  nid: DocumentTypeValidation;
  legalId: DocumentTypeValidation;
  proofOfAddress: DocumentTypeValidation;
  score: DocumentTypeValidation;
  validationStatus: ValidationStatus | null;
}

/** Datatable name used to persist validation data in Fineract */
export const KYC_VALIDATION_DATATABLE = 'dt_kyc_validation';

/** Data type rows shown in the validation dialog */
export const DOCUMENT_DATA_TYPES: Array<{
  key: keyof Omit<CustomerDataValidation, 'validationStatus'>;
  labelKey: string;
}> = [
  { key: 'nid', labelKey: 'labels.inputs.NID' },
  { key: 'legalId', labelKey: 'labels.inputs.Legal Id' },
  { key: 'proofOfAddress', labelKey: 'labels.inputs.Proof of address' },
  { key: 'score', labelKey: 'labels.inputs.Score' }
];

/** Reason columns shown in the validation dialog */
export const DOCUMENT_REASON_TYPES: Array<{ key: keyof DocumentReasons; labelKey: string }> = [
  { key: 'missingDocument', labelKey: 'labels.inputs.Missing document' },
  { key: 'illegibleDocument', labelKey: 'labels.inputs.Illegible document' },
  { key: 'invalidDocument', labelKey: 'labels.inputs.Invalid document' },
  { key: 'expiredDocument', labelKey: 'labels.inputs.Expired document' }
];

/** Builds a default empty CustomerDataValidation */
export function emptyCustomerDataValidation(): CustomerDataValidation {
  const emptyDoc: DocumentTypeValidation = {
    selected: false,
    reasons: {
      missingDocument: false,
      illegibleDocument: false,
      invalidDocument: false,
      expiredDocument: false
    }
  };
  return {
    nid: { ...emptyDoc, reasons: { ...emptyDoc.reasons } },
    legalId: { ...emptyDoc, reasons: { ...emptyDoc.reasons } },
    proofOfAddress: { ...emptyDoc, reasons: { ...emptyDoc.reasons } },
    score: { ...emptyDoc, reasons: { ...emptyDoc.reasons } },
    validationStatus: null
  };
}
