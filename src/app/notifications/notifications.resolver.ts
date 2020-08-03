/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { NotificationsService } from './notifications.service';

/**
 * Notifications data resolver.
 */
@Injectable()
export class NotificationsResolver implements Resolve<Object> {

  /**
   * @param {NotificationsService} notificationsService Notifications service.
   */
  constructor(private notificationsService: NotificationsService) {}

  /**
   * Returns the Notifications data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.notificationsService.getNotifications(true);
  }

}
