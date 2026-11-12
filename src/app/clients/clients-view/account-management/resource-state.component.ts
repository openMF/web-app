/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { Resource } from './account-management.state';

@Component({
  selector: 'mifosx-account-resource-state',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatProgressBarModule
  ],
  template: `
    @if (state.loading) {
      <mat-progress-bar mode="indeterminate" [attr.aria-label]="'labels.text.Loading' | translate" />
    }
    @if (state.error) {
      <p role="alert">{{ state.error | translate }}</p>
      @if (retry.observed) {
        <button mat-button type="button" (click)="retry.emit()">{{ 'AccountManagement.Reload' | translate }}</button>
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResourceStateComponent {
  @Input({ required: true }) state: Resource<unknown>;
  @Output() retry = new EventEmitter<void>();
}
