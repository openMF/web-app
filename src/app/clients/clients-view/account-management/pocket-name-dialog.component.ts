/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { PlannedAccountsService } from './planned-accounts.service';
import { AccountManagementAccess } from './account-management-access.service';
import { Pocket } from './account-management.model';
import { errorKey, validName } from './account-management.state';

@Component({
  selector: 'mifosx-pocket-name-dialog',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogModule
  ],
  templateUrl: './pocket-name-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PocketNameDialogComponent {
  readonly pocket = inject<Pocket>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<PocketNameDialogComponent>);
  private readonly api = inject(PlannedAccountsService);
  private readonly access = inject(AccountManagementAccess);
  private readonly destroyRef = inject(DestroyRef);
  readonly busy = signal(false);
  readonly message = signal<string | null>(null);
  readonly form;
  constructor() {
    const fb = inject(FormBuilder);
    this.form = fb.nonNullable.group({ name: [
        this.pocket.name,
        [
          Validators.required,
          Validators.maxLength(100),
          (control: AbstractControl) => (validName(control.value) ? null : { name: true })
        ]
      ] });
  }
  save(): void {
    if (
      this.form.invalid ||
      this.busy() ||
      !this.access.has('MANAGE_SAVINGS_POCKET') ||
      !this.access.has('READ_SAVINGS_ACCOUNT_RELATIONSHIP')
    )
      return;
    this.busy.set(true);
    this.ref.disableClose = true;
    this.message.set(null);
    this.api
      .savePocket(this.pocket.clientId, this.pocket, this.form.controls.name.value)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.busy.set(false);
          this.ref.disableClose = false;
        })
      )
      .subscribe({ next: () => this.ref.close(true), error: (error) => this.message.set(errorKey(error)) });
  }
}
