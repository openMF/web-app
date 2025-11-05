import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ClientsService } from './clients.service';

describe('ClientsService', () => {
  let service: ClientsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ClientsService]
    });
    service = TestBed.inject(ClientsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getFilteredClients', () => {
    it('should fetch filtered clients with all parameters', () => {
      const mockClients = { pageItems: [{ id: 1, displayName: 'Client A' }] };

      service.getFilteredClients('displayName', 'ASC', true, 'Test Client', 1).subscribe((data) => {
        expect(data).toEqual(mockClients);
      });

      const req = httpMock.expectOne(
        (req) =>
          req.url === '/clients' &&
          req.params.get('displayName') === 'Test Client' &&
          req.params.get('orphansOnly') === 'true' &&
          req.params.get('sortOrder') === 'ASC' &&
          req.params.get('orderBy') === 'displayName' &&
          req.params.get('officeId') === '1'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockClients);
    });

    it('should fetch filtered clients without officeId', () => {
      const mockClients = { pageItems: [] as any[] };

      service.getFilteredClients('displayName', 'DESC', false, 'Search').subscribe((data) => {
        expect(data).toEqual(mockClients);
      });

      const req = httpMock.expectOne(
        (req) =>
          req.url === '/clients' &&
          req.params.get('displayName') === 'Search' &&
          req.params.get('orphansOnly') === 'false' &&
          !req.params.has('officeId')
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockClients);
    });
  });

  describe('getClients', () => {
    it('should fetch clients with pagination', () => {
      const mockClients = { totalFilteredRecords: 100, pageItems: [] as any[] };

      service.getClients('id', 'ASC', 0, 10).subscribe((data) => {
        expect(data).toEqual(mockClients);
      });

      const req = httpMock.expectOne(
        (req) =>
          req.url === '/clients' &&
          req.params.get('offset') === '0' &&
          req.params.get('limit') === '10' &&
          req.params.get('sortOrder') === 'ASC' &&
          req.params.get('orderBy') === 'id'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockClients);
    });
  });

  describe('getClientTemplate', () => {
    it('should fetch client template', () => {
      const mockTemplate = { officeOptions: [] as any[], staffOptions: [] as any[] };

      service.getClientTemplate().subscribe((data) => {
        expect(data).toEqual(mockTemplate);
      });

      const req = httpMock.expectOne('/clients/template');
      expect(req.request.method).toBe('GET');
      req.flush(mockTemplate);
    });
  });

  describe('getClientWithOfficeTemplate', () => {
    it('should fetch client template with office ID', () => {
      const mockTemplate = { officeId: 1, staffOptions: [] as any[] };

      service.getClientWithOfficeTemplate(1).subscribe((data) => {
        expect(data).toEqual(mockTemplate);
      });

      const req = httpMock.expectOne('/clients/template?officeId=1&staffInSelectedOfficeOnly=true');
      expect(req.request.method).toBe('GET');
      req.flush(mockTemplate);
    });
  });

  describe('getClientData', () => {
    it('should fetch single client data', () => {
      const mockClient = { id: 1, displayName: 'John Doe' };

      service.getClientData('1').subscribe((data) => {
        expect(data).toEqual(mockClient);
      });

      const req = httpMock.expectOne('/clients/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockClient);
    });
  });

  describe('createClient', () => {
    it('should create client', () => {
      const clientData = { firstname: 'John', lastname: 'Doe', officeId: 1 };
      const mockResponse = { clientId: 1, resourceId: 1 };

      service.createClient(clientData).subscribe((data) => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/clients');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(clientData);
      req.flush(mockResponse);
    });
  });

  describe('updateClient', () => {
    it('should update client', () => {
      const clientData = { firstname: 'Jane', lastname: 'Doe' };
      const mockResponse = { changes: { firstname: 'Jane' } };

      service.updateClient('1', clientData).subscribe((data) => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/clients/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(clientData);
      req.flush(mockResponse);
    });
  });

  describe('deleteClient', () => {
    it('should delete client', () => {
      const mockResponse = { clientId: 1 };

      service.deleteClient('1').subscribe((data) => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/clients/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('getClientDataAndTemplate', () => {
    it('should fetch client data with template', () => {
      const mockData = { id: 1, displayName: 'Client', officeOptions: [] as any[] };

      service.getClientDataAndTemplate('1').subscribe((data) => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(
        (req) =>
          req.url === '/clients/1' &&
          req.params.get('template') === 'true' &&
          req.params.get('staffInSelectedOfficeOnly') === 'true'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });
  });

  describe('getClientDatatables', () => {
    it('should fetch client datatables', () => {
      const mockDatatables = [{ registeredTableName: 'client_extra_data' }];

      service.getClientDatatables().subscribe((data) => {
        expect(data).toEqual(mockDatatables);
      });

      const req = httpMock.expectOne((req) => req.url === '/datatables' && req.params.get('apptable') === 'm_client');
      expect(req.request.method).toBe('GET');
      req.flush(mockDatatables);
    });
  });

  describe('getClientDatatable', () => {
    it('should fetch client datatable data', () => {
      const mockData = { data: [{ id: 1, value: 'test' }] };

      service.getClientDatatable('1', 'client_extra_data').subscribe((data) => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(
        (req) => req.url === '/datatables/client_extra_data/1' && req.params.get('genericResultSet') === 'true'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });
  });

  describe('addClientDatatableEntry', () => {
    it('should add datatable entry', () => {
      const datatableData = { field1: 'value1' };
      const mockResponse = { resourceId: 1 };

      service.addClientDatatableEntry('1', 'client_extra_data', datatableData).subscribe((data) => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        (req) => req.url === '/datatables/client_extra_data/1' && req.params.get('genericResultSet') === 'true'
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(datatableData);
      req.flush(mockResponse);
    });
  });

  describe('editClientDatatableEntry', () => {
    it('should edit datatable entry', () => {
      const datatableData = { field1: 'updated_value' };
      const mockResponse = { changes: { field1: 'updated_value' } };

      service.editClientDatatableEntry('1', 'client_extra_data', datatableData).subscribe((data) => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        (req) => req.url === '/datatables/client_extra_data/1' && req.params.get('genericResultSet') === 'true'
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(datatableData);
      req.flush(mockResponse);
    });
  });

  describe('deleteDatatableContent', () => {
    it('should delete datatable content', () => {
      const mockResponse = { resourceId: 1 };

      service.deleteDatatableContent('1', 'client_extra_data').subscribe((data) => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        (req) => req.url === '/datatables/client_extra_data/1' && req.params.get('genericResultSet') === 'true'
      );
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('getClientAccountData', () => {
    it('should fetch client account data', () => {
      const mockAccounts = { loanAccounts: [] as any[], savingsAccounts: [] as any[] };

      service.getClientAccountData('1').subscribe((data) => {
        expect(data).toEqual(mockAccounts);
      });

      const req = httpMock.expectOne('/clients/1/accounts');
      expect(req.request.method).toBe('GET');
      req.flush(mockAccounts);
    });
  });

  describe('getClientChargesData', () => {
    it('should fetch client charges with pending payment', () => {
      const mockCharges = { pageItems: [{ id: 1, name: 'Charge 1' }] };

      service.getClientChargesData('1').subscribe((data) => {
        expect(data).toEqual(mockCharges);
      });

      const req = httpMock.expectOne(
        (req) => req.url === '/clients/1/charges' && req.params.get('pendingPayment') === 'true'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockCharges);
    });
  });

  describe('getSelectedChargeData', () => {
    it('should fetch selected charge data', () => {
      const mockCharge = { id: 1, name: 'Charge 1', amount: 100 };

      service.getSelectedChargeData('1', '1').subscribe((data) => {
        expect(data).toEqual(mockCharge);
      });

      const req = httpMock.expectOne(
        (req) => req.url === '/clients/1/charges/1' && req.params.get('associations') === 'all'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockCharge);
    });
  });

  describe('waiveClientCharge', () => {
    it('should waive client charge', () => {
      const chargeData = { clientId: '1', resourceType: '1', amount: 100 };
      const mockResponse = { resourceId: 1 };

      service.waiveClientCharge(chargeData).subscribe((data) => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        (req) => req.url === '/clients/1/charges/1' && req.params.get('command') === 'waive'
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(chargeData);
      req.flush(mockResponse);
    });
  });

  describe('getAllClientCharges', () => {
    it('should fetch all client charges', () => {
      const mockCharges = [{ id: 1, name: 'Charge 1' }];

      service.getAllClientCharges('1').subscribe((data) => {
        expect(data).toEqual(mockCharges);
      });

      const req = httpMock.expectOne('/clients/1/charges');
      expect(req.request.method).toBe('GET');
      req.flush(mockCharges);
    });
  });

  describe('undoTransaction', () => {
    it('should undo transaction', () => {
      const transactionData = { clientId: '1', transactionId: '1' };
      const mockResponse = { resourceId: 1 };

      service.undoTransaction(transactionData).subscribe((data) => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/clients/1/transactions/1?command=undo');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(transactionData);
      req.flush(mockResponse);
    });
  });

  describe('deleteCharge', () => {
    it('should delete charge', () => {
      const mockResponse = { resourceId: 1 };

      service.deleteCharge('1', '1').subscribe((data) => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/clients/1/charges/1?associations=all');
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('getClientTransactionPay', () => {
    it('should get client transaction pay data', () => {
      const mockData = { id: 1, chargeId: 1 };

      service.getClientTransactionPay('1', '1').subscribe((data) => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne('/clients/1/charges/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });
  });

  describe('payClientCharge', () => {
    it('should pay client charge', () => {
      const paymentData = { amount: 100, transactionDate: '2023-01-01' };
      const mockResponse = { resourceId: 1 };

      service.payClientCharge('1', '1', paymentData).subscribe((data) => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/clients/1/charges/1?command=paycharge');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(paymentData);
      req.flush(mockResponse);
    });
  });

  describe('getClientSummary', () => {
    it('should get client summary', () => {
      const mockSummary = { clientData: {} };

      service.getClientSummary('1').subscribe((data) => {
        expect(data).toEqual(mockSummary);
      });

      const req = httpMock.expectOne(
        (req) =>
          req.url === '/runreports/ClientSummary' &&
          req.params.get('R_clientId') === '1' &&
          req.params.get('genericResultSet') === 'false'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockSummary);
    });
  });

  describe('getClientProfileImage', () => {
    it('should fetch client profile image', () => {
      const mockImage = 'base64imagedata';

      service.getClientProfileImage('1').subscribe((data) => {
        expect(data).toEqual(mockImage);
      });

      const req = httpMock.expectOne((req) => req.url === '/clients/1/images' && req.params.get('maxHeight') === '150');
      expect(req.request.method).toBe('GET');
      req.flush(mockImage);
    });

    it('should return null when profile image not found', () => {
      service.getClientProfileImage('1').subscribe((data) => {
        expect(data).toBeNull();
      });

      const req = httpMock.expectOne((req) => req.url === '/clients/1/images');
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('uploadClientProfileImage', () => {
    it('should upload client profile image', () => {
      const mockFile = new File([''], 'profile.jpg');
      const mockResponse = { resourceId: 1 };

      service.uploadClientProfileImage('1', mockFile).subscribe((data) => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/clients/1/images');
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBeTruthy();
      req.flush(mockResponse);
    });
  });

  describe('uploadCapturedClientProfileImage', () => {
    it('should upload captured client profile image', () => {
      const imageURL = 'data:image/png;base64,imagedata';
      const mockResponse = { resourceId: 1 };

      service.uploadCapturedClientProfileImage('1', imageURL).subscribe((data) => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/clients/1/images');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(imageURL);
      req.flush(mockResponse);
    });
  });

  describe('deleteClientProfileImage', () => {
    it('should delete client profile image', () => {
      const mockResponse = { resourceId: 1 };

      service.deleteClientProfileImage('1').subscribe((data) => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/clients/1/images');
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('uploadClientSignatureImage', () => {
    it('should upload client signature image', () => {
      const mockFile = new File([''], 'signature.jpg');
      const mockResponse = { resourceId: 1 };

      service.uploadClientSignatureImage('1', mockFile).subscribe((data) => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/clients/1/documents');
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBeTruthy();
      req.flush(mockResponse);
    });
  });

  describe('getClientSignatureImage', () => {
    it('should get client signature image', () => {
      const mockBlob = new Blob(['signature'], { type: 'image/jpeg' });

      service.getClientSignatureImage('1', '1').subscribe((data) => {
        expect(data).toEqual(mockBlob);
      });

      const req = httpMock.expectOne('/clients/1/documents/1/attachment');
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(mockBlob);
    });
  });

  describe('getClientFamilyMembers', () => {
    it('should fetch client family members', () => {
      const mockMembers = [{ id: 1, firstname: 'Jane' }];

      service.getClientFamilyMembers('1').subscribe((data) => {
        expect(data).toEqual(mockMembers);
      });

      const req = httpMock.expectOne('/clients/1/familymembers');
      expect(req.request.method).toBe('GET');
      req.flush(mockMembers);
    });
  });

  describe('getClientFamilyMember', () => {
    it('should fetch single family member', () => {
      const mockMember = { id: 1, firstname: 'Jane' };

      service.getClientFamilyMember('1', '1').subscribe((data) => {
        expect(data).toEqual(mockMember);
      });

      const req = httpMock.expectOne('/clients/1/familymembers/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockMember);
    });
  });

  describe('addFamilyMember', () => {
    it('should add family member', () => {
      const memberData = { firstname: 'Jane', relationship: 'Spouse' };
      const mockResponse = { resourceId: 1 };

      service.addFamilyMember('1', memberData).subscribe((data) => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/clients/1/familymembers');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(memberData);
      req.flush(mockResponse);
    });
  });

  describe('editFamilyMember', () => {
    it('should edit family member', () => {
      const memberData = { firstname: 'Jane Updated' };
      const mockResponse = { changes: { firstname: 'Jane Updated' } };

      service.editFamilyMember('1', '1', memberData).subscribe((data) => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/clients/1/familymembers/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(memberData);
      req.flush(mockResponse);
    });
  });

  describe('deleteFamilyMember', () => {
    it('should delete family member', () => {
      const mockResponse = { resourceId: 1 };

      service.deleteFamilyMember('1', '1').subscribe((data) => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/clients/1/familymembers/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('getClientIdentifiers', () => {
    it('should fetch client identifiers', () => {
      const mockIdentifiers = [{ id: 1, documentType: 'Passport' }];

      service.getClientIdentifiers('1').subscribe((data) => {
        expect(data).toEqual(mockIdentifiers);
      });

      const req = httpMock.expectOne('/clients/1/identifiers');
      expect(req.request.method).toBe('GET');
      req.flush(mockIdentifiers);
    });
  });

  describe('getClientIdentifierTemplate', () => {
    it('should fetch client identifier template', () => {
      const mockTemplate = { allowedDocumentTypes: [] as any[] };

      service.getClientIdentifierTemplate('1').subscribe((data) => {
        expect(data).toEqual(mockTemplate);
      });

      const req = httpMock.expectOne('/clients/1/identifiers/template');
      expect(req.request.method).toBe('GET');
      req.flush(mockTemplate);
    });
  });

  describe('addClientIdentifier', () => {
    it('should add client identifier', () => {
      const identifierData = { documentTypeId: 1, documentKey: 'ABC123' };
      const mockResponse = { resourceId: 1 };

      service.addClientIdentifier('1', identifierData).subscribe((data) => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/clients/1/identifiers');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(identifierData);
      req.flush(mockResponse);
    });
  });

  describe('deleteClientIdentifier', () => {
    it('should delete client identifier', () => {
      const mockResponse = { resourceId: 1 };

      service.deleteClientIdentifier('1', '1').subscribe((data) => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/clients/1/identifiers/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('getClientIdentificationDocuments', () => {
    it('should get client identification documents', () => {
      const mockDocuments = [{ id: 1, name: 'Document 1' }];

      service.getClientIdentificationDocuments('1').subscribe((data) => {
        expect(data).toEqual(mockDocuments);
      });

      const req = httpMock.expectOne('/client_identifiers/1/documents');
      expect(req.request.method).toBe('GET');
      req.flush(mockDocuments);
    });
  });

  describe('downloadClientIdentificationDocument', () => {
    it('should download client identification document', () => {
      const mockBlob = new Blob(['document'], { type: 'application/pdf' });

      service.downloadClientIdentificationDocument('1', '1').subscribe((data) => {
        expect(data).toEqual(mockBlob);
      });

      const req = httpMock.expectOne('/client_identifiers/1/documents/1/attachment');
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(mockBlob);
    });
  });

  describe('uploadClientIdentifierDocument', () => {
    it('should upload client identifier document', () => {
      const documentData = new FormData();
      const mockResponse = { resourceId: 1 };

      service.uploadClientIdentifierDocument('1', documentData).subscribe((data) => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/client_identifiers/1/documents');
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('getClientDocuments', () => {
    it('should fetch client documents', () => {
      const mockDocuments = [{ id: 1, name: 'Document 1' }];

      service.getClientDocuments('1').subscribe((data) => {
        expect(data).toEqual(mockDocuments);
      });

      const req = httpMock.expectOne('/clients/1/documents');
      expect(req.request.method).toBe('GET');
      req.flush(mockDocuments);
    });
  });

  describe('downloadClientDocument', () => {
    it('should download client document', () => {
      const mockBlob = new Blob(['document content'], { type: 'application/pdf' });

      service.downloadClientDocument('1', '1').subscribe((data) => {
        expect(data).toEqual(mockBlob);
      });

      const req = httpMock.expectOne('/clients/1/documents/1/attachment');
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(mockBlob);
    });
  });

  describe('uploadClientDocument', () => {
    it('should upload client document', () => {
      const documentData = new FormData();
      const mockResponse = { resourceId: 1 };

      service.uploadClientDocument('1', documentData).subscribe((data) => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/clients/1/documents');
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('deleteClientDocument', () => {
    it('should delete client document', () => {
      const mockResponse = { resourceId: 1 };

      service.deleteClientDocument('1', '1').subscribe((data) => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/clients/1/documents/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('getClientNotes', () => {
    it('should fetch client notes', () => {
      const mockNotes = [{ id: 1, note: 'Test note' }];

      service.getClientNotes('1').subscribe((data) => {
        expect(data).toEqual(mockNotes);
      });

      const req = httpMock.expectOne('/clients/1/notes');
      expect(req.request.method).toBe('GET');
      req.flush(mockNotes);
    });
  });

  describe('createClientNote', () => {
    it('should create client note', () => {
      const noteData = { note: 'New note' };
      const mockResponse = { resourceId: 1 };

      service.createClientNote('1', noteData).subscribe((data) => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/clients/1/notes');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(noteData);
      req.flush(mockResponse);
    });
  });

  describe('editClientNote', () => {
    it('should edit client note', () => {
      const noteData = { note: 'Updated note' };
      const mockResponse = { changes: { note: 'Updated note' } };

      service.editClientNote('1', '1', noteData).subscribe((data) => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/clients/1/notes/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(noteData);
      req.flush(mockResponse);
    });
  });

  describe('deleteClientNote', () => {
    it('should delete client note', () => {
      const mockResponse = { resourceId: 1 };

      service.deleteClientNote('1', '1').subscribe((data) => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/clients/1/notes/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('getAddressFieldConfiguration', () => {
    it('should get address field configuration', () => {
      const mockConfig = { isAddressEnabled: true };

      service.getAddressFieldConfiguration().subscribe((data) => {
        expect(data).toEqual(mockConfig);
      });

      const req = httpMock.expectOne('/fieldconfiguration/ADDRESS');
      expect(req.request.method).toBe('GET');
      req.flush(mockConfig);
    });
  });

  describe('getClientAddressData', () => {
    it('should fetch client address data', () => {
      const mockAddresses = [{ id: 1, street: 'Main St' }];

      service.getClientAddressData('1').subscribe((data) => {
        expect(data).toEqual(mockAddresses);
      });

      const req = httpMock.expectOne('/client/1/addresses');
      expect(req.request.method).toBe('GET');
      req.flush(mockAddresses);
    });
  });

  describe('getClientAddressTemplate', () => {
    it('should get client address template', () => {
      const mockTemplate = { addressTypeIdOptions: [] as any[] };

      service.getClientAddressTemplate().subscribe((data) => {
        expect(data).toEqual(mockTemplate);
      });

      const req = httpMock.expectOne('/client/addresses/template');
      expect(req.request.method).toBe('GET');
      req.flush(mockTemplate);
    });
  });

  describe('createClientAddress', () => {
    it('should create client address', () => {
      const addressData = { street: 'Main St', city: 'New York' };
      const mockResponse = { resourceId: 1 };

      service.createClientAddress('1', '1', addressData).subscribe((data) => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/client/1/addresses?type=1');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(addressData);
      req.flush(mockResponse);
    });
  });

  describe('editClientAddress', () => {
    it('should edit client address', () => {
      const addressData = { street: 'Main St Updated' };
      const mockResponse = { changes: { street: 'Main St Updated' } };

      service.editClientAddress('1', '1', addressData).subscribe((data) => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/client/1/addresses?type=1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(addressData);
      req.flush(mockResponse);
    });
  });

  describe('executeClientCommand', () => {
    it('should execute client command', () => {
      const commandData = { activationDate: '2023-01-01' };
      const mockResponse = { changes: { status: 'active' } };

      service.executeClientCommand('1', 'activate', commandData).subscribe((data) => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne((req) => req.url === '/clients/1' && req.params.get('command') === 'activate');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(commandData);
      req.flush(mockResponse);
    });
  });

  describe('getClientCommandTemplate', () => {
    it('should get client command template', () => {
      const mockTemplate = { activationDate: [] as any[] };

      service.getClientCommandTemplate('activate').subscribe((data) => {
        expect(data).toEqual(mockTemplate);
      });

      const req = httpMock.expectOne(
        (req) => req.url === '/clients/template' && req.params.get('commandParam') === 'activate'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockTemplate);
    });
  });

  describe('getClientTransferProposalDate', () => {
    it('should get client transfer proposal date', () => {
      const mockData = { proposedTransferDate: '2023-01-01' };

      service.getClientTransferProposalDate('1').subscribe((data) => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne('/clients/1/transferproposaldate');
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });
  });

  describe('getClientChargeTemplate', () => {
    it('should get client charge template', () => {
      const mockTemplate = { chargeOptions: [] as any[] };

      service.getClientChargeTemplate('1').subscribe((data) => {
        expect(data).toEqual(mockTemplate);
      });

      const req = httpMock.expectOne('/clients/1/charges/template');
      expect(req.request.method).toBe('GET');
      req.flush(mockTemplate);
    });
  });

  describe('getChargeAndTemplate', () => {
    it('should get charge and template', () => {
      const mockData = { id: 1, name: 'Charge', template: {} };

      service.getChargeAndTemplate('1').subscribe((data) => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne((req) => req.url === '/charges/1' && req.params.get('template') === 'true');
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });
  });

  describe('createClientCharge', () => {
    it('should create client charge', () => {
      const chargeData = { chargeId: 1, amount: 100 };
      const mockResponse = { resourceId: 1 };

      service.createClientCharge('1', chargeData).subscribe((data) => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/clients/1/charges');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(chargeData);
      req.flush(mockResponse);
    });
  });

  describe('getClientReportTemplates', () => {
    it('should get client report templates', () => {
      const mockTemplates = [{ id: 1, name: 'Template 1' }];

      service.getClientReportTemplates().subscribe((data) => {
        expect(data).toEqual(mockTemplates);
      });

      const req = httpMock.expectOne(
        (req) => req.url === '/templates' && req.params.get('entityId') === '0' && req.params.get('typeId') === '0'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockTemplates);
    });
  });

  describe('retrieveClientReportTemplate', () => {
    it('should retrieve client report template', () => {
      const mockReport = 'Report content';

      service.retrieveClientReportTemplate('1', '1').subscribe((data) => {
        expect(data).toEqual(mockReport);
      });

      const req = httpMock.expectOne((req) => req.url === '/templates/1' && req.params.get('clientId') === '1');
      expect(req.request.method).toBe('POST');
      req.flush(mockReport);
    });
  });

  describe('getOffices', () => {
    it('should get offices', () => {
      const mockOffices = [{ id: 1, name: 'Head Office' }];

      service.getOffices().subscribe((data) => {
        expect(data).toEqual(mockOffices);
      });

      const req = httpMock.expectOne('/offices');
      expect(req.request.method).toBe('GET');
      req.flush(mockOffices);
    });
  });

  describe('getSurveys', () => {
    it('should get client surveys', () => {
      const mockSurveys = [{ id: 1, surveyName: 'Survey 1' }];

      service.getSurveys('1').subscribe((data) => {
        expect(data).toEqual(mockSurveys);
      });

      const req = httpMock.expectOne('/surveys/scorecards/clients/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockSurveys);
    });
  });

  describe('getAllSurveysType', () => {
    it('should get all surveys type', () => {
      const mockSurveyTypes = [{ id: 1, key: 'Survey Type 1' }];

      service.getAllSurveysType().subscribe((data) => {
        expect(data).toEqual(mockSurveyTypes);
      });

      const req = httpMock.expectOne('/surveys');
      expect(req.request.method).toBe('GET');
      req.flush(mockSurveyTypes);
    });
  });

  describe('createNewSurvey', () => {
    it('should create new survey', () => {
      const surveyData = { questionId: 1, responseText: 'Response' };
      const mockResponse = { resourceId: 1 };

      service.createNewSurvey(1, surveyData).subscribe((data) => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/surveys/scorecards/1');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(surveyData);
      req.flush(mockResponse);
    });
  });

  describe('createSelfServiceUser', () => {
    it('should create self service user', () => {
      const userData = { username: 'testuser', password: 'password' };
      const mockResponse = { resourceId: 1 };

      service.createSelfServiceUser(userData).subscribe((data) => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/users');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(userData);
      req.flush(mockResponse);
    });
  });

  describe('createClientCollateral', () => {
    it('should create client collateral', () => {
      const collateralData = { name: 'Collateral 1', value: 10000 };
      const mockResponse = { resourceId: 1 };

      service.createClientCollateral('1', collateralData).subscribe((data) => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/clients/1/collaterals');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(collateralData);
      req.flush(mockResponse);
    });
  });

  describe('getCollateralTemplate', () => {
    it('should get collateral template', () => {
      const mockTemplate = { collateralOptions: [] as any[] };

      service.getCollateralTemplate('1').subscribe((data) => {
        expect(data).toEqual(mockTemplate);
      });

      const req = httpMock.expectOne('/clients/1/collaterals/template');
      expect(req.request.method).toBe('GET');
      req.flush(mockTemplate);
    });
  });

  describe('searchByText', () => {
    it('should search clients by text with sorting', () => {
      const mockResults = { content: [{ id: 1, displayName: 'Test Client' }] };

      service.searchByText('Test', 0, 10, 'displayName', 'ASC').subscribe((data) => {
        expect(data).toEqual(mockResults);
      });

      const req = httpMock.expectOne('/v2/clients/search');
      expect(req.request.method).toBe('POST');
      expect(req.request.body.request.text).toEqual('Test');
      expect(req.request.body.page).toEqual(0);
      expect(req.request.body.size).toEqual(10);
      expect(req.request.body.sorts[0].property).toEqual('displayName');
      expect(req.request.body.sorts[0].direction).toEqual('ASC');
      req.flush(mockResults);
    });

    it('should search clients by text without sorting', () => {
      const mockResults = { content: [] as any[] };

      service.searchByText('Search', 0, 10).subscribe((data) => {
        expect(data).toEqual(mockResults);
      });

      const req = httpMock.expectOne('/v2/clients/search');
      expect(req.request.method).toBe('POST');
      expect(req.request.body.request.text).toEqual('Search');
      expect(req.request.body.sorts).toBeUndefined();
      req.flush(mockResults);
    });
  });
});
