import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, URLSearchParams } from '@angular/http';
/* import { HttpHeaders, HttpClient } from '@angular/common/http';
 */
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ClientsService {
  constructor(private http: Http) {} // tslint:disable-line

  createAuthorizationHeader(headers: Headers) { // tslint:disable-line
    const username = 'mifos';
    const password = 'password';
    headers.append('Authorization', 'Basic ' + btoa(username + ':' + password));
    headers.append('Content-Type', 'application/json');
    headers.append('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    headers.append('Access-Control-Allow-Origin', '*');
  }

  getClients() {
    const headers = new Headers(); // tslint:disable-line
    this.createAuthorizationHeader(headers);
    return this.http.get(
        'https://demo.openmf.org/fineract-provider/api/v1/clients?tenantIdentifier=default&pretty=true', {
          headers: headers
        })
      .pipe(
        map(
          (response: Response) => { // tslint:disable-line
            response = response.json();
            return response['pageItems'];

          }
        )
      );
  }
  getClientId(clientId: number) {
    const headers = new Headers(); // tslint:disable-line
    this.createAuthorizationHeader(headers);
    return this.http.get('https://demo.openmf.org/fineract-provider/api/v1/clients/' + clientId +
        '?tenantIdentifier=default&pretty=true', {
          headers: headers
        })
      .pipe(
        map(
          (response: Response) => { // tslint:disable-line
            response = response.json();
            return response;

          }
        )
      );
  }

  getClientAccounts(clientId: number) {
    const headers = new Headers(); // tslint:disable-line
    this.createAuthorizationHeader(headers);
    return this.http.get('https://demo.openmf.org/fineract-provider/api/v1/clients/' + clientId +
        '/accounts' + '?tenantIdentifier=default&pretty=true', {
          headers: headers
        })
      .pipe(
        map(
          (response: Response) => { // tslint:disable-line
            response = response.json();
            return response;

          }
        )
      );
  }

  getClientCharges(clientId: number) {
    const headers = new Headers(); // tslint:disable-line
    this.createAuthorizationHeader(headers);
    return this.http.get('https://demo.openmf.org/fineract-provider/api/v1/clients/' + clientId +
        '/charges' + '?tenantIdentifier=default&pretty=true', {
          headers: headers
        })
      .pipe(
        map(
          (response: Response) => { // tslint:disable-line
            response = response.json();
            return response;

          }
        )
      );
  }

  getClientAddress(clientId: number) {
    const headers = new Headers(); // tslint:disable-line
    this.createAuthorizationHeader(headers);
    return this.http.get('https://demo.openmf.org/fineract-provider/api/v1/client/' + clientId +
        '/addresses' + '?tenantIdentifier=default&pretty=true', {
          headers: headers
        })
      .pipe(
        map(
          (response: Response) => { // tslint:disable-line
            response = response.json();
            return response;

          }
        )
      );
  }

  getClientNote(clientId: number) {
    const headers = new Headers(); // tslint:disable-line
    this.createAuthorizationHeader(headers);
    return this.http.get('https://demo.openmf.org/fineract-provider/api/v1/clients/' + clientId +
        '/notes' + '?tenantIdentifier=default&pretty=true', {
          headers: headers
        })
      .pipe(
        map(
          (response: Response) => { // tslint:disable-line
            response = response.json();
            return response;

          }
        )
      );
  }

  postClientNote(clientId: number, notes: any) {
    const headers = new Headers(); // tslint:disable-line
    this.createAuthorizationHeader(headers);
    const body = JSON.stringify(notes);
    return this.http.post('https://demo.openmf.org/fineract-provider/api/v1/clients/' + clientId +
        '/notes' + '?tenantIdentifier=default&pretty=true', notes, {
          headers: headers
        })
      .pipe(
        map(
          (response: Response) => { // tslint:disable-line
            response.json();
          }
        )
      );
  }

  getClientAddressTemplate() {
    const headers = new Headers(); // tslint:disable-line
    this.createAuthorizationHeader(headers);
    return this.http.get('https://demo.openmf.org/fineract-provider/api/v1/client/' +
        'addresses/template?tenantIdentifier=default', {
          headers: headers
        })
      .pipe(
        map(
          (response: Response) => { // tslint:disable-line
            response = response.json();
            return response;

          }
        )
      );
  }

  postClientAddress(clientId: number, body: any, type: any) {
    const headers = new Headers(); // tslint:disable-line
    const params = new URLSearchParams(); // tslint:disable-line
    params.set('type', type);
    this.createAuthorizationHeader(headers);
    body = JSON.stringify(body);
    const options = new RequestOptions({ // tslint:disable-line
      headers: headers,
      params: params,
    });
    return this.http.post('https://demo.openmf.org/fineract-provider/api/v1/client/' + clientId +
        '/addresses?' + '&tenantIdentifier=default&pretty=true', body,
        options)
      .pipe(
        map(
          (response: Response) => { // tslint:disable-line
            response.json();
          }
        )
      );
  }

  putClientAddress(clientId: number, body: any, type: any) {
    const headers = new Headers(); // tslint:disable-line
    const params = new URLSearchParams(); // tslint:disable-line
    params.set('type', type);
    this.createAuthorizationHeader(headers);
   // body = JSON.stringify(body);
    const options = new RequestOptions({ // tslint:disable-line
      headers: headers,
      params: params,
    });
    return this.http.put('https://demo.openmf.org/fineract-provider/api/v1/client/' + clientId +
        '/addresses?' + 'tenantIdentifier=default', body,
        options)
      .pipe(
        map(
          (response: Response) => { // tslint:disable-line
            response.json();
          }
        )
      );
  }

  getClientIdentifierTemplate(clientId: number) {
    const headers = new Headers(); // tslint:disable-line
    this.createAuthorizationHeader(headers);
    return this.http.get('https://demo.openmf.org/fineract-provider/api/v1/clients/' + clientId +
        '/identifiers/template?tenantIdentifier=default', {
          headers: headers
        })
      .pipe(
        map(
          (response: Response) => { // tslint:disable-line
            response = response.json();
            return response['allowedDocumentTypes'];

          }
        )
      );
  }

  getClientIdentifiers(clientId: number) {
    const headers = new Headers(); // tslint:disable-line
    this.createAuthorizationHeader(headers);
    return this.http.get('https://demo.openmf.org/fineract-provider/api/v1/clients/' + clientId +
        '/identifiers/?tenantIdentifier=default', {
          headers: headers
        })
      .pipe(
        map(
          (response: Response) => { // tslint:disable-line
            response = response.json();
            return response;

          }
        )
      );
  }

  postClientIdentifier(clientId: number, body: any) {
    const headers = new Headers(); // tslint:disable-line
    this.createAuthorizationHeader(headers);
    return this.http.post('https://demo.openmf.org/fineract-provider/api/v1/clients/' + clientId +
        '/identifiers/?tenantIdentifier=default', body, {
          headers: headers
        })
      .pipe(
        map(
          (response: Response) => { // tslint:disable-line
            response.json();
          }
        )
      );
  }

  deleteClientIdentifier(clientId: number, identifierId: number) {
    const headers = new Headers(); // tslint:disable-line
    this.createAuthorizationHeader(headers);
    return this.http.delete('https://demo.openmf.org/fineract-provider/api/v1/clients/' + clientId +
        '/identifiers/' + identifierId + '/?tenantIdentifier=default', {
          headers: headers
        })
      .pipe(
        map(
          (response: Response) => { // tslint:disable-line
            response.json();
          }
        )
      );
  }
  postClientDocument(clientId: number, body: any) {
    const headers = new Headers(); // tslint:disable-line
    this.createAuthorizationHeader(headers);
    headers.append('Content-Type', null);
    headers.append('Accept', 'multipart/form-data');
    body = JSON.stringify(body);

    return this.http.post('https://demo.openmf.org/fineract-provider/api/v1/clients/' + clientId +
        '/documents/?tenantIdentifier=default', body, {
          headers: headers
        })
      .pipe(
        map(
          (response: Response) => { // tslint:disable-line
            response.json();
          }
        )
      );
  }

  getClientDocuments(clientId: number) {
    const headers = new Headers(); // tslint:disable-line
    this.createAuthorizationHeader(headers);
    return this.http.get('https://demo.openmf.org/fineract-provider/api/v1/clients/' + clientId +
        '/documents/?tenantIdentifier=default', {
          headers: headers
        })
      .pipe(
        map(
          (response: Response) => { // tslint:disable-line
            return response.json();
          }
        )
      );
  }

  deleteClientDocuments(clientId: number, documentId: number) {
    const headers = new Headers(); // tslint:disable-line
    this.createAuthorizationHeader(headers);
    return this.http.delete('https://demo.openmf.org/fineract-provider/api/v1/clients/' + clientId +
        '/documents/' + documentId + '/?tenantIdentifier=default', {
          headers: headers
        })
      .pipe(
        map(
          (response: Response) => { // tslint:disable-line
            response.json();
          }
        )
      );
  }

  downloadClientDocuments(clientId: number, documentId: number) {
    const headers = new Headers(); // tslint:disable-line
    this.createAuthorizationHeader(headers);
    return this.http.get('https://demo.openmf.org/fineract-provider/api/v1/clients/' + clientId +
        '/documents/' + documentId + '/attachment/?tenantIdentifier=default', {
          headers: headers
        })
      .pipe(
        map(
          (response: Response) => { // tslint:disable-line
            return response.json();
          }
        )
      );
  }




}

