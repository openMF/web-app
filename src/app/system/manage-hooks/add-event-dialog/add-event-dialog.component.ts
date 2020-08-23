/** Angular Imports */
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

/**
 * Add Event Dialog Component.
 */
@Component({
  selector: 'mifosx-add-event-dialog',
  templateUrl: './add-event-dialog.component.html',
  styleUrls: ['./add-event-dialog.component.scss']
})
export class AddEventDialogComponent implements OnInit {

  /** Event Form. */
  eventForm: FormGroup;
  /** Entity Data. */
  entityData: Array<any> = new Array<any>();
  /** Action Data. */
  actionData: Array<any> = new Array<any>();

  /**
   * @param {MatDialogRef} dialogRef Component reference to dialog.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {any} data Provides grouping, entities and actions data to fill dropdowns.
   */
  constructor(public dialogRef: MatDialogRef<AddEventDialogComponent>,
              public formBuilder: FormBuilder,
              @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  /**
   * Creates add event form.
   */
  ngOnInit() {
    this.eventForm = this.formBuilder.group({
      'grouping': ['', Validators.required],
      'entity': ['', Validators.required],
      'action': ['', Validators.required]
    });
    this.setGroupingListener();
    this.setEntityListener();
  }

  /**
   * Subscribes to the grouping dropdown to set entity data for that row accordingly.
   */
  setGroupingListener() {
    this.eventForm.get('grouping').valueChanges
      .subscribe(changedGrouping => {
        this.entityData = this.data.groupings.find((grouping: any) => grouping.name === changedGrouping).entities;
      });
  }

  /**
   * Subscribes to the entity dropdown to set entity data for that row accordingly.
   */
  setEntityListener() {
    this.eventForm.get('entity').valueChanges
      .subscribe(changedEntity => {
        this.actionData = this.entityData[0].actions;
      });
  }

  /**
   * Closes the dialog and returns value of the form.
   */
  submit() {
    this.dialogRef.close(this.eventForm.value);
  }

}
