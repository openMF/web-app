/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component } from '@angular/core';
import { MatTabNav, MatTabLink, MatTabNavPanel } from '@angular/material/tabs';
import { MatDivider } from '@angular/material/divider';
import { RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Checker Inbox and Tasks Component
 */
@Component({
  selector: 'mifosx-checker-inbox-and-tasks',
  templateUrl: './checker-inbox-and-tasks.component.html',
  styleUrls: ['./checker-inbox-and-tasks.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTabNav,
    MatTabLink,
    RouterLinkActive,
    MatTabNavPanel,
    RouterOutlet,
    MatDivider
  ]
})
export class CheckerInboxAndTasksComponent {
  constructor() {}
}
