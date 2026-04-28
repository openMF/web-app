/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Mapping of common country names (lowercase) to ISO 3166-1 alpha-2 codes.
 * Used by PostalCodeLookupService to resolve country names from Fineract
 * code values into API-compatible country codes.
 *
 * Covers countries commonly served by microfinance institutions.
 */
export const COUNTRY_NAME_TO_ISO_CODE: Record<string, string> = {
  // Americas
  'united states': 'us',
  usa: 'us',
  us: 'us',
  canada: 'ca',
  ca: 'ca',
  mexico: 'mx',
  méxico: 'mx',
  mx: 'mx',
  brazil: 'br',
  brasil: 'br',
  br: 'br',
  argentina: 'ar',
  ar: 'ar',
  colombia: 'co',
  co: 'co',
  peru: 'pe',
  perú: 'pe',
  pe: 'pe',
  chile: 'cl',
  cl: 'cl',
  ecuador: 'ec',
  ec: 'ec',
  guatemala: 'gt',
  gt: 'gt',
  'dominican republic': 'do',
  do: 'do',
  honduras: 'hn',
  hn: 'hn',
  'el salvador': 'sv',
  sv: 'sv',
  bolivia: 'bo',
  bo: 'bo',
  paraguay: 'py',
  py: 'py',

  // Europe
  'united kingdom': 'gb',
  'great britain': 'gb',
  uk: 'gb',
  gb: 'gb',
  germany: 'de',
  deutschland: 'de',
  de: 'de',
  france: 'fr',
  fr: 'fr',
  spain: 'es',
  españa: 'es',
  es: 'es',
  italy: 'it',
  italia: 'it',
  it: 'it',
  poland: 'pl',
  pl: 'pl',
  netherlands: 'nl',
  nl: 'nl',
  portugal: 'pt',
  pt: 'pt',
  belgium: 'be',
  be: 'be',
  switzerland: 'ch',
  ch: 'ch',
  austria: 'at',
  at: 'at',
  romania: 'ro',
  ro: 'ro',

  // Africa
  'south africa': 'za',
  za: 'za',
  nigeria: 'ng',
  ng: 'ng',
  kenya: 'ke',
  ke: 'ke',
  tanzania: 'tz',
  tz: 'tz',
  uganda: 'ug',
  ug: 'ug',
  ghana: 'gh',
  gh: 'gh',
  ethiopia: 'et',
  et: 'et',
  mozambique: 'mz',
  mz: 'mz',
  rwanda: 'rw',
  rw: 'rw',
  senegal: 'sn',
  sn: 'sn',
  mali: 'ml',
  ml: 'ml',
  cameroon: 'cm',
  cm: 'cm',
  madagascar: 'mg',
  mg: 'mg',
  zambia: 'zm',
  zm: 'zm',
  zimbabwe: 'zw',
  zw: 'zw',

  // Asia & Pacific
  india: 'in',
  in: 'in',
  pakistan: 'pk',
  pk: 'pk',
  bangladesh: 'bd',
  bd: 'bd',
  indonesia: 'id',
  id: 'id',
  philippines: 'ph',
  ph: 'ph',
  thailand: 'th',
  th: 'th',
  japan: 'jp',
  jp: 'jp',
  australia: 'au',
  au: 'au',
  myanmar: 'mm',
  mm: 'mm',
  cambodia: 'kh',
  kh: 'kh',
  nepal: 'np',
  np: 'np',
  'sri lanka': 'lk',
  lk: 'lk'
};

/**
 * Default ISO country codes to try when no country is selected in the form.
 * Ordered by prevalence in typical Mifos deployments (microfinance hotspots).
 */
export const DEFAULT_LOOKUP_COUNTRY_CODES = [
  'us',
  'mx',
  'in',
  'ke',
  'ph',
  'br',
  'gb'
];

/**
 * Aliases for country names that differ between the Zippopotam API
 * and common Fineract code value configurations.
 * Key: API-returned name (lowercase) → Value: array of alternative names to try matching.
 */
export const COUNTRY_NAME_ALIASES: Record<string, string[]> = {
  'great britain': [
    'united kingdom',
    'uk',
    'england',
    'britain'
  ],
  'united kingdom': [
    'great britain',
    'uk',
    'england',
    'britain'
  ],
  'united states': [
    'usa',
    'us',
    'united states of america'
  ],
  brasil: ['brazil'],
  brazil: ['brasil'],
  méxico: ['mexico'],
  mexico: ['méxico'],
  deutschland: ['germany'],
  germany: ['deutschland'],
  españa: ['spain'],
  spain: ['españa'],
  italia: ['italy'],
  italy: ['italia']
};
