/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, OnInit, inject } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { SettingsService } from 'app/settings/settings.service';
import { VersionService } from 'app/system/version.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'mifosx-system-information',
  templateUrl: './system-information.component.html',
  styleUrls: ['./system-information.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCard
  ]
})
export class SystemInformationComponent implements OnInit {
  private settingsService = inject(SettingsService);
  private versionService = inject(VersionService);

  tenant = '';
  mifosVersion = '';
  fineractVersion = '';
  server = '';

  ngOnInit(): void {
    this.tenant = this.settingsService.tenantIdentifier || 'default';
    this.mifosVersion = environment.version;
    this.server = this.settingsService.server;

    this.versionService.getBackendInfo().subscribe((data: any) => {
      if (data.git && data.git.build && data.git.build.version) {
        this.fineractVersion = data.git.build.version;
      }
    });
  }
}
