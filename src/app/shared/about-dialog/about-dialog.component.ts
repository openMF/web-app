/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import {
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { SettingsService } from 'app/settings/settings.service';
import { VersionService } from 'app/system/version.service';
import { environment } from '../../../environments/environment';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * About Dialog Component.
 * Displays version information accessible from the profile dropdown menu.
 */
@Component({
  selector: 'mifosx-about-dialog',
  templateUrl: './about-dialog.component.html',
  styleUrls: ['./about-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButton
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutDialogComponent implements OnInit {
  private dialogRef = inject<MatDialogRef<AboutDialogComponent>>(MatDialogRef);
  private authenticationService = inject(AuthenticationService);
  private settingsService = inject(SettingsService);
  private versionService = inject(VersionService);

  /** Mifos X version from environment */
  mifosVersion = environment.version;
  /** Mifos X hash from environment */
  mifosHash = environment.hash;
  /** Apache Fineract version */
  fineractVersion = '';
  /** Server URL */
  server = '';
  /** Tenant identifier */
  tenant = '';
  /** Username */
  username = '';
  /** Name */
  name = '';
  /** Render time */
  renderTime = new Date();

  ngOnInit(): void {
    this.server = this.settingsService.server;
    this.tenant = this.settingsService.tenantIdentifier || 'default';
    this.setUserInfo();
    this.fetchBackendInfo();
  }

  /**
   * Sets user info from authentication credentials.
   */
  private setUserInfo(): void {
    const credentials = this.authenticationService.getCredentials();
    if (credentials) {
      this.username = credentials.username || '';
      this.name = credentials.staffDisplayName || credentials.username || '';
    }
  }

  /**
   * Fetches backend version info from the server.
   */
  private fetchBackendInfo(): void {
    this.versionService.getBackendInfo().subscribe({
      next: (data: any) => {
        if (data.git && data.git.build && data.git.build.version) {
          const buildVersion: string = data.git.build.version.split('-');
          this.fineractVersion = buildVersion[0];
        }
      },
      error: () => {
        this.fineractVersion = 'N/A';
      }
    });
  }
}
