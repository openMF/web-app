/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

/** Custom Services */
import { SystemService } from '../../system.service';

/** Data Imports */
import { appTableData } from '../app-table-data';

/** Custom Components */
import { ColumnDialogComponent } from '../column-dialog/column-dialog.component';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';

/**
 * Create Data Table Component.
 */
@Component({
  selector: 'mifosx-create-data-table',
  templateUrl: './create-data-table.component.html',
  styleUrls: ['./create-data-table.component.scss']
})
export class CreateDataTableComponent implements OnInit {

  /** Data Table Form */
  dataTableForm: FormGroup;
  /** Application Table Data */
  appTableData = appTableData;
  /** Column Data */
  columnData: any[] = [];
  /** Data passed to dialog. */
  dataForDialog: {
    columnName: string,
    columnDisplayType: string,
    isColumnPrimaryKey: boolean,
    columnLength: string,
    columnCode: string,
    columnCodes: any,
    type: string
  } = {
      columnName: undefined,
      columnDisplayType: undefined,
      isColumnPrimaryKey: undefined,
      columnLength: undefined,
      columnCode: undefined,
      columnCodes: undefined,
      type: undefined
    };
  /** Columns to be displayed in columns table. */
  displayedColumns: string[] = ['name', 'type', 'mandatory', 'length', 'code', 'actions'];
  /** Data source for columns table. */
  dataSource: MatTableDataSource<any>;
  /** Paginator for columns table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for columns table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the column codes data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {SystemService} systemService System Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {MatDialog} dialog Dialog Reference.
   */
  constructor(private formBuilder: FormBuilder,
              private systemService: SystemService,
              private route: ActivatedRoute,
              private router: Router,
              private dialog: MatDialog) {
    this.route.data.subscribe((data: { columnCodes: any }) => {
      this.dataForDialog.columnCodes = data.columnCodes;
    });
  }

  /**
   * Creates data table form and sets columns table.
   */
  ngOnInit() {
    this.createDataTableForm();
    this.setColumns();
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
   * Creates the data table form.
   */
  createDataTableForm() {
    this.dataTableForm = this.formBuilder.group({
      'datatableName': ['', Validators.required],
      'apptableName': ['', Validators.required],
      'multiRow': ['']
    });
  }

  /**
   * Adds a new column.
   */
  addColumn() {
    this.dataForDialog.columnName = undefined;
    this.dataForDialog.columnDisplayType = undefined;
    this.dataForDialog.isColumnPrimaryKey = false;
    this.dataForDialog.columnLength = undefined;
    this.dataForDialog.columnCode = undefined;
    this.dataForDialog.type = 'new';
    const addColumnDialogRef = this.dialog.open(ColumnDialogComponent, {
      data: this.dataForDialog
    });
    addColumnDialogRef.afterClosed().subscribe((response: any) => {
      if (response !== '') {
        this.columnData.push({
          name: response.name,
          type: response.type,
          mandatory: response.mandatory,
          length: response.length,
          code: response.code
        });
        this.dataSource.connect().next(this.columnData);
      }
    });
  }

  /**
   * Edits column.
   * @param {any} column Column.
   */
  editColumn(column: any) {
    this.dataForDialog.columnName = column.name;
    this.dataForDialog.columnDisplayType = column.type;
    this.dataForDialog.isColumnPrimaryKey = column.mandatory;
    this.dataForDialog.columnLength = column.length;
    this.dataForDialog.columnCode = column.code;
    this.dataForDialog.type = 'new';
    const editColumnDialogRef = this.dialog.open(ColumnDialogComponent, {
      data: this.dataForDialog
    });
    editColumnDialogRef.afterClosed().subscribe((response: any) => {
      if (response !== '') {
        this.columnData[this.columnData.findIndex(newColumn => newColumn.name === column.name)] = {
          name: response.name,
          type: response.type,
          mandatory: response.mandatory,
          length: response.length,
          code: response.code
        };
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
      data: { deleteContext: `column ${column.name}` }
    });
    deleteColumnDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.columnData.splice(this.columnData.indexOf(column), 1);
        this.dataSource.connect().next(this.columnData);
      }
    });
  }

  /**
   * Submits the data table form and creates data table,
   * if successful redirects to view created data table.
   */
  submit() {
    this.dataTableForm.value.columns = this.columnData;
    this.systemService.createDataTable(this.dataTableForm.value)
      .subscribe((response: any) => {
        this.router.navigate(['../', response.resourceIdentifier], { relativeTo: this.route });
      });
  }
}
