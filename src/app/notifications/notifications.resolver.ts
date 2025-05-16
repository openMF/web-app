/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { NotificationsService } from './notifications.service';

/**
 * Notifications data resolver.
 */
@Injectable()
export class NotificationsResolver {
  /**
   * @param {NotificationsService} notificationsService Notifications service.
   */
  constructor(private notificationsService: NotificationsService) {}

  /**
   * Returns the Notifications data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.notificationsService.getNotifications(true, 50);
  }
}
