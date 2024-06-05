/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { SystemService } from '../../system.service';

/** Data Imports */
import { appTableData, entitySubTypeData } from '../app-table-data';

/** Custom Components */
import { TranslateService } from '@ngx-translate/core';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { ColumnDialogComponent } from '../column-dialog/column-dialog.component';
import { DatatableColumn } from '../datatable-column.model';

/**
 * Edit Data Table Component.
 */
@Component({
  selector: 'mifosx-edit-data-table',
  templateUrl: './edit-data-table.component.html',
  styleUrls: ['./edit-data-table.component.scss']
})
export class EditDataTableComponent implements OnInit {

  /** Data Table Form. */
  dataTableForm: UntypedFormGroup;
  /** Data Table Data. */
  dataTableData: any;
  entitySubTypeData = entitySubTypeData;
  showEntitySubType: boolean;
  /** Column Data. */
  columnData: DatatableColumn[];
  /** Application Table Data. */
  appTableData = appTableData;
  /** Boolean to check if form is edited or not. */
  isFormEdited = false;
  /** Data Table Changes Data. */
  dataTableChangesData: {
    apptableName: string,
    entitySubType: string,
    dropColumns?: { name: string }[],
    changeColumns: { name: string, newName?: string, code?: string, newCode?: string, mandatory: boolean, length?: number, unique?: boolean, indexed?: boolean  }[],
    addColumns?: { name?: string, type?: string, code?: string, mandatory?: boolean, length?: number, unique?: boolean, indexed?: boolean }[]
  } = {
    apptableName: '', changeColumns: [], addColumns: [], dropColumns: [],
    entitySubType: ''
  };
  /** Data passed to dialog. */
  dataForDialog: DatatableColumn = {
      columnName: undefined,
      columnDisplayType: undefined,
      isColumnNullable: undefined,
      columnLength: undefined,
      columnCode: undefined,
      columnCodes: undefined,
      type: undefined,
      isColumnUnique: undefined,
      isColumnIndexed: undefined
    };
  /** Columns to be displayed in columns table. */
  displayedColumns: string[] = ['name', 'type', 'length', 'code', 'mandatory', 'unique', 'indexed', 'actions'];
  /** Data source for columns table. */
  dataSource: MatTableDataSource<any>;
  /** Paginator for columns table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for columns table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the data table and column codes data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {SystemService} systemService System Service.
   * @param {Router} router Router for navigation.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {MatDialog} dialog Dialog Reference.
   */
  constructor(private systemService: SystemService,
              private formBuilder: UntypedFormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private dialog: MatDialog,
              private translateService: TranslateService) {
    this.route.data.subscribe((data: { dataTable: any, columnCodes: any }) => {
      this.dataTableData = data.dataTable;
      this.dataTableData.columnHeaderData.forEach((item: any) => {
        item.system = ['created_at', 'updated_at'].includes(item.columnName);
      });
      this.columnData = this.dataTableData.columnHeaderData;
      this.dataForDialog.columnCodes = data.columnCodes;
    });
  }

  /**
   * Creates and sets data table form and columns table.
   */
  ngOnInit() {
    this.initData();
    this.createDataTableForm();
    this.setColumns();
    this.dataTableForm.controls.apptableName.valueChanges.subscribe((value: any) => {
      this.showEntitySubType = (value === 'm_client');
    });
  }

