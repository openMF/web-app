/** TODO: Separate services for feature modules for cleaner accounting service. */

/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

/**
 * Credit Bureau Service.
 */
@Injectable({
  providedIn: 'root'
})
export class CreditBureauService {

  constructor(private http: HttpClient) { }

  getCreditBureauService(): Observable<any> {
    return this.http.get(`/CreditBureauConfiguration`);
  }

  getOrganisationCreditBureauService(): Observable<any> {
    return this.http.get(`/CreditBureauConfiguration/organisationCreditBureau`);
  }

  postCreditReport(params: any): Observable<any> {
    return this.http.post('/creditBureauIntegration/creditReport', params);
    }

  postCreditBureauService(id: String): Observable<any> {
    return this.http.get(`/CreditBureauConfiguration/${id}`);
  }

  getCreditBureauConfigurationService(organisationCreditBureauId: String): Observable<any> {
    return this.http.get(`/CreditBureauConfiguration/config/${organisationCreditBureauId}`);
  }

  updateCreditBureauConfigurationService(id: String): Observable<any> {
    return this.http.put(`/CreditBureauConfiguration/${id}`, id);
  }
}
