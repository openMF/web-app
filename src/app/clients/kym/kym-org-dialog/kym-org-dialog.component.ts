/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, ElementRef, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { NepaliDateInputComponent } from 'app/shared/nepali-date-input/nepali-date-input.component';
import { KymService } from '../kym.service';
import { KymView, ORGANISATION_TYPES } from '../kym.models';
import { revealFirstInvalid } from '../reveal-first-invalid';

export interface KymOrgDialogData {
  clientId: number;
  kym: KymView;
}

/** yyyy-MM-dd of a local date, as the API takes it. */
function iso(d: Date | null): string | null {
  return d
    ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    : null;
}

/**
 * The organisation form's own answers (fineract-dbug #191): type, registration date and office, objective, working
 * area, branches, expected transactions, PAN or VAT, other details. Name, registration number, renewal date and type of
 * business stay on Fineract's Edit screen. Only what changed is sent, with someone authorised for it present.
 */
@Component({
  selector: 'mifosx-kym-org-dialog',
  template: `
    <h2 mat-dialog-title>{{ 'kym.org.Update the organisation' | translate }}</h2>
    <form [formGroup]="form" (ngSubmit)="save()">
      <mat-dialog-content>
        <p class="lead">{{ 'kym.org.editLead' | translate }}</p>
        <div class="row">
          <mat-form-field>
            <mat-label>{{ 'kym.org.field.orgType' | translate }}</mat-label>
            <mat-select formControlName="orgType">
              @for (t of types; track t) {
                <mat-option [value]="t">{{ 'kym.org.type.' + t | translate }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field>
            <mat-label>{{ 'kym.org.field.panVatNo' | translate }}</mat-label>
            <input matInput formControlName="panVatNo" maxlength="50" />
          </mat-form-field>
        </div>
        <div class="row">
          <mifosx-nepali-date-input
            formControlName="registrationDate"
            [label]="'kym.org.field.registrationDate' | translate"
            [maxDate]="today"
          ></mifosx-nepali-date-input>
          <mat-form-field>
            <mat-label>{{ 'kym.org.field.registrationOffice' | translate }}</mat-label>
            <input matInput formControlName="registrationOffice" maxlength="200" />
          </mat-form-field>
        </div>
        <mat-form-field class="full">
          <mat-label>{{ 'kym.org.field.mainObjective' | translate }}</mat-label>
          <textarea matInput rows="2" formControlName="mainObjective" maxlength="1000"></textarea>
        </mat-form-field>
        <mat-form-field class="full">
          <mat-label>{{ 'kym.org.field.workingArea' | translate }}</mat-label>
          <input matInput formControlName="workingArea" maxlength="500" />
        </mat-form-field>
        <div class="row">
          <mat-form-field>
            <mat-label>{{ 'kym.org.field.branchCount' | translate }}</mat-label>
            <input matInput type="number" min="0" formControlName="branchCount" />
            <mat-hint>{{ 'kym.zeroIfNone' | translate }}</mat-hint>
          </mat-form-field>
          <mat-form-field>
            <mat-label>{{ 'kym.org.field.expectedYearlyTransactions' | translate }}</mat-label>
            <input matInput type="number" min="0" formControlName="expectedYearlyTransactions" />
          </mat-form-field>
        </div>
        @if (form.value.branchCount > 0) {
          <mat-form-field class="full">
            <mat-label>{{ 'kym.org.field.branchLocations' | translate }}</mat-label>
            <textarea matInput rows="2" formControlName="branchLocations" maxlength="1000"></textarea>
          </mat-form-field>
        }
        <mat-form-field class="full">
          <mat-label>{{ 'kym.org.field.otherDetails' | translate }}</mat-label>
          <textarea matInput rows="2" formControlName="otherDetails" maxlength="2000"></textarea>
        </mat-form-field>
        <div class="confirm" [class.confirm--invalid]="form.get('inPerson').touched && form.get('inPerson').invalid">
          <mat-checkbox formControlName="inPerson">{{ 'kym.org.inPersonLabel' | translate }}</mat-checkbox>
          @if (form.get('inPerson').touched && form.get('inPerson').invalid) {
            <p class="confirm__error" role="alert">{{ 'kym.org.inPersonRequired' | translate }}</p>
          }
        </div>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-raised-button type="button" mat-dialog-close [disabled]="busy()">
          {{ 'labels.buttons.Cancel' | translate }}
        </button>
        <button mat-raised-button color="primary" type="submit" [disabled]="busy() || !(changed() | keyvalue).length">
          {{ 'kym.Save' | translate }}
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [
    `
      .lead {
        margin: 0 0 12px;
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.875rem;
      }
      .row {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px 16px;
      }
      .full {
        width: 100%;
      }
      mat-form-field {
        min-width: 0;
      }
      .confirm {
        margin-top: 8px;
        padding: 12px;
        border-radius: 6px;
        background: rgb(36 96 185 / 6%);
      }
      /* Save pressed without the box ticked: outlined and explained. */
      .confirm--invalid {
        border: 2px solid var(--dk-danger, #d32f2f);
      }
      .confirm__error {
        margin: 4px 0 0;
        color: var(--dk-danger, #d32f2f);
        font-size: 0.875rem;
      }
      @media (width <= 600px) {
        .row {
          grid-template-columns: minmax(0, 1fr);
          gap: 0;
        }
      }
    `
  ],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogModule,
    NepaliDateInputComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KymOrgDialogComponent {
  readonly data = inject<KymOrgDialogData>(MAT_DIALOG_DATA);
  private ref = inject(MatDialogRef<KymOrgDialogComponent, KymView>);
  private kymService = inject(KymService);
  private host = inject(ElementRef<HTMLElement>);

  readonly types = ORGANISATION_TYPES;
  readonly today = new Date();
  readonly busy = signal(false);
  readonly form: FormGroup;
  private readonly initial: Record<string, unknown>;

  constructor() {
    const o = this.data.kym.values.organisation ?? {};
    this.form = inject(FormBuilder).group({
      orgType: [o.orgType ?? null],
      registrationDate: [o.registrationDate ? new Date(o.registrationDate + 'T00:00:00') : null],
      registrationOffice: [
        o.registrationOffice ?? null,
        Validators.maxLength(200)
      ],
      mainObjective: [
        o.mainObjective ?? null,
        Validators.maxLength(1000)
      ],
      workingArea: [
        o.workingArea ?? null,
        Validators.maxLength(500)
      ],
      branchCount: [
        o.branchCount ?? null,
        [
          Validators.min(0),
          Validators.max(10000)
        ]
      ],
      branchLocations: [
        o.branchLocations ?? null,
        Validators.maxLength(1000)
      ],
      expectedYearlyTransactions: [
        o.expectedYearlyTransactions ?? null,
        Validators.min(0)
      ],
      panVatNo: [
        o.panVatNo ?? null,
        Validators.maxLength(50)
      ],
      otherDetails: [
        o.otherDetails ?? null,
        Validators.maxLength(2000)
      ],
      inPerson: [
        false,
        Validators.requiredTrue
      ]
    });
    this.initial = this.snapshot();
  }

  private snapshot(): Record<string, unknown> {
    const { inPerson, registrationDate, ...rest } = this.form.getRawValue();
    return { ...rest, registrationDate: iso(registrationDate) };
  }

  changed(): Record<string, unknown> {
    const now = this.snapshot();
    const out: Record<string, unknown> = {};
    for (const [
      k,
      v
    ] of Object.entries(now)) {
      const value = v === '' ? null : v;
      if (JSON.stringify(value ?? null) !== JSON.stringify(this.initial[k] ?? null)) {
        out[k] = value;
      }
    }
    return out;
  }

  /**
   * Saves what changed. Save is clickable once something has changed; if anything is still missing or invalid
   * (the "someone authorised is here" box most often), nothing is sent: every field shows its error and the first
   * one is scrolled into view and focused.
   */
  save(): void {
    const changes = this.changed();
    if (!Object.keys(changes).length) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      revealFirstInvalid(this.host.nativeElement);
      return;
    }
    this.busy.set(true);
    this.kymService.updateOrganisation(this.data.clientId, changes).subscribe({
      next: (k) => this.ref.close(k),
      error: () => this.busy.set(false)
    });
  }
}
