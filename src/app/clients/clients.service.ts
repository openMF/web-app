/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';
/**
 * Clients service.
 */
@Injectable({
  providedIn: 'root'
})
export class ClientsService {
  /**
   * @param {HttpClient} http Http Client to send requests.
   */
  constructor(private http: HttpClient) { }

  getClients(): Observable<any> {
    const httpParams = new HttpParams().set('orderBy', 'id');
    return this.http.get('/clients', { params: httpParams });
  }

  getClientTemplate(): Observable<any> {
    return this.http.get('/clients/template');
  }
  getClientData(clientId: string) {
    return this.http.get(`/clients/${clientId}`);
  }
  getClientAccountData(clientId: string) {
    return this.http.get(`/clients/${clientId}/accounts`);
  }
  getClientChargesData(clientId: string) {
    const httpParams = new HttpParams().set('pendingPayment', 'true');
    return this.http.get(`/clients/${clientId}/charges`, { params: httpParams });
  }
  getClientSummary(clientId: string) {
    const httpParams = new HttpParams().set('R_clientId', clientId)
      .set('genericResultSet', 'false');
    return this.http.get(`/runreports/ClientSummary`, { params: httpParams });
  }
  getClientProfileImage(clientId: string) {
    const httpParams = new HttpParams().set('maxHeight', '150');
    return this.http.get(`/clients/${clientId}/images`, { params: httpParams, responseType: 'text' });
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
}
