/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpBackend } from '@angular/common/http';
import { Observable, of, concat } from 'rxjs';
import { catchError, first, filter } from 'rxjs/operators';
import { PostalCodeLookupResponse, ResolvedAddress } from '../models/postal-code-lookup.model';
import {
  COUNTRY_NAME_TO_ISO_CODE,
  COUNTRY_NAME_ALIASES,
  DEFAULT_LOOKUP_COUNTRY_CODES
} from '../constants/country-codes';
import { environment } from 'environments/environment';

/**
 * Service for looking up address details from postal codes.
 *
 * Uses the free Zippopotam.us API (no API key required).
 * Bypasses Angular HTTP interceptors to avoid adding Fineract auth headers.
 */
@Injectable({
  providedIn: 'root'
})
export class PostalCodeLookupService {
  private httpBackend = inject(HttpBackend);
  private externalHttp = new HttpClient(this.httpBackend);

  private readonly API_BASE = 'https://api.zippopotam.us';

  /** Whether the postal code lookup feature is enabled via environment config. */
  get enabled(): boolean {
    return environment.enablePostalCodeLookup;
  }

  /**
   * Looks up address details for a postal code in a specific country.
   * @param countryCode ISO 3166-1 alpha-2 country code
   * @param postalCode Postal code to look up
   * @returns Observable of the API response, or null if not found/disabled
   */
  lookup(countryCode: string, postalCode: string): Observable<PostalCodeLookupResponse | null> {
    if (!this.enabled) return of(null);
    return this.externalHttp
      .get<PostalCodeLookupResponse>(`${this.API_BASE}/${countryCode}/${postalCode}`)
      .pipe(catchError(() => of(null)));
  }

  /**
   * Tries to resolve a postal code by testing multiple country codes.
   * Emits the first successful result and completes.
   * @param postalCode Postal code to look up
   * @param countryCodes Country codes to try (defaults to common MFI countries)
   */
  lookupWithFallback(
    postalCode: string,
    countryCodes: string[] = DEFAULT_LOOKUP_COUNTRY_CODES
  ): Observable<PostalCodeLookupResponse | null> {
    if (!this.enabled || !countryCodes.length) return of(null);

    const lookups$ = countryCodes.map((code) => this.lookup(code, postalCode));

    return concat(...lookups$).pipe(
      filter((result): result is PostalCodeLookupResponse => result !== null && result.places?.length > 0),
      first(undefined, null)
    );
  }

  /**
   * Resolves a country name (from Fineract code values) to an ISO country code.
   * Performs case-insensitive matching.
   */
  resolveCountryCode(countryName: string): string | null {
    const lower = countryName.toLowerCase();
    const direct = COUNTRY_NAME_TO_ISO_CODE[lower];
    if (direct) return direct;

    // Check aliases — e.g. "United States of America" → "united states" → "us"
    const aliases = COUNTRY_NAME_ALIASES[lower];
    if (aliases) {
      for (const alias of aliases) {
        const code = COUNTRY_NAME_TO_ISO_CODE[alias];
        if (code) return code;
      }
    }

    return null;
  }

  /**
   * Extracts a clean ResolvedAddress from the raw API response.
   */
  toResolvedAddress(response: PostalCodeLookupResponse): ResolvedAddress | null {
    if (!response?.places?.length) return null;
    const place = response.places[0];
    return {
      city: place['place name'],
      state: place.state,
      stateAbbreviation: place['state abbreviation'],
      country: response.country,
      countryAbbreviation: response['country abbreviation']
    };
  }

  /** Minimum character length for partial (contains) matching to avoid false positives */
  private readonly MIN_PARTIAL_MATCH_LENGTH = 4;

  /**
   * Finds the best match for a name in a list of dropdown options.
   * Matching strategy (stops at first hit):
   *   1. Exact match (case-insensitive) on all candidates
   *   2. Starts-with match (option starts with candidate or vice-versa)
   *   3. Contains match — only for candidates with 4+ characters to avoid
   *      false positives like "MA" matching "Za-ma-bia"
   *
   * @param options   Dropdown options from Fineract code values
   * @param names     One or more names to try (e.g. full name + abbreviation)
   */
  findBestMatch<T extends { id: number; name: string }>(options: T[], ...names: string[]): T | null {
    if (!options?.length || !names.length) return null;

    const candidates = this.expandWithAliases(names);

    // 1. Exact match (case-insensitive)
    for (const candidate of candidates) {
      const exact = options.find((o) => o.name.toLowerCase() === candidate);
      if (exact) return exact;
    }

    // 2. Starts-with match (safe for short strings)
    for (const candidate of candidates) {
      const startsWith = options.find((o) => {
        const optName = o.name.toLowerCase();
        return optName.startsWith(candidate) || candidate.startsWith(optName);
      });
      if (startsWith) return startsWith;
    }

    // 3. Contains match — only for longer candidates to prevent false positives
    for (const candidate of candidates) {
      if (candidate.length < this.MIN_PARTIAL_MATCH_LENGTH) continue;
      const contains = options.find((o) => {
        const optName = o.name.toLowerCase();
        return optName.includes(candidate) || candidate.includes(optName);
      });
      if (contains) return contains;
    }

    return null;
  }

  /**
   * Expands a list of names with known aliases (lowercase, deduplicated).
   */
  private expandWithAliases(names: string[]): string[] {
    const result = new Set<string>();
    for (const name of names) {
      if (!name) continue;
      const lower = name.toLowerCase();
      result.add(lower);
      const aliases = COUNTRY_NAME_ALIASES[lower];
      if (aliases) {
        aliases.forEach((a) => result.add(a));
      }
    }
    return [...result];
  }
}
