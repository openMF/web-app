import { DecimalPipe } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
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

@Component({
  selector: 'mifosx-datatable-multi-row',
  templateUrl: './datatable-multi-row.component.html',
  styleUrls: ['./datatable-multi-row.component.scss']
})
export class DatatableMultiRowComponent implements OnInit {

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

  /** Data Table Reference */
  @ViewChild('dataTable', { static: true }) dataTableRef: MatTable<Element>;

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
    this.route.params.subscribe((routeParams: any) => {
      this.datatableName = routeParams.datatableName;
    });
    this.datatableColumns = this.dataObject.columnHeaders.map((columnHeader: any) => {
      return columnHeader.columnName;
    });
    this.datatableData = this.dataObject.data;
    this.showDeleteBotton = this.datatableData[0] ? true : false;
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
            this.dataTableRef.renderRows();
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
            this.dataTableRef.renderRows();
           });
        });
      }
    });
  }

  formatValue(index: number, value: any): any {
    const columnDisplayType = this.dataObject.columnHeaders[index].columnDisplayType;
    if (columnDisplayType === 'DATE') {
      return this.dateFormat.transform(value);
    } else if (columnDisplayType === 'DATETIME') {
      return this.dateTimeFormat.transform(value);
    } else if (columnDisplayType === 'INTEGER' || columnDisplayType === 'DECIMAL') {
      return this.numberFormat.transform(value);
    }
    return value;
  }


}
