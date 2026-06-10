/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { LegalFormId } from '../models/legal-form.enum';
import {
  ClientAddressRecord,
  ClientScreeningMatch,
  ClientScreeningResult,
  ClientScreeningType,
  ScreenableClient
} from '../models/client-screening.model';

/**
 * Lightweight Yente screening service for selected clients.
 *
 * The web app has no persistence for this feature, so the service only:
 * - builds a request body from the visible client data
 * - calls Yente directly using an interceptor-free HttpClient
 * - normalizes the response into stable UI-friendly result objects
 *
 * This keeps external screening logic isolated from page components and allows
 * the client UI to treat name and address checks as separate user actions.
 */
@Injectable({
  providedIn: 'root'
})
export class ClientScreeningService {
  private httpBackend = inject(HttpBackend);

  /**
   * Use a raw HttpClient so Fineract auth headers and interceptors are not
   * forwarded to the external screening service.
   */
  private externalHttp = new HttpClient(this.httpBackend);

  readonly enabled = environment.enableYenteScreening === true;

  private readonly nameMatchThreshold = this.toThreshold(environment.yenteMatchThreshold, 0.85);
  private readonly possibleMatchThreshold = this.toThreshold(environment.yentePossibleMatchThreshold, 0.7);

  /**
   * Screens client identity data against Yente.
   */
  screenClientName(client: ScreenableClient): Observable<ClientScreeningResult> {
    const nameCandidates = this.getNameCandidates(client);
    if (nameCandidates.length === 0) {
      return throwError(() => new Error('errors.clientScreeningMissingName'));
    }

    const screenedText = nameCandidates.join(' | ');
    const queryId = `client-name-${client.id}`;

    return this.executeScreening('name', queryId, screenedText, {
      schema: this.getClientSchema(client),
      properties: {
        name: nameCandidates
      }
    });
  }

  /**
   * Screens client address data against Yente.
   * Address screening is deliberately isolated from name screening so users can
   * choose whether to evaluate this noisier signal.
   */
  screenClientAddress(client: ScreenableClient, addresses: ClientAddressRecord[]): Observable<ClientScreeningResult> {
    const normalizedAddresses = this.getAddressCandidates(addresses);
    if (normalizedAddresses.length === 0) {
      return throwError(() => new Error('errors.clientScreeningMissingAddress'));
    }

    const screenedText = normalizedAddresses.join(' | ');
    const queryId = `client-address-${client.id}`;

    return this.executeScreening('address', queryId, screenedText, {
      schema: this.getClientSchema(client),
      properties: {
        address: normalizedAddresses
      }
    });
  }

  /**
   * Builds and sends the Yente match request, then normalizes the response.
   */
  private executeScreening(
    type: ClientScreeningType,
    queryId: string,
    screenedText: string,
    query: Record<string, any>
  ): Observable<ClientScreeningResult> {
    let apiUrl = '';
    try {
      apiUrl = this.getScreeningUrl();
    } catch (error) {
      return throwError(() => error);
    }
    return this.externalHttp
      .post(
        apiUrl,
        {
          queries: {
            [queryId]: query
          }
        }
      )
      .pipe(map((response) => this.normalizeResponse(type, queryId, screenedText, response)));
  }

  /**
   * Returns the resolved Yente endpoint for the configured dataset.
   */
  private getScreeningUrl(): string {
    const baseUrl = environment.yenteScreeningUrl?.trim();
    const dataset = environment.yenteScreeningDataset?.trim() || 'sanctions';

    if (!this.enabled || !baseUrl) {
      throw new Error('errors.clientScreeningNotConfigured');
    }

    return `${baseUrl.replace(/\/+$/, '')}/match/${dataset}`;
  }

  /**
   * Converts the raw response into the stable match/result shape used by the UI.
   * The parser is intentionally defensive because Yente/OpenSanctions payloads
   * may vary slightly across deployments.
   */
  private normalizeResponse(
    type: ClientScreeningType,
    queryId: string,
    screenedText: string,
    response: any
  ): ClientScreeningResult {
    const rawResults = this.extractRawResults(response, queryId);
    const matches = rawResults
      .map((result: any) => this.mapMatch(result))
      .filter((result: ClientScreeningMatch | null): result is ClientScreeningMatch => !!result)
      .sort((left, right) => right.score - left.score);

    const topScore = matches[0]?.score ?? 0;
    return {
      type,
      screenedText,
      matches,
      screenedAt: new Date().toLocaleString(),
      status: this.resolveStatus(matches.length, topScore)
    };
  }

