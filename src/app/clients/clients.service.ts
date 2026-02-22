/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpBackend, HttpHeaders } from '@angular/common/http';

/** rxjs Imports */
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { environment } from 'environments/environment';

/**
 * Clients service.
 */
@Injectable({
  providedIn: 'root'
})
export class ClientsService {
  private http = inject(HttpClient);
  private httpBackend = inject(HttpBackend);

  /** Separate HttpClient that bypasses interceptors (for external API calls) */
  private externalHttp = new HttpClient(this.httpBackend);

  getFilteredClients(
    orderBy: string,
    sortOrder: string,
    orphansOnly: boolean,
    displayName: string,
    officeId?: any
  ): Observable<any> {
    let httpParams = new HttpParams()
      .set('displayName', displayName)
      .set('orphansOnly', orphansOnly.toString())
      .set('sortOrder', sortOrder)
      .set('orderBy', orderBy);
    if (officeId) {
      httpParams = httpParams.set('officeId', officeId);
    }
    return this.http.get('/clients', { params: httpParams });
  }

  getClients(orderBy: string, sortOrder: string, offset: number, limit: number): Observable<any> {
    const httpParams = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString())
      .set('sortOrder', sortOrder)
      .set('orderBy', orderBy);
    return this.http.get('/clients', { params: httpParams });
  }

  getClientTemplate(): Observable<any> {
    return this.http.get('/clients/template');
  }

  getClientWithOfficeTemplate(officeId: number): Observable<any> {
    return this.http.get(`/clients/template?officeId=${officeId}&staffInSelectedOfficeOnly=true`);
  }

  getClientData(clientId: string) {
    return this.http.get(`/clients/${clientId}`);
  }

  createClient(client: any) {
    return this.http.post(`/clients`, client);
  }

  updateClient(clientId: string, client: any) {
    return this.http.put(`/clients/${clientId}`, client);
  }

  deleteClient(clientId: string) {
    return this.http.delete(`/clients/${clientId}`);
  }

  getClientDataAndTemplate(clientId: string) {
    const httpParams = new HttpParams().set('template', 'true').set('staffInSelectedOfficeOnly', 'true');
    return this.http.get(`/clients/${clientId}`, { params: httpParams });
  }

  getClientDatatables() {
    const httpParams = new HttpParams().set('apptable', 'm_client');
    return this.http.get(`/datatables`, { params: httpParams });
  }

  getClientDatatable(clientId: string, datatableName: string) {
    const httpParams = new HttpParams().set('genericResultSet', 'true');
    return this.http.get(`/datatables/${datatableName}/${clientId}`, { params: httpParams });
  }

  addClientDatatableEntry(clientId: string, datatableName: string, data: any) {
    const httpParams = new HttpParams().set('genericResultSet', 'true');
    return this.http.post(`/datatables/${datatableName}/${clientId}`, data, { params: httpParams });
  }

  editClientDatatableEntry(clientId: string, datatableName: string, data: any) {
    const httpParams = new HttpParams().set('genericResultSet', 'true');
    return this.http.put(`/datatables/${datatableName}/${clientId}`, data, { params: httpParams });
  }

  deleteDatatableContent(clientId: string, datatableName: string) {
    const httpParams = new HttpParams().set('genericResultSet', 'true');
    return this.http.delete(`/datatables/${datatableName}/${clientId}`, { params: httpParams });
  }

  getClientAccountData(clientId: string) {
    return this.http.get(`/clients/${clientId}/accounts`);
  }

  getClientChargesData(clientId: string) {
    const httpParams = new HttpParams().set('pendingPayment', 'true');
    return this.http.get(`/clients/${clientId}/charges`, { params: httpParams });
  }

  getSelectedChargeData(clientId: string, chargeId: string) {
    const httpParams = new HttpParams().set('associations', 'all');
    return this.http.get(`/clients/${clientId}/charges/${chargeId}`, { params: httpParams });
  }

  /**
   * @param chargeData Charge Data to be waived.
   */
  waiveClientCharge(chargeData: any) {
    const httpParams = new HttpParams().set('command', 'waive');
    return this.http.post(`/clients/${chargeData.clientId}/charges/${chargeData.resourceType}`, chargeData, {
      params: httpParams
    });
  }

  getAllClientCharges(clientId: string) {
    return this.http.get(`/clients/${clientId}/charges`);
  }

  /**
   * @param transactionData Transaction Data to be undone.
   */
  undoTransaction(transactionData: any) {
    return this.http.post(
      `/clients/${transactionData.clientId}/transactions/${transactionData.transactionId}?command=undo`,
      transactionData
    );
  }

  /**
   * @param clientId Client Id of the relevant charge.
   * @param chargeId Charge Id to be deleted.
   */
  deleteCharge(clientId: string, chargeId: string) {
    return this.http.delete(`/clients/${clientId}/charges/${chargeId}?associations=all`);
  }

  /*
   * @param clientId Client Id of payer.
   * @param chargeId Charge Id of the charge to be paid.
   */
  getClientTransactionPay(clientId: string, chargeId: string) {
    return this.http.get(`/clients/${clientId}/charges/${chargeId}`);
  }

  /**
   * @param clientId Client Id of the payment.
   * @param chargeId Charge Id of the payment.
   * @param payment  Client Payment data.
   */
  payClientCharge(clientId: string, chargeId: string, payment: any) {
    const httpParams = new HttpParams().set('command', 'paycharge');
    return this.http.post(`/clients/${clientId}/charges/${chargeId}?command=paycharge`, payment, {
      params: httpParams
    });
  }

  getClientSummary(clientId: string) {
    const httpParams = new HttpParams().set('R_clientId', clientId).set('genericResultSet', 'false');
    return this.http.get(`/runreports/ClientSummary`, { params: httpParams });
  }

  getClientProfileImage(clientId: string) {
    const httpParams = new HttpParams().set('maxHeight', '150');
    // Keep it simple since our interceptor will handle the 404 errors
    return this.http
      .get(`/clients/${clientId}/images`, {
        params: httpParams,
        responseType: 'text'
      })
      .pipe(
        // Handle the error here and return null when no image is found (404)
        catchError((error) => {
          if (error.status === 404) {
            // Client has no profile image - return null without propagating error
            return of(null);
          }
          // For other errors, rethrow the error
          return throwError(() => error);
        })
      );
  }

  uploadClientProfileImage(clientId: string, image: File) {
    const formData = new FormData();
    formData.append('file', image);
    formData.append('filename', 'file');
    return this.http.post(`/clients/${clientId}/images`, formData);
  }

  uploadCapturedClientProfileImage(clientId: string, imageURL: string) {
    return this.http.post(`/clients/${clientId}/images`, imageURL);
  }

  deleteClientProfileImage(clientId: string) {
    return this.http.delete(`/clients/${clientId}/images`);
  }

  uploadClientSignatureImage(clientId: string, signature: File) {
    const formData = new FormData();
    formData.append('file', signature);
    formData.append('name', 'clientSignature');
    formData.append('description', 'Client signature');
    return this.http.post(`/clients/${clientId}/documents`, formData);
  }

  getClientSignatureImage(clientId: string, documentId: string) {
    return this.http.get(`/clients/${clientId}/documents/${documentId}/attachment`, { responseType: 'blob' });
  }

  getClientFamilyMembers(clientId: string) {
    return this.http.get(`/clients/${clientId}/familymembers`);
  }

  getClientFamilyMember(clientId: string, familyMemberId: string) {
    return this.http.get(`/clients/${clientId}/familymembers/${familyMemberId}`);
  }

  addFamilyMember(clientId: string, familyMemberData: any) {
    return this.http.post(`/clients/${clientId}/familymembers`, familyMemberData);
  }

  editFamilyMember(clientId: string, familyMemberId: any, familyMemberData: any) {
    return this.http.put(`/clients/${clientId}/familymembers/${familyMemberId}`, familyMemberData);
  }

  deleteFamilyMember(clientId: string, familyMemberId: string) {
    return this.http.delete(`/clients/${clientId}/familymembers/${familyMemberId}`);
  }

  getClientIdentifiers(clientId: string) {
    return this.http.get(`/clients/${clientId}/identifiers`);
  }

  getClientIdentifierTemplate(clientId: string) {
    return this.http.get(`/clients/${clientId}/identifiers/template`);
  }

  addClientIdentifier(clientId: string, identifierData: any) {
    return this.http.post(`/clients/${clientId}/identifiers`, identifierData);
  }

  deleteClientIdentifier(clientId: string, identifierId: string) {
    return this.http.delete(`/clients/${clientId}/identifiers/${identifierId}`);
  }

  getClientIdentificationDocuments(documentId: string) {
    return this.http.get(`/client_identifiers/${documentId}/documents`);
  }

  downloadClientIdentificationDocument(parentEntityId: string, documentId: string) {
    return this.http.get(`/client_identifiers/${parentEntityId}/documents/${documentId}/attachment`, {
      responseType: 'blob'
    });
  }

  uploadClientIdentifierDocument(identifierId: string, documentData: any) {
    return this.http.post(`/client_identifiers/${identifierId}/documents`, documentData);
  }

  getClientDocuments(clientId: string) {
    return this.http.get(`/clients/${clientId}/documents`);
  }

  downloadClientDocument(parentEntityId: string, documentId: string) {
    return this.http.get(`/clients/${parentEntityId}/documents/${documentId}/attachment`, { responseType: 'blob' });
  }

  uploadClientDocument(clientId: string, documentData: any) {
    return this.http.post(`/clients/${clientId}/documents`, documentData);
  }

  deleteClientDocument(parentEntityId: string, documentId: string) {
    return this.http.delete(`/clients/${parentEntityId}/documents/${documentId}`);
  }

  getClientNotes(clientId: string) {
    return this.http.get(`/clients/${clientId}/notes`);
  }

  createClientNote(clientId: string, noteData: any) {
    return this.http.post(`/clients/${clientId}/notes`, noteData);
  }

  editClientNote(clientId: string, noteId: string, noteData: any) {
    return this.http.put(`/clients/${clientId}/notes/${noteId}`, noteData);
  }

  deleteClientNote(clientId: string, noteId: string) {
    return this.http.delete(`/clients/${clientId}/notes/${noteId}`);
  }

  getAddressFieldConfiguration() {
    return this.http.get(`/fieldconfiguration/ADDRESS`);
  }

  getClientAddressData(clientId: string) {
    return this.http.get(`/client/${clientId}/addresses`);
  }

  getClientAddressTemplate() {
    return this.http.get(`/client/addresses/template`);
  }

  createClientAddress(clientId: string, addressTypeId: string, addressData: any) {
    return this.http.post(`/client/${clientId}/addresses?type=${addressTypeId}`, addressData);
  }

  editClientAddress(clientId: string, addressTypeId: string, addressData: any) {
    return this.http.put(`/client/${clientId}/addresses?type=${addressTypeId}`, addressData);
  }

  executeClientCommand(clientId: string, command: string, data: any): Observable<any> {
    const httpParams = new HttpParams().set('command', command);
    return this.http.post(`/clients/${clientId}`, data, { params: httpParams });
  }

  getClientCommandTemplate(command: string): Observable<any> {
    const httpParams = new HttpParams().set('commandParam', command);
    return this.http.get(`/clients/template`, { params: httpParams });
  }

  getClientTransferProposalDate(clientId: any): Observable<any> {
    return this.http.get(`/clients/${clientId}/transferproposaldate`);
  }

  getClientChargeTemplate(clientId: any): Observable<any> {
    return this.http.get(`/clients/${clientId}/charges/template`);
  }

  getChargeAndTemplate(chargeId: any): Observable<any> {
    const httpParams = new HttpParams().set('template', 'true');
    return this.http.get(`/charges/${chargeId}`, { params: httpParams });
  }

  createClientCharge(clientId: any, charge: any) {
    return this.http.post(`/clients/${clientId}/charges`, charge);
  }

  getClientReportTemplates() {
    const httpParams = new HttpParams().set('entityId', '0').set('typeId', '0');
    return this.http.get('/templates', { params: httpParams });
  }

  retrieveClientReportTemplate(templateId: string, clientId: string) {
    const httpParams = new HttpParams().set('clientId', clientId);
    return this.http.get(`/templates/${templateId}`, { params: httpParams, responseType: 'text' });
  }

  /**
   * @returns {Observable<any>} Offices data
   */
  getOffices(): Observable<any> {
    return this.http.get('/offices');
  }

  /**
   * returns the list of survey data of the particular Client
   * @param clientId
   */
  getSurveys(clientId: string) {
    return this.http.get(`/surveys/scorecards/clients/${clientId}`);
  }

  /**
   * returns the list of survey types and questions
   */
  getAllSurveysType() {
    return this.http.get('/surveys');
  }

  /**
   * returns the response from the post request for that survey
   * @param surveyId
   * @param surveyData Survey Data submitted by client
   */
  createNewSurvey(surveyId: Number, surveyData: any) {
    return this.http.post(`/surveys/scorecards/${surveyId}`, surveyData);
  }

  /**
   * @param userData User Data.
   */
  createSelfServiceUser(userData: any) {
    return this.http.post(`/users`, userData);
  }

  /**
   * @param clientId Client ID.
   * @param collateralData Collateral Data
   */
  createClientCollateral(clientId: any, collateralData: any) {
    return this.http.post(`/clients/${clientId}/collaterals`, collateralData);
  }

  /**
   * @param clientId Client ID.
   */
  getCollateralTemplate(clientId: any) {
    return this.http.get(`/clients/${clientId}/collaterals/template`);
  }

  searchByText(text: string, page: number, pageSize: number, sortAttribute: string = '', sortDirection: string = '') {
    let request: any = {
      request: {
        text
      },
      page,
      size: pageSize
    };
    if (sortAttribute !== '' && sortDirection !== '') {
      request = {
        ...request,
        sorts: [
          {
            direction: sortDirection,
            property: sortAttribute
          }
        ]
      };
    }
    return this.http.post(`/v2/clients/search`, request);
  }

  /**
   * Lookup external National ID from the configured external system.
   * Uses a separate HttpClient (via HttpBackend) to bypass Angular interceptors
   * so that Fineract auth headers are not sent to the external API.
   *
   * In development, requests go through the dev proxy (/external-nationalid).
   * In production, requests go through the nginx reverse proxy.
   *
   * @param externalId The National ID string (e.g. CURP)
   */
  lookupExternalNationalId(externalId: string): Observable<any> {
    const apiUrl = environment.externalNationalIdSystemUrl;
    if (!apiUrl) {
      return throwError(() => new Error('External National ID System URL is not configured'));
    }

    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const apiHeader = environment.externalNationalIdSystemApiHeader;
    const apiKey = environment.externalNationalIdSystemApiKey;
    if (apiHeader && apiKey) {
      // Validate header name to prevent Angular from throwing on invalid header
      if (!/^[a-zA-Z][a-zA-Z0-9-]*$/.test(apiHeader)) {
        return throwError(() => new Error(`Invalid API header name: '${apiHeader}'`));
      }
      headers = headers.set(apiHeader, apiKey);
    }

    return this.externalHttp.post(apiUrl, { externalId }, { headers });
  }
}
