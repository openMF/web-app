/** Angular Imports */
import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';

/** Data Imports */
import { columnTypeData } from '../column-type-data';

/**
 * Column Dialog Component.
 */
@Component({
  selector: 'mifosx-column-dialog',
  templateUrl: './column-dialog.component.html',
  styleUrls: ['./column-dialog.component.scss']
})
export class ColumnDialogComponent implements OnInit {

  /** Column Form. */
  columnForm: UntypedFormGroup;
  /** Column Type Data */
  columnTypeData = columnTypeData;

  /**
   * @param {MatDialogRef} dialogRef Component reference to dialog.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {any} data Provides the column codes and values for the form (if available).
   */
  constructor(public dialogRef: MatDialogRef<ColumnDialogComponent>,
              public formBuilder: UntypedFormBuilder,
              @Inject(MAT_DIALOG_DATA) public data: any) { }

  /**
   * Creates the add column form.
   */
  ngOnInit() {
    this.columnForm = this.formBuilder.group({
      'name': [this.data ? this.data.columnName : '', Validators.required],
      'type': [{ value: this.data ? (this.data.columnDisplayType === '' ? '' : this.getColumnType(this.data.columnDisplayType)) : '', disabled: this.data.type === 'existing' }, Validators.required],
      'length': [{ value: this.data ? + this.data.columnLength : '', disabled: this.getColumnType(this.data.columnDisplayType) !== 'String' || this.data.type === 'existing' }, Validators.required],
      'mandatory': [{ value: this.data.isColumnNullable, disabled: this.data.type === 'existing' }],
      'unique': [{ value: this.data.isColumnUnique, disabled: this.data.isColumnNullable || this.data.type === 'existing' }],
      'indexed': [{ value: this.data.isColumnIndexed, disabled: this.data.type === 'existing' }],
      'code': [{ value: this.data ? this.data.columnCode : '', disabled: this.getColumnType(this.data.columnDisplayType) !== 'Dropdown' || this.data.type === 'existing' }, Validators.required],
    });
    this.onColumnTypeChanges();
  }

  /**
   * Returns the modified Column Type.
   * @param {string} columnDisplayType Column Display Type.
   * @returns {string} Column Type.
   */
  getColumnType(columnDisplayType: string): string {
    switch (columnDisplayType) {
      case undefined: {
        return '';
      }
      case 'INTEGER': {
        return 'Number';
      }
      case 'CODELOOKUP': {
        return 'Dropdown';
      }
      default: {
        return columnDisplayType[0] + columnDisplayType.substr(1).toLowerCase();
      }
    }
  }

  /**
   * Watches on Column Type field to enable/diable certain fields.
   */
  onColumnTypeChanges() {
    this.columnForm.get('type').valueChanges
      .subscribe(type => {
        switch (type) {
          case 'String': {
            this.columnForm.get('length').enable();
            this.columnForm.get('code').disable();
            break;
          }
          case 'Dropdown': {
            this.columnForm.get('code').enable();
            this.columnForm.get('length').disable();
            break;
          }
          default: {
            this.columnForm.get('code').disable();
            this.columnForm.get('length').disable();
          }
        }
      });
  }

  /**
   * Closes the dialog and returns value of the form.
   */
  submit() {
    this.dialogRef.close(this.columnForm.value);
  }

}
