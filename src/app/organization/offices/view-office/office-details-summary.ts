/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, signal } from '@angular/core';

/** Display data shared by the existing tabs without additional API requests. */
@Injectable()
export class OfficeDetailsSummary {
  readonly addressCount = signal<number | null>(null);
  readonly serviceCount = signal<number | null>(null);
  readonly location = signal('');

  reset() {
    this.addressCount.set(null);
    this.serviceCount.set(null);
    this.location.set('');
  }
}
