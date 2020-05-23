/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

/**
 * Users service.
 */
@Injectable({
  providedIn: 'root'
})
export class UsersService {

  /**
   * @param {HttpClient} http Http Client to send requests.
   */
  constructor(private http: HttpClient) { }

  /**
   * @returns {Observable<any>} Users data
   */
  getUsers(): Observable<any> {
    return this.http.get('/users');
  }

  /**
   * @returns {Observable<any>} Users template data
   */
  getUsersTemplate(): Observable<any> {
    return this.http.get('/users/template');
  }

  /**
   * @param {any} user User to be created.
   * @returns {Observable<any>}
   */
  createUser(user: any): Observable<any> {
    return this.http.post('/users', user);
  }

  /**
   * @param {string} userId user ID of user.
   * @param {any} user user to be updated.
   * @returns {Observable<any>} User.
   */
  editUser(userId: string, user: any): Observable<any> {
    return this.http.put(`/users/${userId}`, user);
  }

  /**
   * @param {string} userId user ID of user.
   * @returns {Observable<any>} User.
   */
  getUser(userId: string): Observable<any> {
    return this.http.get(`/users/${userId}`);
  }

  /**
   * Change User Password
   * @param userId User Id of users
   * @param password New Password of the user
   * @returns {Observable<any>}
   */
  changePassword(userId: string, passwordObj: any) {
    return this.http.put(`/users/${userId}`, passwordObj);
  }

  /**
   * @param {string} userId user ID of user.
   * @returns {Observable<any>}
   */
  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`/users/${userId}`);
  }

  /**
   * @param {any} officeId ID of office to retrieve staff from.
   * @returns {Observable<any>} Staff data.
   */
  getStaff(officeId: any): Observable<any> {
    const httpParams = new HttpParams()
      .set('officeId', officeId.toString())
      .set('status', 'all');
    return this.http.get('/staff', { params: httpParams });
  }

}
