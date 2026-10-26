/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, Input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { FxCapabilities } from './foreign-currency.models';
@Component({
  selector: 'mifosx-fx-policy',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatIcon,
    MatExpansionModule
  ],
  styleUrls: ['./foreign-currency.scss'],
  template: `<section class="fx-policy" role="status">
    <div class="fx-policy-bar">
      <mat-icon aria-hidden="true">lock_outline</mat-icon>
      <div>
        <strong>{{ (administration ? 'fx.policyPending' : 'fx.readOnly') | translate }}</strong>
        <p>{{ (administration ? 'fx.publicationUnavailable' : 'fx.executionUnavailable') | translate }}</p>
      </div>
      <button mat-stroked-button type="button" disabled>
        {{ (administration ? 'fx.publish' : 'fx.execute') | translate }}
      </button>
    </div>
    <mat-expansion-panel class="fx-policy-details"
      ><mat-expansion-panel-header
        ><mat-panel-title>{{ 'fx.policyDetails' | translate }}</mat-panel-title></mat-expansion-panel-header
      >
      <ul>
        @for (blocker of capabilities.blockers; track blocker) {
          <li>{{ 'fx.blockers.' + blocker | translate }}</li>
        }
      </ul></mat-expansion-panel
    >
  </section>`
})
export class FxPolicyComponent {
  @Input({ required: true }) capabilities!: FxCapabilities;
  @Input() administration = false;
}
