import { Component, OnInit, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import { UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';

import { FormfieldBase } from './formfield/model/formfield-base';

import { FormGroupService } from './form-group.service';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { NgClass, NgFor } from '@angular/common';
import { FormfieldComponent } from './formfield/formfield.component';
import { MatButton } from '@angular/material/button';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

const layoutGap = 2;

@Component({
  selector: 'mifosx-form-dialog',
  templateUrl: './form-dialog.component.html',
  styleUrls: ['./form-dialog.component.scss'],
  imports: [
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    ReactiveFormsModule,
    NgClass,
    NgFor,
    FormfieldComponent,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class FormDialogComponent implements OnInit {
  layout: {
    columns: number;
    columnWidth?: number;
    flex?: number;
    gap?: number;
    cancelButtonText?: string;
    addButtonText?: string;
  } = {
    columns: 1,
    columnWidth: 400,
    flex: 100,
    cancelButtonText: 'Cancel',
    addButtonText: 'Add'
  };

  form: UntypedFormGroup;
  formfields: FormfieldBase[];
  pristine: boolean;

  constructor(
    public dialogRef: MatDialogRef<FormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formGroupService: FormGroupService
  ) {
    this.dialogRef.disableClose = data.disableClose !== undefined ? data.disableClose : true;
    this.formfields = data.formfields.sort(
      (formfieldA: FormfieldBase, formfieldB: FormfieldBase) => formfieldA.order - formfieldB.order
    );
    this.pristine = data.pristine !== undefined ? data.pristine : true;
    this.layout = { ...this.layout, ...data.layout };
    this.layout.gap = this.layout.columns > 1 ? layoutGap : 0;
    this.layout.flex = this.layout.flex / this.layout.columns - this.layout.gap;
  }

  ngOnInit() {
    this.dialogRef.updateSize(`${this.layout.columnWidth * this.layout.columns}px`);
    this.form = this.formGroupService.createFormGroup(this.formfields);
    if (!this.pristine) {
      this.form.markAsDirty();
    }
  }
}
