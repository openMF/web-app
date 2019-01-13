import { Injectable } from "@angular/core"; // tslint:disable-line
import { Http, Headers, Response, RequestOptions, URLSearchParams } from "@angular/http"; // tslint:disable-line
/* import { HttpHeaders, HttpClient } from '@angular/common/http';
 */
import { Observable } from "rxjs"; // tslint:disable-line
import { of } from "rxjs"; // tslint:disable-line
import { map } from "rxjs/operators"; // tslint:disable-line

@Injectable()
export class ClientsService {
  constructor(private http: Http) {} // tslint:disable-line

  createAuthorizationHeader(headers: Headers) {
    // tslint:disable-line
    const username = "mifos"; // tslint:disable-line
    const password = "password"; // tslint:disable-line
    headers.append("Authorization", "Basic " + btoa(username + ":" + password)); // tslint:disable-line
    headers.append("Content-Type", "application/json"); // tslint:disable-line
    headers.append("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"); // tslint:disable-line
    headers.append("Access-Control-Allow-Origin", "*"); // tslint:disable-line
  }

  getClients() {
    const headers = new Headers(); // tslint:disable-line
    this.createAuthorizationHeader(headers);
    return this.http
      .get("https://demo.openmf.org/fineract-provider/api/v1/clients?tenantIdentifier=default&pretty=true", {  // tslint:disable-line
        headers: headers
      })
      .pipe(
        map((response: Response) => {
          // tslint:disable-line
          response = response.json();
          return response["pageItems"]; // tslint:disable-line
        })
      );
  }
  getClientId(clientId: number) {
    const headers = new Headers(); // tslint:disable-line
    this.createAuthorizationHeader(headers);
    return this.http
      .get(
        "https://demo.openmf.org/fineract-provider/api/v1/clients/" +  // tslint:disable-line
          clientId +
          "?tenantIdentifier=default&pretty=true",  // tslint:disable-line
        {
          headers: headers
        }
      )
      .pipe(
        map((response: Response) => {
          // tslint:disable-line
          response = response.json();
          return response;
        })
      );
  }

  getClientAccounts(clientId: number) {
    const headers = new Headers(); // tslint:disable-line
    this.createAuthorizationHeader(headers);
    return this.http
      .get(
        "https://demo.openmf.org/fineract-provider/api/v1/clients/" +  // tslint:disable-line
          clientId +
          "/accounts" +  // tslint:disable-line
          "?tenantIdentifier=default&pretty=true", // tslint:disable-line
        {
          headers: headers
        }
      )
      .pipe(
        map((response: Response) => {
          // tslint:disable-line
          response = response.json();
          return response;
        })
      );
  }

  getClientCharges(clientId: number) {
    const headers = new Headers(); // tslint:disable-line
    this.createAuthorizationHeader(headers);
    return this.http
      .get(
        "https://demo.openmf.org/fineract-provider/api/v1/clients/" +  // tslint:disable-line
          clientId +
          "/charges" +  // tslint:disable-line
          "?tenantIdentifier=default&pretty=true", // tslint:disable-line
        {
          headers: headers
        }
      )
      .pipe(
        map((response: Response) => {
          // tslint:disable-line
          response = response.json();
          return response;
        })
      );
  }

  getClientAddress(clientId: number) {
    const headers = new Headers(); // tslint:disable-line
    this.createAuthorizationHeader(headers);
    return this.http
      .get(
        "https://demo.openmf.org/fineract-provider/api/v1/client/" +  // tslint:disable-line
          clientId +
          "/addresses" +  // tslint:disable-line
          "?tenantIdentifier=default&pretty=true", // tslint:disable-line
        {
          headers: headers
        }
      )
      .pipe(
        map((response: Response) => {
          // tslint:disable-line
          response = response.json();
          return response;
        })
      );
  }

  getClientNote(clientId: number) {
    const headers = new Headers(); // tslint:disable-line
    this.createAuthorizationHeader(headers);
    return this.http
      .get(
        "https://demo.openmf.org/fineract-provider/api/v1/clients/" + // tslint:disable-line
          clientId +
          "/notes" + // tslint:disable-line
          "?tenantIdentifier=default&pretty=true", // tslint:disable-line
        {
          headers: headers
        }
      )
      .pipe(
        map((response: Response) => {
          // tslint:disable-line
          response = response.json();
          return response;
        })
      );
  }

