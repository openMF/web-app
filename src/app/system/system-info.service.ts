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
import { catchError, map, shareReplay } from 'rxjs/operators';

/** Custom Services */
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { SettingsService } from 'app/settings/settings.service';
import { VersionService } from 'app/system/version.service';

/** Environment Configuration */
import { environment } from '../../environments/environment';

/** Version and build hash of a deployed component. */
export interface ComponentVersion {
  version: string;
  hash: string;
}

/** Backend and environment information useful for support and debugging. */
export interface SystemInformation {
  webApp: ComponentVersion;
  fineract: ComponentVersion;
  server: string;
  tenant: string;
  username: string;
  name: string;
  renderTime: Date;
  /** Business date, or null when the business date configuration is disabled. */
  businessDate: Date | null;
}

/**
 * Single source of truth for the backend/environment information shown in the
 * System Information view and, when enabled, in the footer.
 */
@Injectable({
  providedIn: 'root'
})
export class SystemInfoService {
  private versionService = inject(VersionService);
  private settingsService = inject(SettingsService);
  private authenticationService = inject(AuthenticationService);

  /** The actuator response does not change while the app is loaded, so it is fetched once and replayed. */
  private fineractVersion$: Observable<ComponentVersion>;

  /**
   * Returns the backend information. `renderTime` is evaluated per subscription,
   * so each view reports the moment it was rendered.
   */
  getSystemInformation(): Observable<SystemInformation> {
    return this.getFineractVersion().pipe(
      map((fineract: ComponentVersion) => {
        const credentials = this.authenticationService.getCredentials();
        return {
          webApp: { version: environment.version, hash: environment.hash },
          fineract,
          server: this.settingsService.server,
          tenant: this.tenantIdentifier(),
          username: credentials ? credentials.username : '',
          name: credentials ? credentials.staffDisplayName || credentials.username : '',
          renderTime: new Date(),
          businessDate: this.businessDate()
        };
      })
    );
  }

  /**
   * Fineract version and build hash, parsed from the actuator info endpoint.
   * Only successful responses are cached: the footer renders on the Login view,
   * so the first request can run before authentication and fail. Dropping the
   * cached observable on error lets the next view retry instead of replaying
   * empty values for the rest of the session.
   */
  getFineractVersion(): Observable<ComponentVersion> {
    if (!this.fineractVersion$) {
      this.fineractVersion$ = this.versionService.getBackendInfo().pipe(
        map((data: any) => {
          const buildVersion: string = data?.git?.build?.version;
          if (!buildVersion) {
            return { version: '', hash: '' };
          }
          const versionAndHash: string[] = buildVersion.split('-');
          return { version: versionAndHash[0], hash: versionAndHash[1] || '' };
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
        catchError(() => {
          this.fineractVersion$ = null;
          return of({ version: '', hash: '' });
        })
      );
    }
    return this.fineractVersion$;
  }

  private tenantIdentifier(): string {
    return this.settingsService.tenantIdentifier || 'default';
  }

  private businessDate(): Date | null {
    return `${this.settingsService.businessDateConfig}` === 'true' ? this.settingsService.businessDate : null;
  }
}
