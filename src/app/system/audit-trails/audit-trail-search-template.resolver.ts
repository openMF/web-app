/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable, of } from 'rxjs';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { canReadAudit } from './audit-presentation';

/** Custom Services */
import { SystemService } from '../system.service';

/**
 * Audit Trail Search Template data resolver.
 */
@Injectable()
export class AuditTrailSearchTemplateResolver {
  private auth = inject(AuthenticationService);
  private systemService = inject(SystemService);

  /**
   * Returns the Audit Trail Search Template data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return canReadAudit(this.auth.getCredentials()) ? this.systemService.getAuditTrailSearchTemplate() : of({});
  }
}
