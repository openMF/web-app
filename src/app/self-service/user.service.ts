import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/internal/operators/map';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  getUsers(): Observable<any> {
    return this.http.get<any>(`/users?fields=id,firstname,lastname,email,officeName,staff&tenantIdentifier=default&pretty=true`)
      .pipe(
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
