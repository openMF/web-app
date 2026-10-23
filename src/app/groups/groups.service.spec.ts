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
import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';

import { GroupsService } from './groups.service';

describe('GroupsService', () => {
  let service: GroupsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GroupsService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(GroupsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loads the group template for an office', () => {
    service.getStaff(3).subscribe();

    const request = httpMock.expectOne((req) => req.url === '/groups/template');
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('officeId')).toBe('3');
    expect(request.request.params.get('staffInSelectedOfficeOnly')).toBe('true');
    expect(request.request.params.has('centerId')).toBe(false);
    request.flush({});
  });

  it('loads the group template for a center', () => {
    service.getCenterGroupTemplate(7).subscribe();

    const request = httpMock.expectOne((req) => req.url === '/groups/template');
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('centerId')).toBe('7');
    expect(request.request.params.has('officeId')).toBe(false);
    request.flush({});
  });
});
