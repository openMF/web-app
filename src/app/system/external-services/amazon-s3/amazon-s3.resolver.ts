/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SystemService } from '../../system.service';

/**
 * Amazon S3 Configuration data resolver.
 */
@Injectable()
export class AmazonS3ConfigurationResolver {
  private systemService = inject(SystemService);

  /**
   * Returns the Amazon S3 Configuration data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.systemService.getExternalConfiguration('S3');
  }
}
