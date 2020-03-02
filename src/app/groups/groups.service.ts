/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

/**
 * Groups service.
 */
@Injectable({
    providedIn: 'root'
  })


export class GroupsService {

  /**
   * @param {HttpClient} http Http Client to send requests.
   */
  constructor(private http: HttpClient) { }

  getGroups(): Observable<any> {
    return  this.http.get('/groups');
  }

}
