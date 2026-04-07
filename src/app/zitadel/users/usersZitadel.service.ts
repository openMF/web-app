/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

/** rxjs Imports */
import { from, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { environment } from '../../../environments/environment';

/**
 * UsersZitadel service.
 */
@Injectable({
  providedIn: 'root'
})
export class UsersServiceZitadel {
  private api = environment.OIDC.oidcApiUrl;

  /**
   * @param {HttpClient} http Http Client to send requests.
   */
  constructor(
    private http: HttpClient,
    private autservice: AuthService
  ) {}

  /**
   * @param {any} user User to be created.
   * @returns {Observable<any>}
   */
  createUser(user: any): Observable<any> {
    return this.http.post(this.api + 'authentication/user', user);
  }

  getExtraUserData(userId: string): Observable<any> {
    return this.http.get(`${this.api}authentication/user/db/${userId}`);
  }

  assignRolesToUser(userId: string, roleKeys: string[]): Observable<any> {
    const payload = {
      userId: userId,
      roleKeys: roleKeys.map(String)
    };
    return this.http.post(this.api + 'authentication/user/role', payload);
  }

  createUserBd(user: any): Observable<any> {
    return this.http.post(this.api + 'authentication/user/db', user);
  }

  /**
   * @returns {Observable<any>} Users template data
   */
  getUsersTemplate(): Observable<any> {
    return this.http.get('/users/template');
  }

  /**
   * @returns {Observable<any>} Users data
   */
  getUsers(): Observable<any[]> {
    const token = this.autservice.getAccessToken();
    return from(
      fetch(`${this.api}authentication/user`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })
    ).pipe(
      switchMap((res) => res.json()),
      map((response) => {
        const out: any[] = [];
        const users = response.object?.result;
        if (Array.isArray(users)) {
          users.forEach((user) => {
            if (user.human) {
              out.push({
                id: user.id,
                firstname: user.human.profile.firstName,
                lastname: user.human.profile.lastName,
                email: user.human.email.email,
                officeName: 'Head Office'
              });
            }
          });
        }
        return out;
      })
    );
  }

  /**
   * @param {string} userId user ID of user.
   * @returns {Observable<any>} User.
   */
  getUser(userId: string): Observable<any> {
    const url = `${this.api}authentication/user/${userId}`;
    return from(
      fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.autservice.getAccessToken()}`
        }
      })
    ).pipe(
      switchMap((res) => res.json()),
      map((response) => response)
    );
  }

  editUser(user: any): Observable<any> {
    return this.http.put(this.api + 'authentication/user', user);
  }

  editRoles(roles: any): Observable<any> {
    return this.http.put(this.api + 'authentication/user/role', roles);
  }

  editOffice(office: any): Observable<any> {
    return this.http.put(this.api + 'authentication/user/office', office);
  }

  getRoles() {
    return this.http.get(this.api + 'authentication/role');
  }
}
