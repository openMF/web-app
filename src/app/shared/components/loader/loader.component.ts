/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'mifosx-loader',
  imports: [LottieComponent],
  template: `
    <div class="mifosx-loader-container">
      <ng-lottie [options]="options" width="250px" height="250px"></ng-lottie>
    </div>
  `,
  styles: [
    `
      .mifosx-loader-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        width: 100%;
        background-color: transparent;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoaderComponent {
  options: AnimationOptions = {
    path: '/assets/loading_animation.json'
  };
}
