import { Component, OnInit, Input, OnChanges, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatTable } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';

/** Custom Components */
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { DeleteDialogComponent } from '../../../../shared/delete-dialog/delete-dialog.component';

/** Custom Services */
import { ClientsService } from '../../../clients.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { Datatables } from 'app/core/utils/datatables';
import { DateFormatPipe } from 'app/pipes/date-format.pipe';
import { DatetimeFormatPipe } from 'app/pipes/datetime-format.pipe';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'mifosx-multi-row',
  templateUrl: './multi-row.component.html',
  styleUrls: ['./multi-row.component.scss']
})
export class MultiRowComponent implements OnInit, OnChanges {
  @ViewChild('dataTable', { static: true }) dataTableRef: MatTable<Element>;
  @Input() dataObject: any;
  datatableName: string;
  datatableColumns: string[] = [];
  datatableData: any;
  clientId: string;
  showDeleteBotton: boolean;

  /**
   * Fetches Client Id from parent route params.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Dates} dateUtils Date Utils.
   * @param {ClientsService} clientsService Clients Service.
   * @param {MatDialog} dialog Dialog Service.
   * @param {SettingsService} settingsService Settings Service
   * @param {Datatables} datatables Datatable utils
   */
  constructor(private route: ActivatedRoute,
    private dateUtils: Dates,
    private clientsService: ClientsService,
    private dialog: MatDialog,
    private settingsService: SettingsService,
    private datatables: Datatables,
    private dateFormat: DateFormatPipe,
    private dateTimeFormat: DatetimeFormatPipe,
    private numberFormat: DecimalPipe) {
    this.clientId = this.route.parent.parent.snapshot.paramMap.get('clientId');
  }

  ngOnInit() {
    this.route.params.subscribe((routeParams: any) => {
      this.datatableName = routeParams.datatableName;
    });
  }

  ngOnChanges() {
    this.datatableColumns = this.dataObject.columnHeaders.map((columnHeader: any) => {
      return columnHeader.columnName;
    });
    this.datatableData = this.dataObject.data;
    this.showDeleteBotton = this.datatableData[0] ? true : false;
  }

  add() {
    let dataTableEntryObject: any = {
      locale: this.settingsService.language.code
    };
    const dateTransformColumns: string[] = [];
    const columns = this.dataObject.columnHeaders.filter((column: any) => {
      return ((column.columnName !== 'id') && (column.columnName !== 'client_id') && (column.columnName !== 'created_at') && (column.columnName !== 'updated_at'));
    });
    const formfields: FormfieldBase[] = this.datatables.getFormfields(columns, dateTransformColumns, dataTableEntryObject);
    const data = {
      title: 'Add ' + this.datatableName,
      formfields: formfields
    };
    const addDialogRef = this.dialog.open(FormDialogComponent, { data });
    addDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        // format Dates
        dateTransformColumns.forEach((column) => {
          response.data.value[column] = this.dateUtils.formatDate(response.data.value[column], dataTableEntryObject.dateFormat);
        });
        dataTableEntryObject = { ...response.data.value, ...dataTableEntryObject };
        this.clientsService.addClientDatatableEntry(this.clientId, this.datatableName, dataTableEntryObject).subscribe(() => {
          this.clientsService.getClientDatatable(this.clientId, this.datatableName).subscribe((dataObject: any) => {
            this.datatableData = dataObject.data;
            this.dataTableRef.renderRows();
          });
        });
      }
    });
  }

  delete() {
    const deleteDataTableDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `the contents of ${this.datatableName}` }
    });
    deleteDataTableDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.clientsService.deleteDatatableContent(this.clientId, this.datatableName)
          .subscribe(() => {
            this.clientsService.getClientDatatable(this.clientId, this.datatableName).subscribe((dataObject: any) => {
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
