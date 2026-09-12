/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'mifosx-page-loader',
  template: `
    <div class="page-loader">
      <mat-spinner diameter="64"></mat-spinner>
      <span class="page-loader-text">{{ message }}</span>
    </div>
  `,
  styleUrls: ['./page-loader.component.scss'],
  imports: [MatProgressSpinner],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageLoaderComponent {
  @Input({ required: true }) message!: string;
}
