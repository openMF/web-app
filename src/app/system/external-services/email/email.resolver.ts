/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SystemService } from '../../system.service';

/**
 * Email Configuration data resolver.
 */
@Injectable()
export class EmailConfigurationResolver {
  private systemService = inject(SystemService);

  /**
   * Returns the Email Configuration data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.systemService.getExternalConfiguration('SMTP');
  }
}
