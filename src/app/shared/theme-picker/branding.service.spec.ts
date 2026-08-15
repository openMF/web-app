/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { SettingsService } from 'app/settings/settings.service';
import { BrandingService } from './branding.service';
import { BRANDING_API_PATH } from './theme.model';

describe('BrandingService', () => {
  let service: BrandingService;
  let httpMock: HttpTestingController;

  const serverUrl = 'https://core.example.org/fineract-provider/api/v1';
  const brandingUrl = `${serverUrl}${BRANDING_API_PATH}`;
  let tenantIdentifier: string;

  beforeEach(() => {
    tenantIdentifier = 'acme';

    TestBed.configureTestingModule({
      providers: [
        BrandingService,
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: SettingsService,
          useValue: {
            get serverUrl() {
              return serverUrl;
            },
            get tenantIdentifier() {
              return tenantIdentifier;
            }
          }
        }
      ]
    });

    service = TestBed.inject(BrandingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('reads branding without credentials', async () => {
    // The endpoint is public and is served by a chain that authenticates
    // against the self-service user store. Presenting the platform credentials
    // the interceptor attaches to every other request fails authentication
    // before the public rule is reached, so the read must carry none.
    const result = firstValueFrom(service.getTenantBranding());

    const request = httpMock.expectOne(brandingUrl);
    expect(request.request.method).toBe('GET');
    expect(request.request.headers.has('Authorization')).toBe(false);

    request.flush({ primaryColor: 'green' });
    expect(await result).toEqual({ primaryColor: 'green' });
  });

  it('identifies the tenant on the anonymous read', async () => {
    // Without credentials the tenant header is the only thing saying whose
    // branding to return.
    const result = firstValueFrom(service.getTenantBranding());

    const request = httpMock.expectOne(brandingUrl);
    expect(request.request.headers.get('Fineract-Platform-TenantId')).toBe('acme');

    request.flush({ primaryColor: 'green' });
    await result;
  });

  it('falls back to the default tenant when none is selected', async () => {
    tenantIdentifier = null;
    const result = firstValueFrom(service.getTenantBranding());

    const request = httpMock.expectOne(brandingUrl);
    expect(request.request.headers.get('Fineract-Platform-TenantId')).toBe('default');

    request.flush({ primaryColor: 'blue' });
    await result;
  });

  it('sends the selected colour as primaryColor when saving', async () => {
    // The write stays on the interceptor chain: it is authenticated and
    // permissioned, so it must carry credentials and the API prefix.
    const result = firstValueFrom(service.updateTenantBranding('purple'));

    const request = httpMock.expectOne((req) => req.url === BRANDING_API_PATH && req.method === 'PUT');
    expect(request.request.body).toEqual({ primaryColor: 'purple' });

    request.flush({ primaryColor: 'purple' });
    expect(await result).toEqual({ primaryColor: 'purple' });
  });

  it('surfaces a failed read to the caller so the theme can fall back', async () => {
    const result = firstValueFrom(service.getTenantBranding());

    httpMock.expectOne(brandingUrl).flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    await expect(result).rejects.toMatchObject({ status: 401 });
  });
});
