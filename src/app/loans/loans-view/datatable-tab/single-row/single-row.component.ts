/** Angular Imports */
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/** Custom Components */
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { DeleteDialogComponent } from '../../../../shared/delete-dialog/delete-dialog.component';
import { SettingsService } from 'app/settings/settings.service';

/** Custom Models */
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';

/** Custom Services */
import { LoansService } from '../../../loans.service';
import { Dates } from 'app/core/utils/dates';
import { Datatables } from 'app/core/utils/datatables';


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
  /** Loan Id */
  loanId: string;

  /**
   * Fetches loan Id from parent route params.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Dates} dateUtils Date Utils.
   * @param {LoansService} loansService Loans Service.
   * @param {MatDialog} dialog Mat Dialog.
   * @param {SettingsService} settingsService Settings Service
   * @param {Datatables} datatables Datatable utils
   */
  constructor(private route: ActivatedRoute,
              private dateUtils: Dates,
              private dialog: MatDialog,
              private loansService: LoansService,
              private settingsService: SettingsService,
              private datatables: Datatables) {
    this.loanId = this.route.parent.parent.snapshot.paramMap.get('loanId');
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
    let dataTableEntryObject: any = { locale: this.settingsService.language.code };
    const dateTransformColumns: string[] = [];
    const columns = this.dataObject.columnHeaders.filter((column: any) => {
      return ((column.columnName !== 'id') && (column.columnName !== 'loan_id') && (column.columnName !== 'created_at') && (column.columnName !== 'updated_at'));
    });
    const formfields: FormfieldBase[] = this.datatables.getFormfields(columns, dateTransformColumns, dataTableEntryObject);
    const data = {
      title: 'Add ' + this.datatableName,
      formfields: formfields
    };
    const addDialogRef = this.dialog.open(FormDialogComponent, { data });
    addDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        dateTransformColumns.forEach((column) => {
          response.data.value[column] = this.dateUtils.formatDate(response.data.value[column], dataTableEntryObject.dateFormat);
        });
        dataTableEntryObject = { ...response.data.value, ...dataTableEntryObject };
        this.loansService.addLoanDatatableEntry(this.loanId, this.datatableName, dataTableEntryObject).subscribe(() => {
          this.loansService.getLoanDatatable(this.loanId, this.datatableName).subscribe((dataObject: any) => {
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
    let dataTableEntryObject: any = { locale: this.settingsService.language.code };
    const dateTransformColumns: string[] = [];
    const columns = this.dataObject.columnHeaders.filter((column: any) => {
      return ((column.columnName !== 'id') && (column.columnName !== 'loan_id') && (column.columnName !== 'created_at') && (column.columnName !== 'updated_at'));
    });
    let formfields: FormfieldBase[] = this.datatables.getFormfields(columns, dateTransformColumns, dataTableEntryObject);
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
          response.data.value[column] = this.dateUtils.formatDate(response.data.value[column], dataTableEntryObject.dateFormat);
        });
        dataTableEntryObject = { ...response.data.value, ...dataTableEntryObject };
        this.loansService.editLoanDatatableEntry(this.loanId, this.datatableName, dataTableEntryObject).subscribe(() => {
          this.loansService.getLoanDatatable(this.loanId, this.datatableName).subscribe((dataObject: any) => {
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
        this.loansService.deleteDatatableContent(this.loanId, this.datatableName)
          .subscribe(() => {
            this.loansService.getLoanDatatable(this.loanId, this.datatableName).subscribe((dataObject: any) => {
              this.dataObject = dataObject;
            });
          });
      }
    });
  }

}
