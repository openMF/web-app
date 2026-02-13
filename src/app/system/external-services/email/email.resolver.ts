/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ExternalServicesService } from '@fineract/client';

/**
 * Email Configuration data resolver.
 */
@Injectable()
export class EmailConfigurationResolver {
  /**
   * @param {ExternalServicesService} externalServicesService External Services service.
   */
  constructor(private externalServicesService: ExternalServicesService) {}

  /**
   * Returns the Email Configuration data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.externalServicesService.retrieveOne2({ servicename: 'SMTP' });
  }
}
