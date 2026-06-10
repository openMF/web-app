/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { describe, beforeEach, afterEach, expect, it } from '@jest/globals';
import { environment } from 'environments/environment';
import { LegalFormId } from '../models/legal-form.enum';
import { ClientScreeningService } from './client-screening.service';

describe('ClientScreeningService', () => {
  let service: ClientScreeningService;
  let httpMock: HttpTestingController;

  const originalEnvironment = {
    enableYenteScreening: environment.enableYenteScreening,
    yenteScreeningUrl: environment.yenteScreeningUrl,
    yenteScreeningDataset: environment.yenteScreeningDataset,
    yenteMatchThreshold: environment.yenteMatchThreshold,
    yentePossibleMatchThreshold: environment.yentePossibleMatchThreshold
  };

  beforeEach(() => {
    environment.enableYenteScreening = true;
    environment.yenteScreeningUrl = 'http://18.170.223.254:8000';
    environment.yenteScreeningDataset = 'sanctions';
    environment.yenteMatchThreshold = 0.85;
    environment.yentePossibleMatchThreshold = 0.7;

    TestBed.configureTestingModule({
      providers: [
        ClientScreeningService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(ClientScreeningService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    environment.enableYenteScreening = originalEnvironment.enableYenteScreening;
    environment.yenteScreeningUrl = originalEnvironment.yenteScreeningUrl;
    environment.yenteScreeningDataset = originalEnvironment.yenteScreeningDataset;
    environment.yenteMatchThreshold = originalEnvironment.yenteMatchThreshold;
    environment.yentePossibleMatchThreshold = originalEnvironment.yentePossibleMatchThreshold;
  });

  it('should screen client name and normalize a match response', async () => {
    const resultPromise = firstValueFrom(
      service.screenClientName({
        id: 11,
        displayName: 'Jane Doe',
        firstname: 'Jane',
        lastname: 'Doe',
        legalForm: { id: LegalFormId.PERSON }
      })
    );

    const req = httpMock.expectOne('http://18.170.223.254:8000/match/sanctions');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.queries['client-name-11'].schema).toBe('Person');
    expect(req.request.body.queries['client-name-11'].properties.name).toEqual(['Jane Doe']);

    req.flush({
      responses: {
        'client-name-11': {
          results: [
            {
              id: 'nk-abcd',
              caption: 'Jane Doe',
              schema: 'Person',
              score: 0.93,
              datasets: ['sanctions'],
              properties: {
                country: ['KE'],
                address: ['Nairobi']
              },
              sourceUrl: 'https://example.test/entity'
            }
          ]
        }
      }
    });

    const result = await resultPromise;
    expect(result.status).toBe('match');
    expect(result.matches).toHaveLength(1);
    expect(result.matches[0].caption).toBe('Jane Doe');
    expect(result.matches[0].datasets).toEqual(['sanctions']);
    expect(result.matches[0].countries).toEqual(['KE']);
  });

  it('should classify a low-score result as clear', async () => {
    const resultPromise = firstValueFrom(
      service.screenClientName({
        id: 12,
        displayName: 'Acme Ventures',
        legalForm: { id: LegalFormId.ENTITY }
      })
    );

    const req = httpMock.expectOne('http://18.170.223.254:8000/match/sanctions');
    expect(req.request.body.queries['client-name-12'].schema).toBe('Company');

    req.flush({
      responses: {
        'client-name-12': {
          results: [
            {
              id: 'entity-1',
              caption: 'Acme Ventures Ltd',
              score: 0.55,
              datasets: ['sanctions']
            }
          ]
        }
      }
    });

    const result = await resultPromise;
    expect(result.status).toBe('clear');
    expect(result.matches[0].score).toBe(0.55);
  });

  it('should reject address screening when there is no usable address data', async () => {
    await expect(
      firstValueFrom(
        service.screenClientAddress(
          {
            id: 13,
            displayName: 'No Address Client'
          },
          []
        )
      )
    ).rejects.toThrow('errors.clientScreeningMissingAddress');
  });
});