  postClientNote(clientId: number, notes: any) {
    const headers = new Headers(); // tslint:disable-line
    this.createAuthorizationHeader(headers);
    const body = JSON.stringify(notes);
    return this.http
      .post(
        "https://demo.openmf.org/fineract-provider/api/v1/clients/" + // tslint:disable-line
          clientId +
          "/notes" + // tslint:disable-line
          "?tenantIdentifier=default&pretty=true", // tslint:disable-line
        notes,
        {
          headers: headers
        }
      )
      .pipe(
        map((response: Response) => {
          // tslint:disable-line
          response.json();
        })
      );
  }

  getClientAddressTemplate() {
    const headers = new Headers(); // tslint:disable-line
    this.createAuthorizationHeader(headers);
    return this.http
      .get("https://demo.openmf.org/fineract-provider/api/v1/client/" + "addresses/template?tenantIdentifier=default", { // tslint:disable-line
        headers: headers
      })
      .pipe(
        map((response: Response) => {
          // tslint:disable-line
          response = response.json();
          return response;
        })
      );
  }

  postClientAddress(clientId: number, body: any, type: any) {
    const headers = new Headers(); // tslint:disable-line
    const params = new URLSearchParams(); // tslint:disable-line
    params.set("type", type);  // tslint:disable-line
    this.createAuthorizationHeader(headers);
    body = JSON.stringify(body);
    const options = new RequestOptions({
      // tslint:disable-line
      headers: headers,
      params: params
    });
    return this.http
      .post(
        "https://demo.openmf.org/fineract-provider/api/v1/client/" + // tslint:disable-line
          clientId +
          "/addresses?" + // tslint:disable-line
          "&tenantIdentifier=default&pretty=true", // tslint:disable-line
        body,
        options
      )
      .pipe(
        map((response: Response) => {
          // tslint:disable-line
          response.json();
        })
      );
  }

  putClientAddress(clientId: number, body: any, type: any) {
    const headers = new Headers(); // tslint:disable-line
    const params = new URLSearchParams(); // tslint:disable-line
    params.set("type", type); // tslint:disable-line
    this.createAuthorizationHeader(headers);
    // body = JSON.stringify(body);
    const options = new RequestOptions({
      // tslint:disable-line
      headers: headers,
      params: params
    });
    return this.http
      .put(
        "https://demo.openmf.org/fineract-provider/api/v1/client/" + // tslint:disable-line
          clientId +
          "/addresses?" + // tslint:disable-line
          "tenantIdentifier=default", // tslint:disable-line
        body,
        options
      )
      .pipe(
        map((response: Response) => {
          // tslint:disable-line
          response.json();
        })
      );
  }

  getClientIdentifierTemplate(clientId: number) {
    const headers = new Headers(); // tslint:disable-line
    this.createAuthorizationHeader(headers);
    return this.http
      .get(
        "https://demo.openmf.org/fineract-provider/api/v1/clients/" + // tslint:disable-line
          clientId +
          "/identifiers/template?tenantIdentifier=default", // tslint:disable-line
        {
          headers: headers
        }
      )
      .pipe(
        map((response: Response) => {
          // tslint:disable-line
          response = response.json();
          return response["allowedDocumentTypes"]; // tslint:disable-line
        })
      );
  }

  getClientIdentifiers(clientId: number) {
    const headers = new Headers(); // tslint:disable-line
    this.createAuthorizationHeader(headers);
    return this.http
      .get(
        "https://demo.openmf.org/fineract-provider/api/v1/clients/" + // tslint:disable-line
          clientId +
          "/identifiers/?tenantIdentifier=default", // tslint:disable-line
        {
          headers: headers
        }
      )
      .pipe(
        map((response: Response) => {
          // tslint:disable-line
          response = response.json();
          return response;
        })
      );
  }

  postClientIdentifier(clientId: number, body: any) {
    const headers = new Headers(); // tslint:disable-line
    this.createAuthorizationHeader(headers);
    return this.http
      .post(
        "https://demo.openmf.org/fineract-provider/api/v1/clients/" + // tslint:disable-line
          clientId +
          "/identifiers/?tenantIdentifier=default", // tslint:disable-line
        body,
        {
          headers: headers
        }
      )
      .pipe(
        map((response: Response) => {
          // tslint:disable-line
          response.json();
        })
      );
  }

