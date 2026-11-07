/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, Input } from '@angular/core';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { PickupRecord } from './cash-drawer-pickup.models';

@Component({
  selector: 'mifosx-pickup-summary',
  imports: [...STANDALONE_SHARED_IMPORTS],
  templateUrl: './pickup-summary.component.html'
})
export class PickupSummaryComponent {
  @Input({ required: true }) record!: PickupRecord;
  @Input() details = false;
}
