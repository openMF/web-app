import { SelectionModel } from '@angular/cdk/collections';
import { DecimalPipe } from '@angular/common';
import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Datatables } from 'app/core/utils/datatables';
import { Dates } from 'app/core/utils/dates';
import { DateFormatPipe } from 'app/pipes/date-format.pipe';
import { DatetimeFormatPipe } from 'app/pipes/datetime-format.pipe';
import { SettingsService } from 'app/settings/settings.service';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { SystemService } from 'app/system/system.service';
import * as _ from 'lodash';

@Component({
  selector: 'mifosx-datatable-multi-row',
  templateUrl: './datatable-multi-row.component.html',
  styleUrls: ['./datatable-multi-row.component.scss']
})
export class DatatableMultiRowComponent implements OnInit, OnDestroy, OnChanges {

  SELECT_NAME_FIELD:string = 'select';
  /** Data Object */
  @Input() dataObject: any;
  @Input() entityId: string;
  @Input() entityType: string;

  /** Data Table Name */
  datatableName: string;
  /** Data Table Columns */
  datatableColumns: string[] = [];
  /** Data Table Data */
  datatableData: any;

  /** Toggle button visibility */
  showDeleteBotton: boolean;
  /** Row Selection Data */
  selection: SelectionModel<any>;

  /** Data Table Reference */
  @ViewChild('dataTable') dataTableRef: MatTable<Element>;

  /**
   * Fetches center Id from parent route params.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Dates} dateUtils Date Utils.
   * @param {SystemService} systemService system Service.
   * @param {SettingsService} settingsService Settings Service.
   * @param {MatDialog} dialog Mat Dialog.
   * @param {Datatables} datatables Datatable utils
   */
  constructor(private route: ActivatedRoute,
              private dateUtils: Dates,
              private systemService: SystemService,
              private settingsService: SettingsService,
              private dialog: MatDialog,
              private datatables: Datatables,
              private dateFormat: DateFormatPipe,
              private dateTimeFormat: DatetimeFormatPipe,
              private numberFormat: DecimalPipe) { }

  /**
   * Fetches data table name from route params.
   * subscription is required due to asynchronicity.
   */
  ngOnInit() {
    this.selection = new SelectionModel(true, []);
    this.route.params.subscribe((routeParams: any) => {
      this.datatableName = routeParams.datatableName;
    });
    this.setData();
  }

  ngOnDestroy(): void {
    this.datatableName = null;
    this.datatableColumns = null;
    this.datatableData = null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.setData();
  }

  setData() {
    this.datatableColumns = [this.SELECT_NAME_FIELD].concat(this.dataObject.columnHeaders.map((columnHeader: any) => {
      return columnHeader.columnName;
    })
    );
    this.datatableData = this.dataObject.data;
    // console.log(this.datatableData);

    if (this.dataTableRef) {
      this.dataTableRef.renderRows();
    }
  }

  /**
   * Adds a new row to the given multi row data table.
   */
  add() {
    let dataTableEntryObject: any = { locale: this.settingsService.language.code };
    const dateTransformColumns: string[] = [];
    const columns = this.datatables.filterSystemColumns(this.dataObject.columnHeaders);
    const formfields: FormfieldBase[] = this.datatables.getFormfields(columns, dateTransformColumns, dataTableEntryObject);
    const data = {
      title: 'Add ' + this.datatableName + ' for ' + this.entityType,
      formfields: formfields
    };
    const addDialogRef = this.dialog.open(FormDialogComponent, { data, width: '50rem' });
    addDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        dateTransformColumns.forEach((column) => {
          response.data.value[column] = this.dateUtils.formatDate(response.data.value[column], dataTableEntryObject.dateFormat);
        });
        dataTableEntryObject = { ...response.data.value, ...dataTableEntryObject };
        this.systemService.addEntityDatatableEntry(this.entityId, this.datatableName, dataTableEntryObject).subscribe(() => {
          this.systemService.getEntityDatatable(this.entityId, this.datatableName).subscribe((dataObject: any) => {
            this.datatableData = dataObject.data;
            if (this.dataTableRef) {
              this.dataTableRef.renderRows();
            }
          });
        });
      }
    });
  }

  /**
   * Deletes all rows of the given multi row data table.
   */
  delete() {
    const deleteDataTableDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `the contents of ${this.datatableName}` }
    });
    deleteDataTableDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.systemService.deleteDatatableContent(this.entityId, this.datatableName).subscribe(() => {
          this.systemService.getEntityDatatable(this.entityId, this.datatableName).subscribe((dataObject: any) => {
            this.datatableData = dataObject.data;
            this.showDeleteBotton = false;
            if (this.dataTableRef) {
              this.dataTableRef.renderRows();
            }
           });
        });
      }
    });
  }

  /**
   * Deletes all rows of the given multi row data table.
   */
  deleteSelected() {
    const deleteDataTableDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `the ${this.selection.selected.length} items selected of ${this.datatableName}` }
    });
    deleteDataTableDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.selection.selected.forEach((data) => {
          this.systemService.deleteDatatableEntry(this.entityId, data.row[1], this.datatableName).subscribe(() => {
            this.datatableData.forEach((item: any, index: any) => {
              if (item.row[1] === data.row[1]) delete this.datatableData[index]
            });
          });
        });
      }
    });
  }

  formatValue(index: number, value: any): any {
    if (this.dataObject.columnHeaders && this.dataObject.columnHeaders[index]) {
      const columnDisplayType = this.dataObject.columnHeaders[index].columnDisplayType;
      if (columnDisplayType === 'DATE') {
        return this.dateFormat.transform(value);
      } else if (columnDisplayType === 'DATETIME') {
        return this.dateTimeFormat.transform(value);
      } else if (columnDisplayType === 'INTEGER' || columnDisplayType === 'DECIMAL') {
        if (typeof value === 'number') {
          return this.numberFormat.transform(value);
        } else {
          return value;
        }
      }
    }
    return value;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected;
    return (this.datatableData.length == numSelected);
  }

  isAnySelected() {
    return (this.selection.selected.length > 0);
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle(change: MatCheckboxChange): void {
    if (change.checked) {
      this.datatableData.forEach((row: any) => this.selection.select(row));
    } else {
      this.selection = new SelectionModel(true, []);
    }
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  isToDelete(data: any): string {
    if (this.selection.isSelected(data)) {
      return 'tobe-deleted';
    }
    return '';
  }

}
