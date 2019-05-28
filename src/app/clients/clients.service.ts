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
}
