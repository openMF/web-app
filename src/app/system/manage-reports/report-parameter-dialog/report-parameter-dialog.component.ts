/** Angular Imports */
import { Component, OnInit, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Report Parameter Dialog Component.
 */
@Component({
  selector: 'mifosx-add-report-parameter-dialog',
  templateUrl: './report-parameter-dialog.component.html',
  styleUrls: ['./report-parameter-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose
  ]
})
export class ReportParameterDialogComponent implements OnInit {
  dialogRef = inject<MatDialogRef<ReportParameterDialogComponent>>(MatDialogRef);
  formBuilder = inject(UntypedFormBuilder);
  data = inject(MAT_DIALOG_DATA);

  /** Report Parameter Form. */
  reportParameterForm: UntypedFormGroup;

  /**
   * Creates the add report parameter form.
   */
  ngOnInit() {
    this.reportParameterForm = this.formBuilder.group({
      parameterName: [
        this.data.parameterName,
        Validators.required
      ],
      reportParameterName: [this.data.reportParameterName]
    });
  }

  /**
   * Closes the dialog and returns value of the form.
   */
  submit() {
    this.dialogRef.close(this.reportParameterForm.value);
  }
}
