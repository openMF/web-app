/** Angular Imports */
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';



@Component({
  selector: 'mifosx-edit-funds-dialog',
  templateUrl: './edit-funds-dialog.component.html',
  styleUrls: ['./edit-funds-dialog.component.scss']
})
export class EditFundsDialogComponent implements OnInit {
  editForm: FormGroup;

  constructor(public dialogRef: MatDialogRef<EditFundsDialogComponent>,
  private formBuilder: FormBuilder,
  @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
  this.createeditForm();
  }

  createeditForm() {
    this.editForm = this.formBuilder.group({
      'name': ['', Validators.required]
    });
  }
}
