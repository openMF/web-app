/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ExternalServicesService } from '@fineract/client';

/**
 * Amazon S3 Configuration data resolver.
 */
@Injectable()
export class AmazonS3ConfigurationResolver {
  /**
   * @param {ExternalServicesService} externalServicesService External Services Service
   */
  constructor(private externalServicesService: ExternalServicesService) {}

  /**
   * Returns the Amazon S3 Configuration data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.externalServicesService.retrieveOne2({ servicename: 'S3' });
  }
}
