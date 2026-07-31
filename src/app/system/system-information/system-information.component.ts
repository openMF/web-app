/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { SystemInfoService, SystemInformation } from 'app/system/system-info.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'mifosx-system-information',
  templateUrl: './system-information.component.html',
  styleUrls: ['./system-information.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCard
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SystemInformationComponent implements OnInit {
  private systemInfoService = inject(SystemInfoService);

  /** Backend and environment information. */
  systemInformation$: Observable<SystemInformation>;

  ngOnInit(): void {
    this.systemInformation$ = this.systemInfoService.getSystemInformation();
  }
}
