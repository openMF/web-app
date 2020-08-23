/** Angular Imports */
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';

/** Custom Components */
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { DeleteDialogComponent } from '../../../../shared/delete-dialog/delete-dialog.component';

/** Custom Models */
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';
import { DatepickerBase } from 'app/shared/form-dialog/formfield/model/datepicker-base';
import { SelectBase } from 'app/shared/form-dialog/formfield/model/select-base';
import { CheckboxBase } from 'app/shared/form-dialog/formfield/model/checkbox-base';

/** Custom Services */
import { CentersService } from '../../../centers.service';


/**
 * Centers Single Row Data Tables
 */
@Component({
  selector: 'mifosx-single-row',
  templateUrl: './single-row.component.html',
  styleUrls: ['./single-row.component.scss']
})
export class SingleRowComponent implements OnInit {

  /** Data Object */
  @Input() dataObject: any;

  /** Data Table Name */
  datatableName: string;
  /** Center Id */
  centerId: string;

  /**
   * Fetches center Id from parent route params.
   * @param {ActivatedRoute} route Activated Route.
   * @param {DatePipe} datePipe Date Pipe.
   * @param {CentersService} centersService Centers Service.
   * @param {MatDialog} dialog Mat Dialog.
   */
  constructor(private route: ActivatedRoute,
              private datePipe: DatePipe,
              private dialog: MatDialog,
              private centersService: CentersService) {
    this.centerId = this.route.parent.parent.snapshot.paramMap.get('centerId');
  }

  /**
   * Fetches data table name from route params.
   * subscription is required due to asynchronicity.
   */
  ngOnInit() {
    this.route.params.subscribe((routeParams: any) => {
      this.datatableName = routeParams.datatableName;
    });
  }

  /**
   * Creates a new instance of the given single row data table.
   */
  add() {
    let dataTableEntryObject: any = { locale: 'en' };
    const dateTransformColumns: string[] = [];
    const columns = this.dataObject.columnHeaders.filter((column: any) => {
      return ((column.columnName !== 'id') && (column.columnName !== 'center_id'));
    });
    const formfields: FormfieldBase[] = this.getFormfields(columns, dateTransformColumns, dataTableEntryObject);
    const data = {
      title: 'Add ' + this.datatableName,
      formfields: formfields
    };
    const addDialogRef = this.dialog.open(FormDialogComponent, { data });
    addDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        dateTransformColumns.forEach((column) => {
          response.data.value[column] = this.datePipe.transform(response.data.value[column], dataTableEntryObject.dateFormat);
        });
        dataTableEntryObject = { ...response.data.value, ...dataTableEntryObject };
        this.centersService.addCenterDatatableEntry(this.centerId, this.datatableName, dataTableEntryObject).subscribe(() => {
          this.centersService.getCenterDatatable(this.centerId, this.datatableName).subscribe((dataObject: any) => {
            this.dataObject = dataObject;
          });
        });
      }
    });
  }

  /**
   * Edits the current instance of single row data table.
   */
  edit() {
    let dataTableEntryObject: any = { locale: 'en' };
    const dateTransformColumns: string[] = [];
    const columns = this.dataObject.columnHeaders.filter((column: any) => {
      return ((column.columnName !== 'id') && (column.columnName !== 'center_id'));
    });
    let formfields: FormfieldBase[] = this.getFormfields(columns, dateTransformColumns, dataTableEntryObject);
    formfields = formfields.map((formfield: FormfieldBase, index: number) => {
      formfield.value = (this.dataObject.data[0].row[index + 1]) ? this.dataObject.data[0].row[index + 1] : '';
      return formfield;
    });
    const data = {
      title: 'Edit ' + this.datatableName,
      layout: { addButtonText: 'Confirm' },
      formfields: formfields
    };
    const editDialogRef = this.dialog.open(FormDialogComponent, { data });
    editDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        dateTransformColumns.forEach((column) => {
          response.data.value[column] = this.datePipe.transform(response.data.value[column], dataTableEntryObject.dateFormat);
        });
        dataTableEntryObject = { ...response.data.value, ...dataTableEntryObject };
        this.centersService.editCenterDatatableEntry(this.centerId, this.datatableName, dataTableEntryObject).subscribe(() => {
          this.centersService.getCenterDatatable(this.centerId, this.datatableName).subscribe((dataObject: any) => {
            this.dataObject = dataObject;
          });
        });
      }
    });
  }

  /**
   * Deletes the current instance of single row data table.
   */
  delete() {
    const deleteDataTableDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `the contents of ${this.datatableName}` }
    });
    deleteDataTableDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.centersService.deleteDatatableContent(this.centerId, this.datatableName)
          .subscribe(() => {
            this.centersService.getCenterDatatable(this.centerId, this.datatableName).subscribe((dataObject: any) => {
              this.dataObject = dataObject;
            });
          });
      }
    });
  }

  /**
   * Maps API response to data table form fields.
   * @param {any} columns Data Table Columns.
   * @param {string[]} dateTransformColumns Columns transformed with date pipe.
   * @param {any} dataTableEntryObject Additional data table details.
   */
  getFormfields(columns: any, dateTransformColumns: string[], dataTableEntryObject: any) {
    return columns.map((column: any) => {
      switch (column.columnDisplayType) {
        case 'INTEGER':
        case 'STRING':
        case 'DECIMAL':
        case 'TEXT': return new InputBase({
          controlName: column.columnName,
          label: column.columnName,
          value: '',
          type: (column.columnDisplayType === 'INTEGER' || column.columnDisplayType === 'DECIMAL') ? 'number' : 'text',
          required: (column.isColumnNullable) ? false : true
        });
        case 'BOOLEAN': return new CheckboxBase({
          controlName: column.columnName,
          label: column.columnName,
          value: '',
          type: 'checkbox',
          required: (column.isColumnNullable) ? false : true
        });
        case 'CODELOOKUP': return new SelectBase({
          controlName: column.columnName,
          label: column.columnName,
          value: '',
          options: { label: 'value', value: 'id', data: column.columnValues },
          required: (column.isColumnNullable) ? false : true
        });
        case 'DATE': {
          dateTransformColumns.push(column.columnName);
          dataTableEntryObject.dateFormat = 'yyyy-MM-dd';
          return new DatepickerBase({
            controlName: column.columnName,
            label: column.columnName,
            value: '',
            type: 'date',
            required: (column.isColumnNullable) ? false : true
          });
        }
        case 'DATETIME': {
          dateTransformColumns.push(column.columnName);
          dataTableEntryObject.dateFormat = 'yyyy-MM-dd HH:mm';
          return new DatepickerBase({
            controlName: column.columnName,
            label: column.columnName,
            value: '',
            type: 'datetime-local',
            required: (column.isColumnNullable) ? false : true
          });
        }
      }
    });
  }

}
