/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * i18n translation keys for External National ID System status messages.
 *
 * These keys correspond to translation entries in assets/translations/*.json files.
 * Using constants eliminates string duplication and enables type-safe refactoring.
 *
 * @example
 * // In component template:
 * <span [ngClass]="{ 'text-success': statusType === 'success' }">
 *   {{ statusMessageKey | translate }}
 * </span>
 *
 * // In service:
 * this.statusMessageKey = EXTERNAL_ID_STATUS_KEYS.SUCCESS;
 */
export const EXTERNAL_ID_STATUS_KEYS = {
  /** Successfully verified and retrieved client data from external API */
  SUCCESS: 'External ID verified successfully',

  /** External ID not found in external system (404 response) */
  NOT_FOUND: 'External ID not found',

  /** External ID format is invalid (client-side regex validation failed) */
  INVALID_FORMAT: 'External ID format is invalid',

  /** API call timed out after 10 seconds */
  TIMEOUT: 'External ID lookup timed out',

  /** Generic API error (5xx, network error, etc.) */
  FAILED: 'External ID lookup failed',

  /** Currently fetching data from external API */
  LOADING: 'Looking up External ID...',

  /** No status message (reset state) */
  EMPTY: ''
} as const;

/**
 * Type representing all possible status message keys.
 * Useful for type-safe status handling in components.
 *
 * @example
 * let currentStatus: ExternalIdStatusKey = EXTERNAL_ID_STATUS_KEYS.SUCCESS;
 */
export type ExternalIdStatusKey = (typeof EXTERNAL_ID_STATUS_KEYS)[keyof typeof EXTERNAL_ID_STATUS_KEYS];

/**
 * Mapping from external API gender IDs to gender names.
 * The external API uses different IDs (36=Male, 37=Female) than Fineract.
 * We map by name to find the corresponding Fineract gender option.
 *
 * @example
 * const genderName = EXTERNAL_GENDER_MAP[36]; // 'Male'
 * const fineractOption = genderOptions.find(opt => opt.name === genderName);
 */
export const EXTERNAL_GENDER_MAP: Readonly<Record<number, string>> = {
  36: 'Male',
  37: 'Female'
};

/**
 * Fields that are auto-filled and disabled when external ID is verified.
 * These are person-specific fields that should not exist for Entity legal forms.
 */
export const PERSON_FIELD_NAMES = [
  'firstname',
  'middlename',
  'lastname',
  'dateOfBirth',
  'genderId'
] as const;

/**
 * Type representing the person field names.
 * Useful for type-safe field access in components.
 */
export type PersonFieldName = (typeof PERSON_FIELD_NAMES)[number];
