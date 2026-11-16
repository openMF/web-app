/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Saved office-address records, including identifiers returned by older deployments. */
export interface OfficeAddress {
  officeAddressId?: string | number | null;
  id?: string | number | null;
  addressId?: string | number | null;
  officeId?: string | number | null;
  addressTypeId?: string | number | null;
  isActive?: boolean | null;
  street?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  addressLine3?: string | null;
  townVillage?: string | null;
  city?: string | null;
  countyDistrict?: string | null;
  stateProvinceId?: string | number | null;
  countryId?: string | number | null;
  postalCode?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  createdBy?: string | null;
  createdOn?: string | number[] | null;
  updatedBy?: string | null;
  updatedOn?: string | number[] | null;
}
