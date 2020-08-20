/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';

/** Custom Services */
import { TasksService } from '../../tasks.service';
import { SettingsService } from 'app/settings/settings.service';

/** Dialog Components */
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'mifosx-checker-inbox',
  templateUrl: './checker-inbox.component.html',
  styleUrls: ['./checker-inbox.component.scss']
})
export class CheckerInboxComponent implements OnInit {

  /** Data to be displayed */
  searchData: any;
  /** Maker Checker Template */
  makerCheckerTemplate: any;
  /** Checks if there is any data based on the search */
  noSearchedData = false;
  /** Checks if there is any checker data */
  checkerData = false;
  /** Maker Checker Search Form */
  makerCheckerSearchForm: FormGroup;
  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date(2100, 0, 1);
  /** DataSource */
  dataSource: MatTableDataSource<any>;
  /** Selecting rows from table */
  selection: SelectionModel<any>;
  /** Displayed Column in table */
  displayedColumns: string[] = ['select', 'id', 'madeOnDate', 'status', 'user', 'action', 'entity'];

  /**
   * Retrieves the maker checker data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Dialog} dialog MatDialog.
   * @param {DatePipe} datePipe Date Pipe.
   * @param {router} router Router.
   * @param {SettingsService} settingsService Settings Service.
   * @param {TasksService} tasksService Tasks Service.
   * @param {FormBuilder} formBuilder Form Builder.
   */
  constructor(private route: ActivatedRoute,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private router: Router,
    private tasksService: TasksService,
    private settingsService: SettingsService,
    private formBuilder: FormBuilder) {
    this.route.data.subscribe((data: { makerCheckerResource: any, makerCheckerTemplate: any }) => {
      this.searchData = data.makerCheckerResource;
      if (this.searchData.length > 0) {
        this.checkerData = true;
      }
      this.makerCheckerTemplate = data.makerCheckerTemplate;
      this.dataSource = new MatTableDataSource(this.searchData);
      this.selection = new SelectionModel(true, []);
    });
  }

  ngOnInit() {
    this.createMakerCheckerSearchForm();
  }

  /**
   * Creates the standing instruction form.
   */
  createMakerCheckerSearchForm() {
    this.makerCheckerSearchForm = this.formBuilder.group({
      'makerDateTimeFrom': [''],
      'makerDateTimeto': [''],
      'actionName': [''],
      'entityName': [''],
      'resourceId': ['']
    });
  }

  search() {
    const dateFormat = this.settingsService.dateFormat;
    const makerCheckerSearchParams = {
      ...this.makerCheckerSearchForm.value,
      makerDateTimeFrom: this.datePipe.transform(this.makerCheckerSearchForm.value.makerDateTimeFrom, dateFormat),
      makerDateTimeto: this.datePipe.transform(this.makerCheckerSearchForm.value.makerDateTimeto, dateFormat)
    };
    this.tasksService.getMakerCheckerData(makerCheckerSearchParams).subscribe((response: any) => {
      this.searchData = response;
      if (this.searchData.length === 0) {
        this.noSearchedData = true;
      } else {
        this.noSearchedData = false;
      }
      this.dataSource = new MatTableDataSource(this.searchData);
      this.selection = new SelectionModel(true, []);
    });
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach((row: any) => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  approveChecker() {
    const approveCheckerDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { heading: 'Approve Checker', dialogContext: 'Are you sure you want to approve checker' }
    });
    approveCheckerDialogRef.afterClosed().subscribe((response: { confirm: any }) => {
      if (response.confirm) {
        this.bulkCheckerApproveorReject('approve');
      }
    });
  }

  rejectChecker() {
    const rejectCheckerDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { heading: 'Reject Checker', dialogContext: 'Are you sure you want to reject checker' }
    });
    rejectCheckerDialogRef.afterClosed().subscribe((response: { confirm: any }) => {
      if (response.confirm) {
        this.bulkCheckerApproveorReject('reject');
      }
    });
  }

  deleteChecker() {
    const deleteCheckerDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { heading: 'Delete Checker', dialogContext: 'Are you sure you want to delete checker' }
    });
    deleteCheckerDialogRef.afterClosed().subscribe((response: { confirm: any }) => {
      if (response.confirm) {
        this.bulkDeleteChecker();
      }
    });
  }

  bulkCheckerApproveorReject(action: any) {
    const selectedAccounts = this.selection.selected.length;
    const listSelectedAccounts = this.selection.selected;
    let approvedAccounts = 0;
    listSelectedAccounts.forEach((element: any) => {
      this.tasksService.executeMakerCheckerAction(element.id, action).subscribe((response: any) => {
        approvedAccounts++;
        if (selectedAccounts === approvedAccounts) {
          this.reload();
        }
      });
    });
  }

  bulkDeleteChecker() {
    const selectedAccounts = this.selection.selected.length;
    const listSelectedAccounts = this.selection.selected;
    let approvedAccounts = 0;
    listSelectedAccounts.forEach((element: any) => {
      this.tasksService.deleteMakerChecker(element.id).subscribe((response: any) => {
        approvedAccounts++;
        if (selectedAccounts === approvedAccounts) {
          this.reload();
        }
      });
    });
  }

  applyFilter(filterValue: string = '') {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Refetches data for the component
   * TODO: Replace by a custom reload component instead of hard-coded back-routing.
   */
  reload() {
    const url: string = this.router.url;
    this.router.navigateByUrl(`/checker-inbox-and-tasks`, { skipLocationChange: true })
      .then(() => this.router.navigate([url]));
  }

}
