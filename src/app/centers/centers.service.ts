import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
  })


export class CentersService {
    constructor(private http: HttpClient) { }

    getCenters(): Observable<any> {
        return  this.http.get('/centers');
    }

    getStaff(id: number) {
        return this.http.get('/centers/template?officeId=' + id + '&staffInSelectedOfficeOnly=true');
    }

    createCenters(centers: any): Observable<any> {
        return this.http.post('/centers', centers);
    }
}
