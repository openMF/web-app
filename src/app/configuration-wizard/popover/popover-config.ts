/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Configuration for opening a popover with the Popover service.
 */
export interface PopoverConfig<T = any> {
  backdropClass: string;
  data?: T;
  disableClose: boolean;
  panelClass: string | string[];
  arrowOffset?: number;
  arrowSize?: number;
}