  /**
   * Initializes the data source, paginator and sorter for columns table.
   */
  setColumns() {
    this.dataSource = new MatTableDataSource(this.columnData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Initializes data table changes and column data.
   */
  initData() {
    this.columnData.shift();
    this.dataTableChangesData.apptableName = this.dataTableData.applicationTableName;
    this.dataTableChangesData.entitySubType = this.dataTableData.entitySubType;
    for (let index = 0; index < this.columnData.length; index++) {
      this.columnData[index].columnDisplayType = this.getColumnType(this.columnData[index].columnDisplayType);
      this.columnData[index].type = 'existing';
    }
    this.showEntitySubType = (this.dataTableData.applicationTableName === 'm_client');
  }

  /**
   * Creates the data table form.
   */
  createDataTableForm() {
    this.dataTableForm = this.formBuilder.group({
      'datatableName': [{ value: this.dataTableData.registeredTableName, disabled: true }, Validators.required],
      'apptableName': [{ value: this.dataTableData.applicationTableName, disabled: true }, Validators.required],
      'entitySubType': [{ value: this.dataTableData.entitySubType, disabled: true }]
    });
  }

  /**
   * Adds a new column.
   */
  addColumn() {
    this.dataForDialog.columnName = undefined;
    this.dataForDialog.columnDisplayType = undefined;
    this.dataForDialog.isColumnNullable = false;
    this.dataForDialog.isColumnUnique = false;
    this.dataForDialog.isColumnIndexed = false;
    this.dataForDialog.columnLength = undefined;
    this.dataForDialog.columnCode = undefined;
    this.dataForDialog.type = 'new';
    const addColumnDialogRef = this.dialog.open(ColumnDialogComponent, {
      data: this.dataForDialog,
      height: '450px',
      width: '400px'
    });
    addColumnDialogRef.afterClosed().subscribe((response: any) => {
      if (response !== '') {
        this.isFormEdited = true;
        const newColumn: DatatableColumn = {
          columnName: response.name,
          columnDisplayType: response.type,
          isColumnNullable: !response.mandatory,
          isColumnUnique: response.unique,
          isColumnIndexed: response.indexed,
          columnLength: response.length,
          columnCode: response.code,
          type: 'new'
        };
        let alreadyExist = false;
        this.columnData.forEach((column: DatatableColumn) => {
          if ((newColumn.columnName === column.columnName) || (newColumn.columnName === column.columnName
            && newColumn.columnDisplayType === column.columnDisplayType
            && newColumn.isColumnNullable === column.isColumnNullable)) {
              alreadyExist = true;
            }
        });
        if (!alreadyExist) {
          this.dataTableChangesData.addColumns.push({
            name: response.name,
            type: response.type,
            mandatory: response.mandatory,
            unique: response.unique,
            indexed: response.indexed,
            length: response.length,
            code: response.code
          });
          this.columnData.push(newColumn);
          this.dataSource.connect().next(this.columnData);
        }
      }
    });
  }

  /**
   * Edits column.
   * @param {any} column Column.
   */
  editColumn(column: any) {
    this.dataForDialog.columnName = column.columnName;
    this.dataForDialog.columnDisplayType = column.columnDisplayType;
    this.dataForDialog.isColumnNullable = !column.isColumnNullable;
    this.dataForDialog.isColumnUnique = column.isColumnUnique;
    this.dataForDialog.isColumnIndexed = column.isColumnIndexed;
    this.dataForDialog.columnLength = column.columnLength;
    this.dataForDialog.columnCode = column.columnCode;
    this.dataForDialog.type = column.type;
    const editColumnDialogRef = this.dialog.open(ColumnDialogComponent, {
      data: this.dataForDialog,
      height: '450px',
      width: '400px'
    });
    editColumnDialogRef.afterClosed().subscribe((response: any) => {
      if (response !== '') {
        this.isFormEdited = true;
        if (column.type === 'new') {
          this.dataTableChangesData.addColumns[this.dataTableChangesData.addColumns
            .findIndex(newColumn => newColumn.name === column.columnName
                                    && newColumn.type === column.columnDisplayType
                                    && newColumn.mandatory === column.isColumnNullable)] = {
            name: response.name,
            type: response.type,
            code: response.code,
            mandatory: response.mandatory,
            length: response.length
          };
          this.columnData[this.columnData.indexOf(column)] = {
            columnName: response.name,
            columnDisplayType: response.type,
            isColumnNullable: !response.mandatory,
            isColumnUnique: response.unique,
            isColumnIndexed: response.indexed,
            columnLength: response.length,
            columnCode: response.code,
            type: 'new'
          };
        } else if (column.type === 'existing') {
          this.columnData[this.columnData.indexOf(column)] = {
            columnName: response.name,
            columnDisplayType: column.columnDisplayType,
            isColumnNullable: column.isColumnNullable,
            isColumnUnique: column.unique,
            isColumnIndexed: column.indexed,
            columnLength: column.columnLength,
            columnCode: column.columnCode,
            type: 'existing'
          };

          const index = this.dataTableChangesData.changeColumns.findIndex(newColumn => newColumn.newName === column.columnName);
          if (index === -1) {
            this.dataTableChangesData.changeColumns.push({
              name: column.columnName,
              newName: response.name,
              code: column.columnCode,
              newCode: response.code,
              mandatory: response.mandatory,
              length: response.length
            });
          } else {
            this.dataTableChangesData.changeColumns[index] = {
              name: column.columnName,
              newName: response.name,
              code: column.columnCode,
              newCode: response.code,
              mandatory: response.mandatory,
              length: response.length
            };
          }
        }
        this.dataSource.connect().next(this.columnData);
      }
    });
  }

  /**
   * Deletes the column.
   * @param {any} column Column.
   */
  deleteColumn(column: any) {
    const deleteColumnDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext:  this.translateService.instant('labels.inputs.Column') + ' ' + column.columnName}
    });
    deleteColumnDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.isFormEdited = true;
        this.columnData.splice(this.columnData.indexOf(column), 1);
        this.dataSource.connect().next(this.columnData);
        if (column.type === 'existing') {
          this.dataTableChangesData.dropColumns.push({
            name: column.columnName
          });
        } else if (column.type === 'new') {
          this.dataTableChangesData.addColumns.splice(this.dataTableChangesData.addColumns
            .findIndex(newColumn => newColumn.name === column.columnName
                                    && newColumn.type === column.columnDisplayType
                                    && newColumn.mandatory === column.isColumnNullable), 1);
        }
      }
    });
  }

  /**
   * Returns the modified Column Type.
   * @param {string} columnDisplayType Column Display Type.
   * @returns {string} Column Type.
   */
  getColumnType(columnDisplayType: string): string {
    switch (columnDisplayType) {
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
   * Submits the data table form and updates data table,
   * if successful redirects to view updated data table.
   */
  submit() {
    if (!this.dataTableChangesData.addColumns || this.dataTableChangesData.addColumns.length === 0) {
      this.dataTableChangesData.addColumns = undefined;
    }
    if (!this.dataTableChangesData.changeColumns || this.dataTableChangesData.changeColumns.length === 0) {
      this.dataTableChangesData.changeColumns = undefined;
    }
    if (!this.dataTableChangesData.dropColumns || this.dataTableChangesData.dropColumns.length === 0) {
      this.dataTableChangesData.dropColumns = undefined;
    }
    this.systemService.updateDataTable(this.dataTableChangesData, this.dataTableData.registeredTableName)
      .subscribe((response: any) => {
        this.router.navigate(['../'], { relativeTo: this.route });
      });
  }

}
