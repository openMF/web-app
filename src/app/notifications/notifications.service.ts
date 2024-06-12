/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

/** rxjs Imports */
import { Observable, of } from 'rxjs';
import { AuthenticationService } from 'app/core/authentication/authentication.service';

/**
 * Notification service.
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  /**
   * @param {HttpClient} http Http Client to send requests.
   */
  constructor(private http: HttpClient, private authenticationService: AuthenticationService) {}

  /**
   * @returns {Observable<any>} Notifications.
   */
  getNotifications(isRead: boolean): Observable<any> {
    if (this.authenticationService.isAuthenticated()) {
      const httpParams = new HttpParams().set('isRead', isRead.toString()).set('limit', 15).set('offset', 0);
      return this.http.get('/notifications', { params: httpParams });
    } else {
      return new Observable();
    }
  }

  /**
   * @returns {Observable<any>} Notifications.
   */
  updateNotifications(): Observable<any> {
    return this.http.put('/notifications', {});
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
          createdAt: `${date.toLocaleDateString()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
        },
      ],
    });
  }
}