  /**
   * Extracts the first available result array from common Yente response shapes.
   */
  private extractRawResults(response: any, queryId: string): any[] {
    if (Array.isArray(response?.results)) {
      return response.results;
    }

    const queryResponse = response?.responses?.[queryId] ?? response?.responses?.[Object.keys(response?.responses || {})[0]];
    if (Array.isArray(queryResponse?.results)) {
      return queryResponse.results;
    }

    if (Array.isArray(queryResponse?.matches)) {
      return queryResponse.matches;
    }

    return [];
  }

  /**
   * Maps one raw Yente match result into a compact UI record.
   */
  private mapMatch(result: any): ClientScreeningMatch | null {
    const score = Number(result?.score ?? result?.match?.score ?? 0);
    const caption = result?.caption ?? result?.name ?? result?.properties?.name?.[0];
    const id = result?.id ?? result?.entityId ?? result?.match?.id ?? caption;

    if (!caption || !id) {
      return null;
    }

    return {
      id: String(id),
      caption: String(caption),
      schema: result?.schema ?? result?.match?.schema ?? '',
      score,
      datasets: this.asStringArray(result?.datasets ?? result?.dataset),
      countries: this.asStringArray(result?.properties?.country ?? result?.properties?.countryName),
      addresses: this.asStringArray(
        result?.properties?.address ??
          result?.properties?.fullAddress ??
          result?.properties?.addressEntity ??
          result?.properties?.streetAddress
      ),
      sourceUrl:
        result?.sourceUrl ??
        result?.first_seen ??
        result?.referents?.[0] ??
        result?.properties?.sourceUrl?.[0] ??
        ''
    };
  }

  /**
   * Uses thresholds to bucket the result into the three business statuses.
   */
  private resolveStatus(matchCount: number, topScore: number): ClientScreeningResult['status'] {
    if (!matchCount) {
      return 'clear';
    }
    if (topScore >= this.nameMatchThreshold) {
      return 'match';
    }
    if (topScore >= this.possibleMatchThreshold) {
      return 'possible-match';
    }
    return 'clear';
  }

  /**
   * Returns all meaningful name candidates visible on the client record.
   */
  private getNameCandidates(client: ScreenableClient): string[] {
    return [
      client.displayName,
      [client.firstname, client.middlename, client.lastname].filter(Boolean).join(' ').trim(),
      client.fullname
    ].filter((value, index, values): value is string => !!value && values.indexOf(value) === index);
  }

  /**
   * Returns normalized address strings ordered by specificity.
   */
  private getAddressCandidates(addresses: ClientAddressRecord[]): string[] {
    const addressLines = addresses
      .filter((address) => address?.isActive !== false)
      .map((address) => {
        const line = [
          address.addressLine1,
          address.addressLine2,
          address.addressLine3,
          address.street,
          address.city,
          address.stateProvinceName ?? address.stateProvince,
          address.countyDistrictName ?? address.countyDistrict,
          address.postalCode,
          address.countryName ?? address.country
        ]
          .filter(Boolean)
          .map((value) => String(value).trim())
          .filter(Boolean)
          .join(', ');

        return line;
      })
      .filter(Boolean);

    return addressLines.filter((value, index, values) => values.indexOf(value) === index);
  }

  /**
   * Maps Fineract legal forms to the closest entity schema understood by Yente.
   */
  private getClientSchema(client: ScreenableClient): string {
    return client?.legalForm?.id === LegalFormId.ENTITY ? 'Company' : 'Person';
  }

  private asStringArray(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value.map((item) => String(item)).filter(Boolean);
    }
    if (value == null || value === '') {
      return [];
    }
    return [String(value)];
  }

  private toThreshold(value: string | number | undefined, fallback: number): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
}
