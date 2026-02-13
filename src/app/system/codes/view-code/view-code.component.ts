/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import {
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Services */
import { CodeValuesService, CodesService } from '@fineract/client';

/** Custom Components */
import { TranslateService } from '@ngx-translate/core';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { MatButton, MatIconButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatCard, MatCardTitle, MatCardContent } from '@angular/material/card';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatTooltip } from '@angular/material/tooltip';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * View Code Component.
 */
@Component({
  selector: 'mifosx-view-code',
  templateUrl: './view-code.component.html',
  styleUrls: ['./view-code.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    MatCardTitle,
    MatCheckbox,
    MatIconButton,
    MatTooltip
  ]
})
export class ViewCodeComponent implements OnInit {
  /** Code Data */
  codeData: any;
  /** Code Values Data */
  codeValuesData: any[];
  /** Code Values Form */
  codeValuesForm: UntypedFormGroup;
  /** Code Value Row Status */
  codeValueRowStatus: string[] = [];

  /**
   * Retrieves the codes and code values data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {CodeValuesService} codeValuesService Code Values Service.
   * @param {Router} router Router for navigation.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {MatDialog} dialog Dialog reference.
   * @param {TranslateService} translateService Translate Service.
   */
  constructor(
    private route: ActivatedRoute,
    private codeValuesService: CodeValuesService,
    private codesService: CodesService,
    private router: Router,
    private formBuilder: UntypedFormBuilder,
    private dialog: MatDialog,
    private translateService: TranslateService
  ) {
    this.route.data.subscribe((data: { code: any; codeValues: any }) => {
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
  get codeValues(): UntypedFormArray {
    return this.codeValuesForm.get('codeValues') as UntypedFormArray;
  }

  /**
   * Creates the code values form.
   */
  createCodeValuesForm() {
    this.codeValuesForm = this.formBuilder.group({
      codeValues: this.formBuilder.array([])
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
  createCodeValuesRow(codeValue?: any): UntypedFormGroup {
    return this.formBuilder.group({
      name: [
        { value: codeValue ? codeValue.name : '', disabled: true },
        Validators.required
      ],
      description: [{ value: codeValue ? codeValue.description : '', disabled: true }],
      position: [
        { value: codeValue ? codeValue.position : 0, disabled: true },
        Validators.required
      ],
      isActive: [{ value: codeValue ? codeValue.active : false, disabled: true }]
    });
  }

  /**
   * Deletes the particular code value.
   * @param {number} index Index of the row.
   */
  deleteCodeValue(index: number) {
    // Defensive checks to avoid calling API with undefined ids
    if (!this.codeValuesData || !Array.isArray(this.codeValuesData)) {
      console.error('deleteCodeValue: codeValuesData is not available', this.codeValuesData);
      return;
    }
    if (index < 0 || index >= this.codeValuesData.length) {
      console.error('deleteCodeValue: invalid index', index, 'length', this.codeValuesData.length);
      return;
    }
    const codeValueId = this.codeValuesData[index]?.id;
    if (codeValueId == null) {
      console.error('deleteCodeValue: codeValueId is null or undefined at index', index, this.codeValuesData[index]);
      return;
    }
    let codeId = this.codeData?.id;
    if (!codeId) {
      const paramId = this.route.snapshot.params['id'];
      codeId = paramId != null ? Number(paramId) : undefined;
    }
    if (codeId == null || Number.isNaN(Number(codeId))) {
      console.error('deleteCodeValue: codeId is missing or not a number', this.codeData, this.route.snapshot.params);
      // Show a friendly message and don't call the API
      alert('Unable to delete code value: missing code id. Try reloading the page.');
      return;
    }

    // All checks passed, call the API
    this.codeValuesService.deleteCodeValue({ codeId: Number(codeId), codeValueId }).subscribe((response: any) => {
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
    const updatedCodeValue: { name: string; description: string; position: number; isActive: boolean } =
      this.codeValues.at(index).value;
    let codeId = this.codeData?.id;
    if (!codeId) {
      codeId = Number(this.route.snapshot.params['id']);
    }
    this.codeValuesService
      .updateCodeValue({
        codeId,
        codeValueId: this.codeValuesData[index].id,
        putCodeValuesDataRequest: updatedCodeValue
      })
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
      data: { deleteContext: this.translateService.instant('labels.inputs.Code') + ' ' + this.codeData?.name }
    });
    deleteCodeDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        const codeId = this.codeData?.id || this.route.snapshot.params['id'];
        // Use injected CodesService to delete a code
        this.codesService.deleteCode({ codeId: Number(codeId) }).subscribe(() => {
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
    const rawValue = this.codeValues.at(index).value;
    const newCodeValue: { name: string; description: string; position: number; isActive: boolean } = {
      name: rawValue.name,
      description: rawValue.description,
      position: Number(rawValue.position),
      isActive: rawValue.isActive
    };
    let codeId = this.codeData?.id;
    if (!codeId) {
      codeId = Number(this.route.snapshot.params['id']);
    }
    this.codeValuesService
      .createCodeValue({
        codeId,
        postCodeValuesDataRequest: newCodeValue
      })
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
