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

@Injectable()
export class ClientsService {
  /**
   * @param {HttpClient} http Http Client to send requests.
   */
  constructor(private http: HttpClient) { }

  getClients(): Observable<any> {
    const httpParams = new HttpParams().set('orderBy', 'id');
    return this.http.get('/clients', { params: httpParams });
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
}
