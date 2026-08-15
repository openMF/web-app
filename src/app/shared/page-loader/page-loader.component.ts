/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'mifosx-page-loader',
  template: `
    <div class="page-loader">
      <ng-lottie [options]="options" width="150px" height="150px"></ng-lottie>
      <span class="page-loader-text">{{ message }}</span>
    </div>
  `,
  styleUrls: ['./page-loader.component.scss'],
  imports: [LottieComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageLoaderComponent {
  @Input({ required: true }) message!: string;

  options: AnimationOptions = {
    path: '/assets/loading_animation.json'
  };
}
