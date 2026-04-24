/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { NotificationService } from '@fineract/client';

/**
 * Notifications data resolver.
 */
@Injectable()
export class NotificationsResolver {
  /**
   * @param {NotificationService} notificationService Notifications service.
   */
  constructor(private notificationService: NotificationService) {}

  /**
   * Returns the Notifications data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.notificationService.getAllNotifications({
      isRead: true,
      limit: 50
    });
  }
}
