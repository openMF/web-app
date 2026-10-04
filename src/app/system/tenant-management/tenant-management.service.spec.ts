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
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

import { AlertService } from 'app/core/alert/alert.service';
import { SettingsService } from 'app/settings/settings.service';
import { TenantManagementService } from './tenant-management.service';

describe('TenantManagementService error reporting', () => {
  let service: TenantManagementService;
  let httpMock: HttpTestingController;
  let alerts: { type: string; message: string }[];

  const baseUrl = 'https://fineract.example.org/fineract-provider/api/v1/admin/tenants';

  /** A classified refusal, shaped as the plugin sends it since MX-421. */
  const credentialsRejected = {
    errors: [
      {
        defaultUserMessage: 'The database server at db:5432 rejected the supplied credentials',
        userMessageGlobalisationCode: 'error.msg.tenant.connection.credentials.rejected'
      }
    ]
  };

  beforeEach(() => {
    alerts = [];
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: SettingsService,
          useValue: { baseServerUrl: 'https://fineract.example.org/fineract-provider/api' }
        },
        {
          provide: AlertService,
          useValue: { alert: jest.fn((alert: any) => alerts.push(alert)) }
        }
      ]
    });

    // The dotted code is a literal key nested inside `errors`, which is how every Fineract
    // globalisation code is stored. This asserts the lookup actually resolves that shape.
    TestBed.inject(TranslateService).setTranslation('en-US', {
      errors: {
        tenantManagement: { type: 'Tenant Management', unknown: 'It failed.' },
        'error.msg.tenant.connection.credentials.rejected': 'The database refused the credentials.'
      }
    });
    TestBed.inject(TranslateService).use('en-US');

    service = TestBed.inject(TenantManagementService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('prefers the classification over the backend English', () => {
    service.getTenants({}).subscribe({ error: () => undefined });
    httpMock
      .expectOne((request) => request.url === baseUrl)
      .flush(credentialsRejected, { status: 403, statusText: 'Forbidden' });

    expect(alerts[0].message).toBe('The database refused the credentials.');
  });

  it('falls back to the backend message for a code it cannot translate', () => {
    service.getTenants({}).subscribe({ error: () => undefined });
    httpMock
      .expectOne((request) => request.url === baseUrl)
      .flush(
        {
          errors: [
            {
              defaultUserMessage: 'Something the UI has no wording for',
              userMessageGlobalisationCode: 'error.msg.tenant.something.new'
            }
          ]
        },
        { status: 403, statusText: 'Forbidden' }
      );

    expect(alerts[0].message).toBe('Something the UI has no wording for');
  });

  it('falls back to a generic line when the body carries neither', () => {
    service.getTenants({}).subscribe({ error: () => undefined });
    httpMock.expectOne((request) => request.url === baseUrl).flush(null, { status: 500, statusText: 'Server Error' });

    expect(alerts[0].message).toBe('It failed.');
  });
});
