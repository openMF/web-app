import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrganisationService {

  constructor(private http: HttpClient) { }

  getOffices(): Observable<any> {
    return this.http.get(`/offices?orderBy=id`);
  }

  getOffice(id: Number): Observable<any> {
    return this.http.get(`/offices/${id}`);
  }

  createOffice(office: any): Observable<any> {
    return this.http.post('/offices', office);
  }

  updateOffice(office: any, officeId: Number): Observable<any> {
    return this.http.put(`/offices/${officeId}`, office);
  }
}
