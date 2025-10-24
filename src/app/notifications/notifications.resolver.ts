/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { NotificationsService } from './notifications.service';

/**
 * Notifications data resolver.
 */
@Injectable()
export class NotificationsResolver {
  private notificationsService = inject(NotificationsService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  /**
   * @param {NotificationsService} notificationsService Notifications service.
   */
  constructor() {}

  /**
   * Returns the Notifications data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.notificationsService.getNotifications(true, 50);
  }
}
