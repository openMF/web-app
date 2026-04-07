/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

import { ClientsService } from './clients.service';

describe('ClientsService', () => {
  let service: ClientsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ClientsService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ClientsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    jest.restoreAllMocks();
  });

  describe('Client CRUD Operations', () => {
    it('should fetch clients with correct HttpParams (GET /clients)', async () => {
      const mockResponse = { totalFilteredRecords: 1, pageItems: [{ id: 1 }] };
      const resultPromise = firstValueFrom(service.getClients('displayName', 'ASC', 0, 10));

      const req = httpMock.expectOne((r) => r.url === '/clients' && r.method === 'GET');
      expect(req.request.params.get('orderBy')).toBe('displayName');
      expect(req.request.params.get('sortOrder')).toBe('ASC');
      expect(req.request.params.get('offset')).toBe('0');
      expect(req.request.params.get('limit')).toBe('10');

      req.flush(mockResponse);
      const result = (await resultPromise) as any;
      expect(result.totalFilteredRecords).toBe(1);
    });

    it('should fetch single client data (GET /clients/:id)', async () => {
      const mockClient = { id: 123, displayName: 'John Doe', status: { value: 'Active' } };
      const resultPromise = firstValueFrom(service.getClientData('123'));

      const req = httpMock.expectOne((r) => r.url === '/clients/123' && r.method === 'GET');
      req.flush(mockClient);

      const result = (await resultPromise) as any;
      expect(result.displayName).toBe('John Doe');
      expect(result.status.value).toBe('Active');
    });

    it('should create a client (POST /clients)', async () => {
      const newClient = { fullname: 'Jane Doe', officeId: 1, active: true };
      const mockResponse = { resourceId: 456 };
      const resultPromise = firstValueFrom(service.createClient(newClient));

      const req = httpMock.expectOne((r) => r.url === '/clients' && r.method === 'POST');
      expect(req.request.body).toEqual(newClient);

      req.flush(mockResponse);
      const result = (await resultPromise) as any;
      expect(result.resourceId).toBe(456);
    });

    it('should update a client (PUT /clients/:id)', async () => {
      const updateData = { displayName: 'Jane Smith' };
      const mockResponse = { resourceId: 123, changes: { displayName: 'Jane Smith' } };
      const resultPromise = firstValueFrom(service.updateClient('123', updateData));

      const req = httpMock.expectOne((r) => r.url === '/clients/123' && r.method === 'PUT');
      expect(req.request.body).toEqual(updateData);

      req.flush(mockResponse);
      const result = (await resultPromise) as any;
      expect(result.changes.displayName).toBe('Jane Smith');
    });

    it('should delete a client (DELETE /clients/:id)', async () => {
      const mockResponse = { resourceId: 123 };
      const resultPromise = firstValueFrom(service.deleteClient('123'));

      const req = httpMock.expectOne((r) => r.url === '/clients/123' && r.method === 'DELETE');
      req.flush(mockResponse);

      const result = (await resultPromise) as any;
      expect(result.resourceId).toBe(123);
    });
  });

  describe('Client Commands', () => {
    it('should execute command with ?command= param (POST /clients/:id)', async () => {
      const commandData = {
        activationDate: '15 January 2026',
        dateFormat: 'dd MMMM yyyy',
        locale: 'en'
      };
      const mockResponse = { resourceId: 123 };
      const resultPromise = firstValueFrom(service.executeClientCommand('123', 'activate', commandData));

      const req = httpMock.expectOne((r) => r.url === '/clients/123' && r.method === 'POST');
      expect(req.request.params.get('command')).toBe('activate');
      expect(req.request.body).toEqual(commandData);

      req.flush(mockResponse);
      const result = (await resultPromise) as any;
      expect(result.resourceId).toBe(123);
    });

    it('should pass different command types (close, reject, withdraw)', async () => {
      const commandData = {
        closureDate: '20 February 2026',
        closureReasonId: 10,
        dateFormat: 'dd MMMM yyyy',
        locale: 'en'
      };
      const resultPromise = firstValueFrom(service.executeClientCommand('456', 'close', commandData));

      const req = httpMock.expectOne((r) => r.url === '/clients/456' && r.method === 'POST');
      expect(req.request.params.get('command')).toBe('close');
      expect(req.request.body.closureReasonId).toBe(10);

      req.flush({ resourceId: 456 });
      await resultPromise;
    });
  });

  describe('Client Charges', () => {
    it('should fetch charges with pendingPayment=true (GET)', async () => {
      const mockCharges = [{ id: 1, chargeId: 10, amount: 500 }];
      const resultPromise = firstValueFrom(service.getClientChargesData('123'));

      const req = httpMock.expectOne((r) => r.url === '/clients/123/charges' && r.method === 'GET');
      expect(req.request.params.get('pendingPayment')).toBe('true');

      req.flush(mockCharges);
      const result = (await resultPromise) as any;
      expect(result[0].amount).toBe(500);
    });

    it('should pay client charge with paycharge command (POST)', async () => {
      const payment = { amount: 250, transactionDate: '15 January 2026' };
      const resultPromise = firstValueFrom(service.payClientCharge('123', '10', payment));

      const req = httpMock.expectOne((r) => r.url === '/clients/123/charges/10' && r.method === 'POST');
      expect(req.request.params.get('command')).toBe('paycharge');
      expect(req.request.body).toEqual(payment);

      req.flush({ resourceId: 10 });
      await resultPromise;
    });

    it('should waive client charge with waive command (POST)', async () => {
      const chargeData = { clientId: '123', resourceType: '10' };
      const resultPromise = firstValueFrom(service.waiveClientCharge(chargeData));

      const req = httpMock.expectOne((r) => r.url === '/clients/123/charges/10' && r.method === 'POST');
      expect(req.request.params.get('command')).toBe('waive');
      expect(req.request.body).toEqual(chargeData);

      req.flush({ resourceId: 10 });
      await resultPromise;
    });
  });

  describe('Client Transactions', () => {
    it('should undo transaction with inline ?command=undo (POST)', async () => {
      const transactionData = { clientId: '123', transactionId: '99' };
      const resultPromise = firstValueFrom(service.undoTransaction(transactionData));

      const req = httpMock.expectOne((r) => r.url === '/clients/123/transactions/99' && r.method === 'POST');
      expect(req.request.params.get('command')).toBe('undo');
      expect(req.request.body).toEqual(transactionData);

      req.flush({ resourceId: 99 });
      await resultPromise;
    });
  });

  describe('Client Profile Image', () => {
    it('should fetch image with responseType text and maxHeight param (GET)', async () => {
      const mockImageData = 'data:image/png;base64,iVBOR...';
      const resultPromise = firstValueFrom(service.getClientProfileImage('123'));

      const req = httpMock.expectOne((r) => r.url === '/clients/123/images' && r.method === 'GET');
      expect(req.request.params.get('maxHeight')).toBe('150');
      expect(req.request.responseType).toBe('text');

      req.flush(mockImageData);
      const result = await resultPromise;
      expect(result).toBe(mockImageData);
    });

    it('should return null on 404 (catchError swallows it)', async () => {
      const resultPromise = firstValueFrom(service.getClientProfileImage('123'));

      const req = httpMock.expectOne((r) => r.url === '/clients/123/images' && r.method === 'GET');
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });

      const result = await resultPromise;
      expect(result).toBeNull();
    });

    it('should rethrow non-404 errors', async () => {
      const resultPromise = firstValueFrom(service.getClientProfileImage('123'));

      const req = httpMock.expectOne((r) => r.url === '/clients/123/images' && r.method === 'GET');

      const assertion = expect(resultPromise).rejects.toMatchObject({ status: 500 });
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

      await assertion;
    });
  });

  describe('Client Image Upload', () => {
    it('should upload image as FormData with correct fields (POST)', async () => {
      const mockFile = new File(['test-image-content'], 'profile.png', { type: 'image/png' });
      const resultPromise = firstValueFrom(service.uploadClientProfileImage('123', mockFile));

      const req = httpMock.expectOne((r) => r.url === '/clients/123/images' && r.method === 'POST');

      expect(req.request.body instanceof FormData).toBe(true);
      const body = req.request.body as FormData;
      expect(body.has('file')).toBe(true);
      expect(body.get('filename')).toBe('file');

      req.flush({ resourceId: 1 });
      await resultPromise;
    });
  });

  describe('Client Family Members', () => {
    it('should fetch family members (GET /clients/:id/familymembers)', async () => {
      const mockMembers = [
        { id: 1, firstName: 'Alice', relationship: { name: 'Spouse' } },
        { id: 2, firstName: 'Bob', relationship: { name: 'Child' } }
      ];
      const resultPromise = firstValueFrom(service.getClientFamilyMembers('123'));

      const req = httpMock.expectOne((r) => r.url === '/clients/123/familymembers' && r.method === 'GET');

      req.flush(mockMembers);
      const result = (await resultPromise) as any;
      expect(result.length).toBe(2);
      expect(result[0].firstName).toBe('Alice');
      expect(result[1].relationship.name).toBe('Child');
    });
  });
});
