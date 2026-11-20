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
import { catchError, map, shareReplay, startWith } from 'rxjs/operators';

/** Custom Services */
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { SettingsService } from 'app/settings/settings.service';
import { VersionService } from 'app/system/version.service';
import { parseFineractVersion, parseWebAppVersion } from './system-info.utils';

/** Environment Configuration */
import { environment } from '../../environments/environment';

/** Version and build hash of a deployed component. */
export interface ComponentVersion {
  /** Version as reported, e.g. `1.17.0-SNAPSHOT`. */
  raw: string;
  /** Version without its pre-release marker, e.g. `1.17.0`. */
  version: string;
  /** Pre-release marker, e.g. `SNAPSHOT`; empty for a release. */
  preRelease: string;
  /** Abbreviated commit hash, e.g. `12e7559`. */
  hash: string;
  /** Full commit hash, copied from the hash chip. */
  fullHash: string;
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

  /** The actuator response does not change while a server is selected, so it is fetched once and replayed. */
  private fineractVersion$: Observable<ComponentVersion>;
  /** Server the cached version was read from; the login page can switch servers without a reload. */
  private fineractVersionServer: string;

  /**
   * Returns the backend information. `renderTime` is evaluated per subscription,
   * so each view reports the moment it was rendered. The local values are emitted straight
   * away and again once the Fineract version is known, so a slow backend does not hide them.
   */
  getSystemInformation(): Observable<SystemInformation> {
    return this.getFineractVersion().pipe(
      startWith(parseFineractVersion(null)),
      map((fineract: ComponentVersion) => {
        const credentials = this.authenticationService.getCredentials();
        return {
          webApp: parseWebAppVersion(environment.version, environment.hash, environment.fullHash),
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
    if (!this.fineractVersion$ || this.fineractVersionServer !== this.settingsService.server) {
      this.fineractVersionServer = this.settingsService.server;
      const version$: Observable<ComponentVersion> = this.versionService.getBackendInfo().pipe(
        map((data: any) => parseFineractVersion(data)),
        shareReplay({ bufferSize: 1, refCount: false }),
        catchError(() => {
          // A late failure from a previously selected server must not drop the current server's cache.
          if (this.fineractVersion$ === version$) {
            this.fineractVersion$ = null;
          }
          return of(parseFineractVersion(null));
        })
      );
      this.fineractVersion$ = version$;
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
