/** Angular Imports */
import { Component, OnInit, TemplateRef, ElementRef, ViewChild, AfterViewInit  } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

/** Custom Services */
import { SystemService } from '../../system.service';
import { PopoverService } from '../../../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../../../configuration-wizard/configuration-wizard.service';

/** Data Imports */
import { appTableData, entitySubTypeData, savingsSubTypeData } from '../app-table-data';

/** Custom Components */
import { ColumnDialogComponent } from '../column-dialog/column-dialog.component';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';

/** Custom Dialog Component */
import { ContinueSetupDialogComponent } from '../../../configuration-wizard/continue-setup-dialog/continue-setup-dialog.component';
import { DatatableColumn } from '../datatable-column.model';

/**
 * Create Data Table Component.
 */
@Component({
  selector: 'mifosx-create-data-table',
  templateUrl: './create-data-table.component.html',
  styleUrls: ['./create-data-table.component.scss']
})
export class CreateDataTableComponent implements OnInit, AfterViewInit {

  /** Data Table Form */
  dataTableForm: UntypedFormGroup;
  /** Application Table Data */
  appTableData = appTableData;
  entitySubTypeData = entitySubTypeData;
  savingsSubTypeData = savingsSubTypeData;
  showEntitySubType: boolean;
  showSavingsSubType: boolean;
  /** Column Data */
  columnData: DatatableColumn[] = [];
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

  /* Reference of create datatables form */
  @ViewChild('dataTableFormRef') dataTableFormRef: ElementRef<any>;
  /* Template for popover on create datatables form */
  @ViewChild('templateDataTableFormRef') templateDataTableFormRef: TemplateRef<any>;

  /**
   * Retrieves the column codes data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {SystemService} systemService System Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {MatDialog} dialog Dialog Reference.
   * @param {ConfigurationWizardService} configurationWizardService ConfigurationWizard Service.
   * @param {PopoverService} popoverService PopoverService.
   */
  constructor(private formBuilder: UntypedFormBuilder,
              private systemService: SystemService,
              private route: ActivatedRoute,
              private router: Router,
              private dialog: MatDialog,
              private configurationWizardService: ConfigurationWizardService,
              private popoverService: PopoverService) {
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
    this.dataTableForm.controls.apptableName.valueChanges.subscribe((value: any) => {
      this.showEntitySubType = (value === 'm_client');
      this.showSavingsSubType = (value === 'm_savings_product');
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
   * Creates the data table form.
   */
  createDataTableForm() {
    this.dataTableForm = this.formBuilder.group({
      'datatableName': ['', Validators.required],
      'apptableName': ['', Validators.required],
      'multiRow': [false],
      'entitySubType': ['']
    });
  }

  /**
   * Adds a new column.
   */
  addColumn() {
    this.dataForDialog.columnName = undefined;
    this.dataForDialog.columnDisplayType = undefined;
    this.dataForDialog.isColumnNullable = undefined;
    this.dataForDialog.columnLength = undefined;
    this.dataForDialog.columnCode = undefined;
    this.dataForDialog.isColumnUnique = undefined;
    this.dataForDialog.isColumnIndexed = undefined;
    this.dataForDialog.type = 'new';
    const addColumnDialogRef = this.dialog.open(ColumnDialogComponent, {
      data: this.dataForDialog,
      height: '450px',
      width: '400px'
    });
    addColumnDialogRef.afterClosed().subscribe((response: any) => {
      if (response !== '') {
        this.columnData.push({
          columnName: response.name,
          columnDisplayType: response.type,
          isColumnNullable: !response.mandatory,
          isColumnUnique: response.unique,
          isColumnIndexed: response.indexed,
          columnLength: response.length,
          columnCode: response.code,
          type: 'new'
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
        this.columnData[this.columnData.findIndex(newColumn => newColumn.columnName === column.name)] = {
          columnName: response.name,
          columnDisplayType: response.type,
          isColumnNullable: !response.mandatory,
          isColumnUnique: response.unique,
          isColumnIndexed: response.indexed,
          columnLength: response.length,
          columnCode: response.code,
          type: 'existing'
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
    const columns: any = [];
    this.columnData.forEach((column: DatatableColumn) => {
      columns.push({
        name: column.columnName,
        type: column.columnDisplayType,
        code: column.columnCode,
        length: column.columnLength,
        mandatory: !column.isColumnNullable,
        unique: column.isColumnUnique,
        indexed: column.isColumnIndexed
      });
    });
    this.dataTableForm.value.columns = columns;
    const payload = this.dataTableForm.value;
    if (this.dataTableForm.value.entitySubType == null || this.dataTableForm.value.entitySubType === '') {
      delete payload.entitySubType;
    }
    this.systemService.createDataTable(payload).subscribe((response: any) => {
      if (this.configurationWizardService.showDatatablesForm === true) {
          this.configurationWizardService.showDatatablesForm = false;
          this.openDialog();
      } else {
        this.router.navigate(['../', response.resourceIdentifier], { relativeTo: this.route });
      }
    });
  }

  /**
   * Popover function
   * @param template TemplateRef<any>.
   * @param target HTMLElement | ElementRef<any>.
   * @param position String.
   * @param backdrop Boolean.
   */
  showPopover(template: TemplateRef<any>, target: HTMLElement | ElementRef<any>, position: string, backdrop: boolean): void {
    setTimeout(() => this.popoverService.open(template, target, position, backdrop, {}), 200);
  }

  /**
   * To show popover.
   */
  ngAfterViewInit() {
    if (this.configurationWizardService.showDatatablesForm === true) {
      setTimeout(() => {
          this.showPopover(this.templateDataTableFormRef, this.dataTableFormRef.nativeElement, 'bottom', true);
      });
    }
  }

  /**
   * Next Step (System Codes Page) Configuration Wizard.
   */
  nextStep() {
    this.configurationWizardService.showDatatablesForm = false;
    this.configurationWizardService.showSystemCodes = true;
    this.router.navigate(['/system']);
  }

  /**
   * Previous Step (Manage Datatables Page) Configuration Wizard.
   */
  previousStep() {
    this.configurationWizardService.showDatatablesForm = false;
    this.configurationWizardService.showDatatablesList = true;
    this.router.navigate(['/system/data-tables']);
  }

  /**
   * Opens dialog if the user wants to create more datatables Configuration Wizard.
   */
  openDialog() {
    const continueSetupDialogRef = this.dialog.open(ContinueSetupDialogComponent, {
      data: {
        stepName: 'data table'
      },
    });
    continueSetupDialogRef.afterClosed().subscribe((response: { step: number }) => {
      if (response.step === 1) {
          this.configurationWizardService.showDatatablesForm = false;
          this.router.navigate(['../'], { relativeTo: this.route });
        } else if (response.step === 2) {
          this.configurationWizardService.showDatatablesForm = true;
          this.router.routeReuseStrategy.shouldReuseRoute = () => false;
          this.router.onSameUrlNavigation = 'reload';
          this.router.navigate(['/organization/data-tables/create']);
        } else if (response.step === 3) {
          this.configurationWizardService.showDatatablesForm = false;
          this.configurationWizardService.showSystemCodes = true;
          this.router.navigate(['/system']);
        }
    });
  }
}
