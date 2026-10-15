/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { PickupCheck } from './cash-drawer-pickup.models';

@Component({
  selector: 'mifosx-pickup-checks-dialog',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogModule
  ],
  templateUrl: './pickup-checks-dialog.component.html'
})
export class PickupChecksDialogComponent {
  readonly data = inject<{ checks: PickupCheck[]; selected: PickupCheck[]; sourceName: string }>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<PickupChecksDialogComponent>);
  readonly selections;
  constructor() {
    const fb = inject(FormBuilder);
    this.selections = fb.array(
      this.data.checks.map((check) =>
        fb.nonNullable.control(this.data.selected.some((s) => s.source === check.source && s.id === check.id))
      )
    );
  }
  accept(): void {
    this.ref.close(this.data.checks.filter((_, i) => this.selections.at(i).value));
  }
}
