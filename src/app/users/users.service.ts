/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable, inject } from '@angular/core';
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
  private http = inject(HttpClient);

  /**
   * @returns {Observable<any>} Users data
   */
  getUsers(): Observable<any> {
    return this.http.get(`/users`);
  }

  getSelfServiceUsers(): Observable<any> {
    return this.http.get('/selfservice/users');
  }

  activateSelfServiceUser(userId: number): Observable<any> {
    return this.http.put(`/selfservice/users/${userId}/activate`, {});
  }

  inactivateSelfServiceUser(userId: number): Observable<any> {
    return this.http.put(`/selfservice/users/${userId}/inactivate`, {});
  }

  linkSelfServiceUserClient(userId: number, clientId: number): Observable<any> {
    return this.http.put(`/selfservice/users/${userId}/clients/${clientId}`, {});
  }

  delinkSelfServiceUserClient(userId: number, clientId: number): Observable<any> {
    return this.http.delete(`/selfservice/users/${userId}/clients/${clientId}`);
  }

  deleteSelfServiceUser(userId: number): Observable<any> {
    return this.http.delete(`/selfservice/users/${userId}`);
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
    const httpParams = new HttpParams().set('officeId', officeId.toString()).set('status', 'all');
    return this.http.get('/staff', { params: httpParams });
  }
}