  deleteClientIdentifier(clientId: number, identifierId: number) {
    const headers = new Headers(); // tslint:disable-line
    this.createAuthorizationHeader(headers);
    return this.http
      .delete(
        "https://demo.openmf.org/fineract-provider/api/v1/clients/" + // tslint:disable-line
          clientId +
          "/identifiers/" + // tslint:disable-line
          identifierId +
          "/?tenantIdentifier=default", // tslint:disable-line
        {
          headers: headers
        }
      )
      .pipe(
        map((response: Response) => {
          // tslint:disable-line
          response.json();
        })
      );
  }
  postClientDocument(clientId: number, body: any) {
    const headers = new Headers(); // tslint:disable-line
    this.createAuthorizationHeader(headers);
    headers.append("Content-Type", null); // tslint:disable-line
    headers.append("Accept", "multipart/form-data"); // tslint:disable-line
    body = JSON.stringify(body);

    return this.http
      .post(
        "https://demo.openmf.org/fineract-provider/api/v1/clients/" + clientId + "/documents/?tenantIdentifier=default", // tslint:disable-line
        body,
        {
          headers: headers
        }
      )
      .pipe(
        map((response: Response) => {
          // tslint:disable-line
          response.json();
        })
      );
  }

  getClientDocuments(clientId: number) {
    const headers = new Headers(); // tslint:disable-line
    this.createAuthorizationHeader(headers);
    return this.http
      .get(
        "https://demo.openmf.org/fineract-provider/api/v1/clients/" + clientId + "/documents/?tenantIdentifier=default", // tslint:disable-line
        {
          headers: headers
        }
      )
      .pipe(
        map((response: Response) => {
          // tslint:disable-line
          return response.json();
        })
      );
  }

  deleteClientDocuments(clientId: number, documentId: number) {
    const headers = new Headers(); // tslint:disable-line
    this.createAuthorizationHeader(headers);
    return this.http
      .delete(
        "https://demo.openmf.org/fineract-provider/api/v1/clients/" + // tslint:disable-line
          clientId +
          "/documents/" + // tslint:disable-line
          documentId +
          "/?tenantIdentifier=default", // tslint:disable-line
        {
          headers: headers
        }
      )
      .pipe(
        map((response: Response) => {
          // tslint:disable-line
          response.json();
        })
      );
  }

  downloadClientDocuments(clientId: number, documentId: number) {
    const headers = new Headers(); // tslint:disable-line
    this.createAuthorizationHeader(headers);
    return this.http
      .get(
        "https://demo.openmf.org/fineract-provider/api/v1/clients/" + // tslint:disable-line
          clientId +
          "/documents/" + // tslint:disable-line
          documentId +
          "/attachment/?tenantIdentifier=default", // tslint:disable-line
        {
          headers: headers
        }
      )
      .pipe(
        map((response: Response) => {
          // tslint:disable-line
          return response.json();
        })
      );
  }

  getClientFamily(clientId: number) {
    const headers = new Headers(); // tslint:disable-line
    this.createAuthorizationHeader(headers);
    console.log(headers);
    return this.http
    .get(
      "https://demo.openmf.org/fineract-provider/api/v1/clients/" + // tslint:disable-line
        clientId +
        "/familymembers/?tenantIdentifier=default", // tslint:disable-line
      {
        headers: headers
      }
    )
      .pipe(
        map((response: Response) => {
          // tslint:disable-line
          return response.json();
        })
      );
  }

  deleteClientFamilyMember(clientId: number, familyId: number) {
  const headers = new Headers(); // tslint:disable-line
  this.createAuthorizationHeader(headers);
  return this.http
    .delete(
        "https://demo.openmf.org/fineract-provider/api/v1/clients/" + // tslint:disable-line
        clientId +
        "/familymembers/" + // tslint:disable-line
        familyId +
        "/?tenantIdentifier=default", // tslint:disable-line
      {
        headers: headers
      }
    )
    .pipe(
      map((response: Response) => {
        // tslint:disable-line
        response.json();
      })
    );
}
}
