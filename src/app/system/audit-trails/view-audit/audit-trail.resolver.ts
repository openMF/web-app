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
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable, catchError, filter, interval, map, merge, of, race, take } from 'rxjs';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { SettingsService } from 'app/settings/settings.service';
import { SystemService } from '../../system.service';
import { auditId, canReadAudit } from '../audit-presentation';
import { AuditDetail, auditDetail } from './audit-detail';

export function auditScope(auth: AuthenticationService, settings: SettingsService): string {
  const credentials = auth.getCredentials();
  return JSON.stringify([
    settings.serverUrl,
    settings.tenantIdentifier,
    credentials?.userId,
    credentials?.username,
    credentials?.authenticated,
    credentials?.permissions
  ]);
}
export interface ResolvedAudit {
  state: 'ready' | 'invalid' | 'error' | 'forbidden';
  scope: string;
  detail?: AuditDetail;
}
@Injectable()
export class AuditTrailResolver {
  private system = inject(SystemService);
  private auth = inject(AuthenticationService);
  private settings = inject(SettingsService);

  resolve(route: ActivatedRouteSnapshot): Observable<ResolvedAudit> {
    const scope = auditScope(this.auth, this.settings);
    if (!canReadAudit(this.auth.getCredentials())) return of({ state: 'forbidden', scope });
    const id = auditId(route.paramMap.get('id'));
    if (!id) return of({ state: 'invalid', scope });
    const request = this.system.getAuditTrail(id).pipe(
      map((response: unknown): ResolvedAudit => {
        if (scope !== auditScope(this.auth, this.settings) || !canReadAudit(this.auth.getCredentials()))
          return { state: 'forbidden', scope };
        return { state: 'ready', scope, detail: auditDetail(response, id) };
      }),
      catchError((error: { status?: number }) =>
        of<ResolvedAudit>({
          state: error.status === 401 || error.status === 403 ? 'forbidden' : 'error',
          scope
        })
      )
    );
    // A scope change wins the race and unsubscribes the obsolete HTTP request.
    return race(
      request,
      merge(this.auth.isAuthenticated$, interval(500)).pipe(
        filter(() => scope !== auditScope(this.auth, this.settings) || !canReadAudit(this.auth.getCredentials())),
        take(1),
        map((): ResolvedAudit => ({ state: 'forbidden', scope }))
      )
    );
  }
}
