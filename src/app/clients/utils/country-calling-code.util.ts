/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { COUNTRY_CODES } from 'app/zitadel/constants/coutry-codes';

/** A country's international dialing code together with its ISO 3166-1 alpha-2 country code. */
export interface CountryCallingCode {
  /** ISO 3166-1 alpha-2 code. It is unique, so it can safely be used as a form/option value. */
  isoCode: string;
  /** International dialing code including the leading '+'. Not unique; several countries share one. */
  dialCode: string;
}

/**
 * Countries and their international calling codes.
 *
 * Reuses the existing `COUNTRY_CODES` dataset (shared with the Zitadel user forms) and de-duplicates
 * it by ISO code, because the source list repeats one entry (SV / +503). Calling codes themselves are
 * deliberately kept non-unique: e.g. US and CA share +1, so the ISO code is the option value.
 */
export const COUNTRY_CALLING_CODES: CountryCallingCode[] = COUNTRY_CODES.reduce<CountryCallingCode[]>(
  (callingCodes, country) => {
    if (!callingCodes.some((callingCode) => callingCode.isoCode === country.key)) {
      callingCodes.push({ isoCode: country.key, dialCode: country.code });
    }
    return callingCodes;
  },
  []
);

/** Dial codes ordered longest-first so `+44` is matched before a shorter overlapping prefix while parsing. */
const DIAL_CODES_BY_LENGTH: CountryCallingCode[] = [...COUNTRY_CALLING_CODES].sort(
  (first, second) => second.dialCode.length - first.dialCode.length
);

/**
 * National trunk prefixes that must not follow a country's dialing code. A number entered in
 * national format (e.g. 07700900123 for GB, 14165550100 for the NANP) must lose that prefix
 * before the dialing code is added, otherwise the stored value is not the intended international
 * number (+4407700900123 instead of +447700900123). Countries that have no national trunk prefix
 * (e.g. Spain) are deliberately not listed, so their numbers are kept exactly as entered.
 */
const NATIONAL_TRUNK_PREFIXES: Record<string, string> = {
  AU: '0',
  BR: '0',
  CA: '1',
  CN: '0',
  DE: '0',
  FR: '0',
  GB: '0',
  IN: '0',
  IT: '0',
  JP: '0',
  MX: '0',
  NG: '0',
  RU: '8',
  US: '1',
  ZA: '0'
};

/** Returns the dialing code for an ISO country code, or '' when it is unknown. */
export function dialCodeForIsoCode(isoCode: string | null | undefined): string {
  return COUNTRY_CALLING_CODES.find((callingCode) => callingCode.isoCode === isoCode)?.dialCode ?? '';
}

/**
 * Combines a selected ISO calling code with a locally entered number into the single string that the
 * Fineract `mobileNo` field expects. When no calling code is selected, or the number already starts
 * with '+', the number is returned unchanged so existing records keep their original value.
 * A national trunk prefix (0 for most countries, 1 for the NANP, 8 for Russia) is dropped from
 * the local number before the dialing code is added.
 */
export function composeMobileNumber(
  isoCode: string | null | undefined,
  localNumber: string | null | undefined
): string {
  const number = `${localNumber ?? ''}`.trim();
  if (!number || number.startsWith('+')) {
    return number;
  }
  const dialCode = dialCodeForIsoCode(isoCode);
  if (!dialCode) {
    return number;
  }
  const trunkPrefix = isoCode ? NATIONAL_TRUNK_PREFIXES[isoCode] : undefined;
  const nationalNumber = trunkPrefix && number.startsWith(trunkPrefix) ? number.slice(trunkPrefix.length) : number;
  return `${dialCode}${nationalNumber}`;
}

/**
 * Splits a stored `mobileNo` back into an ISO calling code and a local number.
 * Numbers without a recognized international prefix keep their original value and no calling code is
 * selected, which preserves backward compatibility with existing client records. The same applies to a
 * dial code shared by several countries (e.g. `+1` for US and CA): the stored number alone cannot
 * recover which country it belongs to, so no country is selected instead of picking one by list order.
 * A number that is nothing but a dialing code (e.g. `+91`) is also kept unsplit, so saving the form
 * does not submit an empty number.
 */
export function splitMobileNumber(mobileNo: string | null | undefined): { isoCode: string; localNumber: string } {
  const number = `${mobileNo ?? ''}`.trim();
  if (!number.startsWith('+')) {
    return { isoCode: '', localNumber: number };
  }
  // Longest dial code first, so a longer code that starts with a shorter one (e.g. +1242) still wins.
  const match = DIAL_CODES_BY_LENGTH.find((callingCode) => number.startsWith(callingCode.dialCode));
  if (!match) {
    return { isoCode: '', localNumber: number };
  }
  const countriesSharingTheCode = DIAL_CODES_BY_LENGTH.filter((callingCode) => callingCode.dialCode === match.dialCode);
  if (countriesSharingTheCode.length > 1) {
    return { isoCode: '', localNumber: number };
  }
  const localNumber = number.slice(match.dialCode.length).trim();
  if (!localNumber) {
    // The stored number is nothing but a dialing code (e.g. "+91"). Keep it untouched instead of
    // splitting it into an empty number, which would be submitted when the form is saved.
    return { isoCode: '', localNumber: number };
  }
  return { isoCode: match.isoCode, localNumber };
}
