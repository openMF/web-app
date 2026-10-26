/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardTitleGroup } from '@angular/material/card';
import { MatTooltip } from '@angular/material/tooltip';
import { StatusLookupPipe } from '@pipes/status-lookup.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-account-header',
  standalone: true,
  templateUrl: './account-header.component.html',
  styleUrls: ['./account-header.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    StatusLookupPipe,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatCardTitleGroup,
    MatTooltip
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountHeaderComponent {
  @Input() statusCode = '';
  @Input() statusTooltip = '';
}
