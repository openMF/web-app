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

  /**
   * Returns the Notification Configuration data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.systemService.getExternalConfiguration('NOTIFICATION');
  }
}
