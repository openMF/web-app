/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Represents a single place returned by the postal code lookup API */
export interface PostalCodePlace {
  'place name': string;
  longitude: string;
  latitude: string;
  state: string;
  'state abbreviation': string;
}

/** Response from the postal code lookup API (Zippopotam.us) */
export interface PostalCodeLookupResponse {
  country: string;
  'country abbreviation': string;
  'post code': string;
  places: PostalCodePlace[];
}

/** Resolved address fields from a postal code lookup */
export interface ResolvedAddress {
  city: string;
  state: string;
  stateAbbreviation: string;
  country: string;
  countryAbbreviation: string;
}
