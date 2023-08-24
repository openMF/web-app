/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

/** rxjs Imports */
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

/** EmbedDashboard SDK import */
import { embedDashboard } from '@superset-ui/embedded-sdk';

/** 
 * Superset Service
 */
@Injectable({
  providedIn: 'root'
})
export class SupersetService {
  
  /**
   * API URL of Superset to send request
   */
  private apiUrl = 'http://localhost:8088/api/v1/security';

  /**
   * @param {HttpClient} http Http Client to send requests.
   */
  constructor(private http: HttpClient) { }

  /**
   * 
   * @returns { access token }
   */
  private fetchAccessToken(): Observable<any> {
    const body = {
      "username": "admin",
      "password": "admin",
      "provider": "db",
      "refresh": true
    };

    const headers = new HttpHeaders({ "Content-Type": "application/json" });

    return this.http.post<any>(`${this.apiUrl}/login`, body, { headers });
  }

  /**
   * 
   * @returns { guest token } using @param { accessToken }
   */
  private fetchGuestToken(accessToken: any): Observable<any> {
    const body = {
      "resources": [
        {
          "type": "dashboard",
          "id": "48745183-ef00-4149-8fcf-af8f7bcc812f",
        }
      ],
      /**
       * rls: Row Level Security, this differs for client to client ,like what to show each client
       */
      "rls": [{ "clause": "stage_of_development = 'Pre-clinical'" }],
      "user": {
        "username": "guest",
        "first_name": "Guest",
        "last_name": "User",
      }
    };

    const acc = accessToken["access_token"];
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "Authorization": `Bearer ${acc}`,
    });

    return this.http.post<any>(`${this.apiUrl}/guest_token/`, body, { headers });
  }
  /**
   * 
   * @returns { guest Token }
   */
  getGuestToken(): Observable<any> {
    return this.fetchAccessToken().pipe(
      catchError((error) => {
        console.error(error);
        return throwError(error);
      }),
      switchMap((accessToken: any) => this.fetchGuestToken(accessToken))
    );
  }
  /**
   * 
   * @returns { dashboard }
   */
  embedDashboard(): Observable<void> {
    return new Observable((observer) => {
      this.getGuestToken().subscribe(
        (token) => {
          embedDashboard({
            id: '48745183-ef00-4149-8fcf-af8f7bcc812f', // Replace with your dashboard ID
            supersetDomain: 'http://localhost:8088',
            mountPoint: document.getElementById('dashboard'),
            fetchGuestToken: () => token["token"],
            dashboardUiConfig: {
              hideTitle: true,
              hideChartControls: true,
              hideTab: true,
            },
          });
          observer.next();
          observer.complete();
        },
        (error) => {
          observer.error(error);
        }
      );
    });
  }
}
