/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

/**
 * Viewport position and size of the spotlight cut-out, in pixels.
 */
export interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Internal component that dims the page around the element a popover points at.
 */
@Component({
  selector: 'mifosx-popover-spotlight',
  templateUrl: './popover-spotlight.component.html',
  styleUrls: ['./popover-spotlight.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopoverSpotlightComponent {
  /** Area of the page left undimmed. */
  readonly rect = signal<SpotlightRect>({ top: 0, left: 0, width: 0, height: 0 });
  /** Whether the spotlight is fading out. */
  readonly leaving = signal(false);
}
