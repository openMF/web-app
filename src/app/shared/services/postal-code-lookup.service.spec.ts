/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { PostalCodeLookupService } from './postal-code-lookup.service';
import { PostalCodeLookupResponse } from '../models/postal-code-lookup.model';
import { environment } from 'environments/environment';

describe('PostalCodeLookupService', () => {
  let service: PostalCodeLookupService;
  let mockHttpClient: { get: jest.Mock };
  let originalEnableLookup: boolean;

  const mockResponse: PostalCodeLookupResponse = {
    'post code': '90210',
    country: 'United States',
    'country abbreviation': 'US',
    places: [
      {
        'place name': 'Beverly Hills',
        longitude: '-118.4065',
        state: 'California',
        'state abbreviation': 'CA',
        latitude: '34.0901'
      }
    ]
  };

  beforeEach(() => {
    originalEnableLookup = environment.enablePostalCodeLookup;
    environment.enablePostalCodeLookup = true;

    mockHttpClient = {
      get: jest.fn().mockReturnValue(of(mockResponse))
    };

    TestBed.configureTestingModule({
      providers: [
        PostalCodeLookupService,
        { provide: HttpBackend, useValue: {} }
      ]
    });

    service = TestBed.inject(PostalCodeLookupService);
    (service as any).externalHttp = mockHttpClient as any;
  });

  afterEach(() => {
    environment.enablePostalCodeLookup = originalEnableLookup;
  });

  describe('resolveCountryCode', () => {
    it('returns null for null, undefined, empty, or whitespace countryName', () => {
      expect(service.resolveCountryCode(null as any)).toBeNull();
      expect(service.resolveCountryCode(undefined as any)).toBeNull();
      expect(service.resolveCountryCode('')).toBeNull();
      expect(service.resolveCountryCode('   ')).toBeNull();
    });

    it('returns null for non-string types or unknown country names', () => {
      expect(service.resolveCountryCode(123 as any)).toBeNull();
      expect(service.resolveCountryCode('UnknownLandia')).toBeNull();
    });

    it('resolves direct country names regardless of case and trimming', () => {
      expect(service.resolveCountryCode('United States')).toBe('us');
      expect(service.resolveCountryCode('  INDIA  ')).toBe('in');
      expect(service.resolveCountryCode('mexico')).toBe('mx');
      expect(service.resolveCountryCode('KENYA')).toBe('ke');
    });

    it('resolves country aliases', () => {
      expect(service.resolveCountryCode('Great Britain')).toBe('gb');
      expect(service.resolveCountryCode('Deutschland')).toBe('de');
      expect(service.resolveCountryCode('España')).toBe('es');
      expect(service.resolveCountryCode('Italia')).toBe('it');
    });
  });

  describe('findBestMatch', () => {
    const options = [
      { id: 1, name: 'California' },
      { id: 2, name: 'New York' },
      { id: 3, name: 'Washington' },
      { id: 4, name: null as any },
      null as any,
      undefined as any,
      { id: 5, name: 123 as any }
    ];

    it('returns null when options is null, undefined, empty, or not an array', () => {
      expect(service.findBestMatch(null as any, 'California')).toBeNull();
      expect(service.findBestMatch(undefined as any, 'California')).toBeNull();
      expect(service.findBestMatch([], 'California')).toBeNull();
      expect(service.findBestMatch('invalid' as any, 'California')).toBeNull();
    });

    it('returns null when names list is empty or contains only falsy items', () => {
      expect(service.findBestMatch(options)).toBeNull();
      expect(service.findBestMatch(options, null as any, '', undefined as any)).toBeNull();
    });

    it('safely skips null items and options without valid string names', () => {
      const match = service.findBestMatch(options, 'California');
      expect(match).toEqual({ id: 1, name: 'California' });
    });

    it('matches exact name case-insensitively', () => {
      const match = service.findBestMatch(options, 'new york');
      expect(match).toEqual({ id: 2, name: 'New York' });
    });

    it('matches starts-with when exact match is absent', () => {
      const match = service.findBestMatch(options, 'Calif');
      expect(match).toEqual({ id: 1, name: 'California' });
    });

    it('matches contains for candidate with 4+ characters', () => {
      const match = service.findBestMatch(options, 'shing');
      expect(match).toEqual({ id: 3, name: 'Washington' });
    });

    it('does not perform contains match for candidates under 4 characters', () => {
      const match = service.findBestMatch(options, 'sh');
      expect(match).toBeNull();
    });
  });

  describe('toResolvedAddress', () => {
    it('returns null when response is null, undefined, or has empty/missing places', () => {
      expect(service.toResolvedAddress(null as any)).toBeNull();
      expect(service.toResolvedAddress({} as any)).toBeNull();
      expect(service.toResolvedAddress({ places: [] } as any)).toBeNull();
      expect(service.toResolvedAddress({ places: [null as any] } as any)).toBeNull();
    });

    it('extracts resolved address from valid response', () => {
      const address = service.toResolvedAddress(mockResponse);
      expect(address).toEqual({
        city: 'Beverly Hills',
        state: 'California',
        stateAbbreviation: 'CA',
        country: 'United States',
        countryAbbreviation: 'US'
      });
    });
  });

  describe('lookup', () => {
    it('returns of(null) when disabled', (done) => {
      environment.enablePostalCodeLookup = false;
      service.lookup('us', '90210').subscribe((result) => {
        expect(result).toBeNull();
        expect(mockHttpClient.get).not.toHaveBeenCalled();
        done();
      });
    });

    it('returns of(null) when countryCode or postalCode is empty/whitespace', (done) => {
      service.lookup('', '90210').subscribe((res1) => {
        expect(res1).toBeNull();
        service.lookup('us', '   ').subscribe((res2) => {
          expect(res2).toBeNull();
          expect(mockHttpClient.get).not.toHaveBeenCalled();
          done();
        });
      });
    });

    it('fetches address with encoded parameters when valid', (done) => {
      service.lookup('us', '90210').subscribe((result) => {
        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.get).toHaveBeenCalledWith('https://api.zippopotam.us/us/90210');
        done();
      });
    });

    it('catches HTTP errors and emits null', (done) => {
      mockHttpClient.get.mockReturnValue(throwError(() => new Error('Network error')));
      service.lookup('us', '00000').subscribe((result) => {
        expect(result).toBeNull();
        done();
      });
    });
  });

  describe('lookupWithFallback', () => {
    it('returns of(null) when disabled or postalCode is invalid', (done) => {
      environment.enablePostalCodeLookup = false;
      service.lookupWithFallback('90210').subscribe((result) => {
        expect(result).toBeNull();
        done();
      });
    });

    it('returns of(null) when countryCodes array is empty or not an array', (done) => {
      service.lookupWithFallback('90210', []).subscribe((res1) => {
        expect(res1).toBeNull();
        service.lookupWithFallback('90210', null as any).subscribe((res2) => {
          expect(res2).toBeNull();
          done();
        });
      });
    });

    it('emits the first successful response with valid places', (done) => {
      const failedResponse: PostalCodeLookupResponse = {
        'post code': '90210',
        country: 'Canada',
        'country abbreviation': 'CA',
        places: []
      };

      jest.spyOn(service, 'lookup').mockImplementation((country, postal) => {
        if (country === 'ca') return of(failedResponse);
        if (country === 'us') return of(mockResponse);
        return of(null);
      });

      service
        .lookupWithFallback('90210', [
          'ca',
          'us'
        ])
        .subscribe((result) => {
          expect(result).toEqual(mockResponse);
          done();
        });
    });
  });
});
