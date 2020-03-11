/** Angular Imports */
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import {FormBuilder, Validators, FormGroup} from '@angular/forms';

/** Custom Services */
import { OrganizationService } from '../organization.service';
/**
 * Create Entity Data Table Check component.
 */

@Component({
  selector: 'mifosx-create-entity-data-table-check',
  templateUrl: './create-entity-data-table-check.component.html',
  styleUrls: ['./create-entity-data-table-check.component.scss']
})
export class CreateEntityDataTableCheckComponent implements OnInit {

  /** Create entity data table form. */
  form: FormGroup;
   /** Create entity data table form field: entity */
  entity: string;
   /** Create entity data table form field: status */
  status: string;
   /** Create entity data table form field: dataTable */
  dataTable: string;
   /** Create entity data table form field: product */
  product: string;

 /**
  * @param {MatDialogRef} dialogRef Component reference to dialog.
  * @param {any} data Provides a Create Entity Data Table Check Context.
  */
  constructor(public dialogRef: MatDialogRef<CreateEntityDataTableCheckComponent>,
              @Inject(MAT_DIALOG_DATA)
              private data: any,
              private organizationService: OrganizationService,
              private fb: FormBuilder) {
     }

  cancel() {
  this.dialogRef.close();
  }

  createEntityDatatableChecksForm() {
    this.form = this.fb.group({
      entity: [this.entity, Validators.required],
      status: [this.status, Validators.required],
      dataTable: [this.dataTable, Validators.required],
      product: [this.product ] });
  }


  ngOnInit() {
    this.createEntityDatatableChecksForm();
   }

   /**
    * Submits the create entity table data form,
    * and closes the dialog.
    */
  submit() {
    const entityDatatableCheck = this.form.value;
    this.organizationService.createEntityDataTableChecks(entityDatatableCheck).subscribe((response: any) => {
    this.dialogRef.close();
    });
  }

}
