import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
/* import { HttpHeaders, HttpClient } from '@angular/common/http';
 */
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ClientsService {
    constructor(private http: Http) {} // tslint:disable-line

    createAuthorizationHeader(headers: Headers) {
      const username = 'mifos';
      const password = 'password';
      headers.append('Authorization', 'Basic ' + btoa(username + ':' + password));
      headers.append('Content-Type', 'application/json');
      headers.append('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      headers.append('Access-Control-Allow-Origin', '*');
    }

   getClients() {
    const headers = new Headers();   // tslint:disable-line
    this.createAuthorizationHeader(headers);
    return this.http.get
    ('https://demo.openmf.org/fineract-provider/api/v1/clients?tenantIdentifier=default&pretty=true',
    {headers: headers})
    .pipe(
    map(
        (response: Response) => {  // tslint:disable-line
          response = response.json();
          return response['pageItems'];

        }
    )
  );
}
  getClientId(clientId: number) {
    const headers = new Headers();   // tslint:disable-line
    this.createAuthorizationHeader(headers);
    return this.http.get
    ('https://demo.openmf.org/fineract-provider/api/v1/clients/' + clientId
      + '?tenantIdentifier=default&pretty=true',
    {headers: headers})
    .pipe(
    map(
        (response: Response) => {  // tslint:disable-line
          response = response.json();
          return response;

        }
    )
  );
  }

  getClientAccounts(clientId: number) {
    const headers = new Headers();   // tslint:disable-line
    this.createAuthorizationHeader(headers);
    return this.http.get
    ('https://demo.openmf.org/fineract-provider/api/v1/clients/' + clientId
      + '/accounts' + '?tenantIdentifier=default&pretty=true',
    {headers: headers})
    .pipe(
    map(
        (response: Response) => {  // tslint:disable-line
          response = response.json();
          return response;

        }
    )
  );
  }

  getClientCharges(clientId: number) {
    const headers = new Headers();   // tslint:disable-line
    this.createAuthorizationHeader(headers);
    return this.http.get
    ('https://demo.openmf.org/fineract-provider/api/v1/clients/' + clientId
      + '/charges' + '?tenantIdentifier=default&pretty=true',
    {headers: headers})
    .pipe(
    map(
        (response: Response) => {  // tslint:disable-line
          response = response.json();
          return response;

        }
    )
  );
  }

  getClientAddress (clientId: number) {
    const headers = new Headers();   // tslint:disable-line
    this.createAuthorizationHeader(headers);
    return this.http.get
    ('https://demo.openmf.org/fineract-provider/api/v1/client/' + clientId
      + '/addresses' + '?tenantIdentifier=default&pretty=true',
    {headers: headers})
    .pipe(
    map(
        (response: Response) => {  // tslint:disable-line
          response = response.json();
          return response;

        }
    )
  );
  }
}
