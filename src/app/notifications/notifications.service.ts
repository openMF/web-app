/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

/**
 * Notification service.
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  /**
   * @param {HttpClient} http Http Client to send requests.
   */
  constructor(private http: HttpClient) { }

  /**
   * @returns {Observable<any>} Notifications.
   */
  getNotifications(isRead: boolean): Observable<any> {
    const httpParams = new HttpParams().set('isRead', isRead.toString());
    return this.http.get('/notifications', { params: httpParams });
  }

}
