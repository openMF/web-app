/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { SharedModule } from 'app/shared/shared.module';
import { RateConfiguration } from './investment-product.models';
import { InvestmentMatrixViewComponent } from './investment-matrix-view.component';
import { InvestmentCodePipe } from './investment-feedback.component';
@Component({
  selector: 'mifosx-investment-publish-dialog',
  standalone: true,
  imports: [
    SharedModule,
    MatDialogModule,
    InvestmentMatrixViewComponent,
    InvestmentCodePipe
  ],
  template: `
    <h2 mat-dialog-title>{{ 'Investment.confirmPublication' | translate }}</h2>
    <mat-dialog-content>
      <p>
        {{ 'Investment.revision' | translate }}: {{ data.revision }} ·
        {{ data.configuration.effectiveValidity.mode | investmentCode }}
      </p>
      @if (data.configuration.effectiveValidity.mode === 'SCHEDULED') {
        <p>{{ data.configuration.effectiveValidity.effectiveDate }} · 00:00 · {{ data.timezone }}</p>
      } @else {
        <p>{{ 'Investment.immediateHint' | translate }}</p>
      }
      <p>{{ 'Investment.configurationOnly' | translate }}</p>
      <p>{{ 'Investment.independentReview' | translate }}</p>
      <mifosx-investment-matrix-view [matrix]="data.configuration.matrix" />
    </mat-dialog-content>
    <mat-dialog-actions align="end"
      ><button mat-button [mat-dialog-close]="false">{{ 'labels.buttons.Cancel' | translate }}</button
      ><button mat-raised-button color="primary" [mat-dialog-close]="true">
        {{ 'Investment.publish' | translate }}
      </button></mat-dialog-actions
    >
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvestmentPublishDialogComponent {
  data = inject<RateConfiguration>(MAT_DIALOG_DATA);
}
