/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Add Event Dialog Component.
 */
@Component({
  selector: 'mifosx-add-event-dialog',
  templateUrl: './add-event-dialog.component.html',
  styleUrls: ['./add-event-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddEventDialogComponent implements OnInit {
  dialogRef = inject<MatDialogRef<AddEventDialogComponent>>(MatDialogRef);
  formBuilder = inject(UntypedFormBuilder);
  data = inject(MAT_DIALOG_DATA);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  /** Event Form. */
  eventForm: UntypedFormGroup;
  /** Entity Data. */
  entityData: Array<any> = new Array<any>();
  /** Action Data. */
  actionData: Array<any> = new Array<any>();

  /**
   * Creates add event form.
   */
  ngOnInit() {
    this.eventForm = this.formBuilder.group({
      grouping: [
        '',
        Validators.required
      ],
      entity: [
        '',
        Validators.required
      ],
      action: [
        '',
        Validators.required
      ]
    });
    this.setGroupingListener();
    this.setEntityListener();
  }

  /**
   * Subscribes to the grouping dropdown to set entity data for that row accordingly.
   */
  setGroupingListener() {
    this.eventForm
      .get('grouping')
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((changedGrouping) => {
        this.entityData = this.data.groupings.find((grouping: any) => grouping.name === changedGrouping).entities;
        this.cdr.markForCheck();
      });
  }

  /**
   * Subscribes to the entity dropdown to set entity data for that row accordingly.
   */
  setEntityListener() {
    this.eventForm
      .get('entity')
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((changedEntity) => {
        this.actionData = this.entityData.find((entity: any) => entity.name === changedEntity).actions;
        this.cdr.markForCheck();
      });
  }

  /**
   * Closes the dialog and returns value of the form.
   */
  submit() {
    this.dialogRef.close(this.eventForm.value);
  }
}
