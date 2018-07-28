import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
  })


export class GroupsService {
    constructor(private http: HttpClient) { }

    getGroups(): Observable<any> {
        return  this.http.get('/groups');
    }

}
