/** Angular Routes */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/** Custom Models */
import { User } from './user.model';

/**
 * Self service users service.
 *
 * TODO: Complete functionality once API is available.
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {

  /**
   * @param {HttpClient} http Http Client to send requests.
   */
  constructor(private http: HttpClient) { }

  /**
   * Gets all the self service users.
   *
   * TODO: To be replaced once API is available.
   */
  getUsers(): Observable<User[]> {
    const httpParams = new HttpParams().set('fields', 'id,firstname,lastname,email,officeName,staff');
    return this.http.get('/users', { params: httpParams })
      .pipe(
        map((users: any) => {
          users.forEach((user: any) => {
            user.name = `${user.firstname} ${user.lastname}`;
            user.staff = user.staff ? `${user.staff.firstname} ${user.staff.lastname}` : '';
            delete user.firstname;
            delete user.lastname;
          });
          return users as User[];
        })
      );
  }

  /**
   * Gets a self service user.
   *
   * TODO: Mock data to be replaced once API is available.
   */
  getUser(): Observable<any> {
    return this.http.disableApiPrefix().get('/assets/mock/user.mock.json');
  }

  /**
   * Change User Password.
   * @param userId User Id of users
   * @param password New Password of the user
   * @returns {Observable<any>}
   *
   * TODO: update endpoint once API available
   */
  changePassword(userId: string, passwordObj: any) {

    return this.http.put(`/self/user/${userId}`, passwordObj);
  }

}
