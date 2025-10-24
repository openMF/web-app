/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SystemService } from '../../system.service';

/**
 * Notification Configuration data resolver.
 */
@Injectable()
export class NotificationConfigurationResolver {
  private systemService = inject(SystemService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  /**
   * @param {SystemService} systemService System service.
   */
  constructor() {}

  /**
   * Returns the Notification Configuration data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.systemService.getExternalConfiguration('NOTIFICATION');
  }
}
