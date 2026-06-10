/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Screening check types exposed in the client UI.
 * Name and address checks are intentionally modeled separately so users can
 * screen only the signal they want to evaluate.
 */
export type ClientScreeningType = 'name' | 'address';

/**
 * UI-ready screening statuses.
 * `idle` means the user has not run the check yet.
 * `unavailable` is used when address screening is requested but there is no
 * meaningful address data to screen.
 */
export type ClientScreeningStatus = 'idle' | 'loading' | 'clear' | 'possible-match' | 'match' | 'error' | 'unavailable';

/**
 * Minimal client shape required to build Yente screening requests.
 */
export interface ScreenableClient {
  id: number | string;
  displayName?: string;
  firstname?: string;
  middlename?: string;
  lastname?: string;
  fullname?: string;
  legalForm?: { id?: number; code?: string; value?: string; name?: string };
}

/**
 * Flattened address entry returned by Fineract client address endpoints.
 * Only the common fields used for screening are modeled here.
 */
export interface ClientAddressRecord {
  addressId?: number;
  addressType?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  street?: string;
  city?: string;
  stateProvinceName?: string;
  stateProvince?: string;
  countyDistrictName?: string;
  countyDistrict?: string;
  countryName?: string;
  country?: string;
  postalCode?: string;
  isActive?: boolean;
  [key: string]: any;
}

/**
 * Simplified match entry rendered in the UI.
 * The service normalizes the upstream payload into this shape so the component
 * does not need to understand Yente response details.
 */
export interface ClientScreeningMatch {
  id: string;
  caption: string;
  schema?: string;
  score: number;
  datasets: string[];
  countries: string[];
  addresses: string[];
  sourceUrl?: string;
}

/**
 * Normalized screening result consumed by the client-screening component.
 */
export interface ClientScreeningResult {
  type: ClientScreeningType;
  status: ClientScreeningStatus;
  matches: ClientScreeningMatch[];
  screenedText?: string;
  screenedAt?: string;
  errorMessageKey?: string;
}
