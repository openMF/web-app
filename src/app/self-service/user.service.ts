import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/internal/operators/map';

const username = 'mifos';
const password = 'password';
const token = btoa(`${username}:${password}`);

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Basic ${token}`,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Origin': '*'
  })
};

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  getUsers(): Observable<any> {
    return this.http.get<any>(
      `https://demo.openmf.org/fineract-provider/api/v1/users?
      fields=id,firstname,lastname,email,officeName,staff&tenantIdentifier=default&pretty=true`,
    httpOptions).pipe(
      map((res) => {
        res.forEach((user: any) => {
          user.name = `${user.firstname} ${user.lastname}`;
          user.staff = user.staff ? `${user.staff.firstname} ${user.staff.lastname}` : '';
          delete user.firstname;
          delete user.lastname;
        });
        return res;
      })
    );
  }

}
