/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { AccountMoneyPipe } from './account-money.pipe';
import { AccountStatusComponent } from './account-status.component';
import { NativeSnapshot } from './account-management.model';

@Component({
  selector: 'mifosx-managed-native-account',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    AccountMoneyPipe,
    AccountStatusComponent
  ],
  templateUrl: './native-account.component.html',
  styleUrls: ['./account-management.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NativeAccountComponent {
  @Input({ required: true }) account: NativeSnapshot;
}
