/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

/** Custom Services */
import { SystemService } from 'app/system/system.service';

/** Custom Components */
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';

/**
 * View Code Component.
 */
@Component({
  selector: 'mifosx-view-code',
  templateUrl: './view-code.component.html',
  styleUrls: ['./view-code.component.scss']
})
export class ViewCodeComponent implements OnInit {

  /** Code Data */
  codeData: any;
  /** Code Values Data */
  codeValuesData: any[];
  /** Code Values Form */
  codeValuesForm: FormGroup;
  /** Code Value Row Status */
  codeValueRowStatus: string[] = [];

  /**
   * Retrieves the codes and code values data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {SystemService} systemService System Service.
   * @param {Router} router Router for navigation.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {MatDialog} dialog Dialog reference.
   */
  constructor(private route: ActivatedRoute,
              private systemService: SystemService,
              private router: Router,
              private formBuilder: FormBuilder,
              private dialog: MatDialog) {
    this.route.data.subscribe((data: { code: any, codeValues: any }) => {
      this.codeData = data.code;
      this.codeValuesData = data.codeValues;
    });
  }

  /**
   * Creates and initializes the code values form.
   */
  ngOnInit() {
    this.createCodeValuesForm();
    this.initCodeValuesForm();
  }

  /**
   * Initializes the code values form.
   */
  initCodeValuesForm() {
    this.codeValuesData.forEach((codeValue: any) => {
      this.codeValues.push(this.createCodeValuesRow(codeValue));
      this.codeValueRowStatus.push('disabled');
    });
  }

  /**
   * Gets the code values form array.
   * @returns {FormArray} Code values form array.
   */
  get codeValues(): FormArray {
    return this.codeValuesForm.get('codeValues') as FormArray;
  }

  /**
   * Creates the code values form.
   */
  createCodeValuesForm() {
    this.codeValuesForm = this.formBuilder.group({
      'codeValues': this.formBuilder.array([])
    });
  }

  /**
   * Adds a row to the code values form.
   */
  addCodeValueRow() {
    this.codeValues.push(this.createCodeValuesRow());
    this.codeValues.at(this.codeValues.length - 1).enable();
    this.codeValueRowStatus.push('new');
  }

  /**
   * Creates a code value row in code values form.
   * @param {any} codeValue Code value.
   */
  createCodeValuesRow(codeValue?: any): FormGroup {
    return this.formBuilder.group({
      'name': [{ value: codeValue ? codeValue.name : '', disabled: true }, Validators.required],
      'description': [{ value: codeValue ? codeValue.description : '', disabled: true }],
      'position': [{ value: codeValue ? codeValue.position : 0, disabled: true }, Validators.required],
      'isActive': [{ value: codeValue ? codeValue.active : false, disabled: true }]
    });
  }

  /**
   * Deletes the particular code value.
   * @param {number} index Index of the row.
   */
  deleteCodeValue(index: number) {
    const codeValueId = this.codeValuesData[index].id;
    this.systemService.deleteCodeValue(this.codeData.id, codeValueId)
      .subscribe((response: any) => {
        this.codeValuesData.splice(index, 1);
        this.codeValues.removeAt(index);
        this.codeValueRowStatus.splice(index, 1);
      });
  }

  /**
   * Removes/Deletes the particular code value which has not been intialised.
   * @param {number} index Index of the row.
   */
  removeNewCodeValue(index: number) {
    this.codeValues.removeAt(index);
    this.codeValueRowStatus.splice(index, 1);
  }

  /**
   * Updates the particular code value.
   * @param {number} index Index of the row.
   */
  updateCodeValue(index: number) {
    const updatedCodeValue: { name: string, description: string, position: number, isActive: boolean } = this.codeValues.at(index).value;
    this.systemService.updateCodeValue(this.codeData.id, this.codeValuesData[index].id, updatedCodeValue)
      .subscribe((response: any) => {
        this.codeValues.at(index).disable();
        this.codeValueRowStatus[index] = 'disabled';
        this.codeValues.at(index).markAsPristine();
      });
  }

  /**
   * Deletes the code.
   */
  delete() {
    const deleteCodeDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `code ${this.codeData.name}` }
    });
    deleteCodeDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.systemService.deleteCode(this.codeData.id)
          .subscribe(() => {
            this.router.navigate(['/system/codes']);
          });
      }
    });
  }

  /**
   * Disables the particular row.
   * @param {number} index Index of the row.
   */
  disableRow(index: number) {
    this.codeValues.at(index).get('name').setValue(this.codeValuesData[index].name);
    this.codeValues.at(index).get('description').setValue(this.codeValuesData[index].description);
    this.codeValues.at(index).get('position').setValue(this.codeValuesData[index].position);
    this.codeValues.at(index).get('isActive').setValue(this.codeValuesData[index].isActive);
    this.codeValues.at(index).disable();
    this.codeValueRowStatus[index] = 'disabled';
    this.codeValues.at(index).markAsPristine();
  }

  /**
   * Adds the given code value.
   * @param {number} index Index of the row.
   */
  addCodeValue(index: number) {
    const newCodeValue: { name: string, description: string, position: string, isActive: boolean } = this.codeValues.at(index).value;
    this.systemService.createCodeValue(this.codeData.id, newCodeValue)
      .subscribe((response: any) => {
        this.codeValues.at(index).disable();
        this.codeValueRowStatus[index] = 'disabled';
        this.codeValuesData.push({
          id: response.subResourceId,
          name: this.codeValues.at(index).get('name').value,
          description: this.codeValues.at(index).get('description').value,
          position: this.codeValues.at(index).get('position').value,
          isActive: this.codeValues.at(index).get('isActive').value
        });
        this.codeValues.at(index).markAsPristine();
      });
  }

  /**
   * Enables the given row.
   * @param {number} index Index of the row.
   */
  enableRow(index: number) {
    this.codeValues.at(index).enable();
    this.codeValueRowStatus[index] = 'edit';
  }

}
