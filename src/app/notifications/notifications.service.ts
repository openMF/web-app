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
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

/**
 * Notification service.
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private http = inject(HttpClient);

  /**
   * @returns {Observable<any>} Notifications.
   */
  getNotifications(isRead: boolean, limit: number): Observable<any> {
    const httpParams = new HttpParams().set('isRead', isRead.toString()).set('limit', limit);
    return this.http.get('/notifications', { params: httpParams });
  }

  /**
   * @returns {Observable<any>} Notifications.
   */
  updateNotifications(): Observable<any> {
    return this.http.put('/notifications', {});
  }

  /**
   * Get loan account details to retrieve client/group ID
   * @param {string} loanId Loan Account ID
   * @returns {Observable<any>} Loan account with clientId or groupId
   */
  getLoanAccount(loanId: string): Observable<any> {
    return this.http.get(`/loans/${loanId}`).pipe(
      map((response: any) => ({
        clientId: response.clientId,
        groupId: response.groupId,
        accountId: loanId
      })),
      catchError(() => of(null))
    );
  }

  /**
   * Get savings account details to retrieve client/group ID
   * @param {string} savingsId Savings Account ID
   * @returns {Observable<any>} Savings account with clientId or groupId
   */
  getSavingsAccount(savingsId: string): Observable<any> {
    return this.http.get(`/savingsaccounts/${savingsId}`).pipe(
      map((response: any) => ({
        clientId: response.clientId,
        groupId: response.groupId,
        accountId: savingsId
      })),
      catchError(() => of(null))
    );
  }

  /**
   * Get fixed deposit account details to retrieve client/group ID
   * @param {string} accountId Fixed Deposit Account ID
   * @returns {Observable<any>} Fixed deposit account with clientId or groupId
   */
  getFixedDepositAccount(accountId: string): Observable<any> {
    return this.http.get(`/fixeddepositaccounts/${accountId}`).pipe(
      map((response: any) => ({
        clientId: response.clientId,
        groupId: response.groupId,
        accountId: accountId
      })),
      catchError(() => of(null))
    );
  }

  /**
   * Get recurring deposit account details to retrieve client/group ID
   * @param {string} accountId Recurring Deposit Account ID
   * @returns {Observable<any>} Recurring deposit account with clientId or groupId
   */
  getRecurringDepositAccount(accountId: string): Observable<any> {
    return this.http.get(`/recurringdepositaccounts/${accountId}`).pipe(
      map((response: any) => ({
        clientId: response.clientId,
        groupId: response.groupId,
        accountId: accountId
      })),
      catchError(() => of(null))
    );
  }

  /**
   * Get share account details to retrieve client/group ID
   * @param {string} accountId Share Account ID
   * @returns {Observable<any>} Share account with clientId or groupId
   */
  getShareAccount(accountId: string): Observable<any> {
    return this.http.get(`/accounts/share/${accountId}`).pipe(
      map((response: any) => ({
        clientId: response.clientId,
        groupId: response.groupId,
        accountId: accountId
      })),
      catchError(() => of(null))
    );
  }

  /**
   * @returns {Observable<any>} Mock Unread Notifications for Testing.
   */
  getMockUnreadNotification(): Observable<any> {
    const date = new Date();
    return of({
      totalFilteredRecords: 1,
      pageItems: [
        {
          id: Math.floor(Math.random() * 100),
          objectType: 'client',
          objectId: Math.floor(Math.random() * 10),
          action: 'clientCreated',
          actorId: 2,
          content: 'Client Created',
          isRead: false,
          isSystemGenerated: false,
          createdAt: `${date.toLocaleDateString()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
        }
      ]
    });
  }
}
