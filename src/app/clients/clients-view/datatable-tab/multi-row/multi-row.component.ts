import { Component, OnInit, Input, OnChanges, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatTable } from '@angular/material/table';
import { MatDialog } from '@angular/material';
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';
import { SelectBase } from 'app/shared/form-dialog/formfield/model/select-base';
import { DatePipe } from '@angular/common';

/** Custom Components */
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';

/** Custom Services */
import { ClientsService } from '../../../clients.service';

@Component({
  selector: 'mifosx-multi-row',
  templateUrl: './multi-row.component.html',
  styleUrls: ['./multi-row.component.scss']
})
export class MultiRowComponent implements OnInit, OnChanges {
  @ViewChild('dataTable') dataTableRef: MatTable<Element>;
  @Input() dataObject: any;
  datatableName: string;
  datatableColumns: string[] = [];
  datatableData: any;
  clientId: string;

  constructor(private route: ActivatedRoute,
    private datePipe: DatePipe,
    private clientService: ClientsService,
    private dialog: MatDialog) {
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
  }

  add() {
    let dataTableEntryObject: any = {
      locale: 'en'
    };
    const dateTransformColumns: string[] = [];
    const columns = this.dataObject.columnHeaders.filter((column: any) => {
      return ((column.columnName !== 'id') && (column.columnName !== 'client_id'));
    });
    const formfields: FormfieldBase[] = columns.map((column: any) => {
      if (column.columnDisplayType === 'INTEGER' || column.columnDisplayType === 'STRING') {
        return new InputBase({
          controlName: column.columnName,
          label: column.columnName,
          value: '',
          type: (column.columnDisplayType === 'INTEGER') ? 'number' : 'text',
          required: (column.isColumnNullable) ? false : true
        });
      }
      if (column.columnDisplayType === 'CODELOOKUP') {
        return new SelectBase({
          controlName: column.columnName,
          label: column.columnName,
          value: '',
          options: { label: 'value', value: 'id', data: column.columnValues },
          required: (column.isColumnNullable) ? false : true
        });
      }
      if (column.columnDisplayType === 'DATE') {
        dateTransformColumns.push(column.columnName);
        dataTableEntryObject.dateFormat = 'yyyy-MM-dd';
        return new InputBase({
          controlName: column.columnName,
          label: column.columnName,
          value: '',
          type: 'date',
          required: (column.isColumnNullable) ? false : true
        });
      }
      if (column.columnDisplayType === 'DATETIME') {
        dateTransformColumns.push(column.columnName);
        dataTableEntryObject.dateFormat = 'yyyy-MM-dd HH:mm';
        return new InputBase({
          controlName: column.columnName,
          label: column.columnName,
          value: '',
          type: 'datetime-local',
          required: (column.isColumnNullable) ? false : true
        });
      }

    });
    const data = {
      title: 'Add ' + this.datatableName,
      formfields: formfields
    };
    const addDialogRef = this.dialog.open(FormDialogComponent, { data });
    addDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        // format Dates
        dateTransformColumns.forEach((column) => {
          response.data.value[column] = this.datePipe.transform(response.data.value[column], dataTableEntryObject.dateFormat);
        });
        dataTableEntryObject = { ...response.data.value, ...dataTableEntryObject };
        this.clientService.addClientDatatableEntry(this.clientId, this.datatableName, dataTableEntryObject).subscribe(() => {
          this.clientService.getClientDatatable(this.clientId, this.datatableName).subscribe((dataObject: any) => {
            this.datatableData = dataObject.data;
            this.dataTableRef.renderRows();
          });
        });
      }
    });
  }

}
