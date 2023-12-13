/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import * as _ from 'lodash';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';

/** Dialog Imports */
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';

/** Custom Services */
import { TasksService } from '../../tasks.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'mifosx-reschedule-loan',
  templateUrl: './reschedule-loan.component.html',
  styleUrls: ['./reschedule-loan.component.scss']
})
export class RescheduleLoanComponent implements OnInit {

  /** Loans Data */
  loans: any;
  /** Datasource */
  dataSource: MatTableDataSource<any>;
  /** Rows Selection Data */
  selection: SelectionModel<any>;
  /** Batch Requests */
  batchRequests: any[];
  /** Displayed Columns */
  displayedColumns: string[] = ['select', 'client', 'rescheduleRequestNo', 'loanAccountNo', 'rescheduleForm', 'rescheduleReason'];

  /**
   * Retrieves the reschedule loan data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Dialog} dialog MatDialog.
   * @param {Dates} dateUtils Date Utils.
   * @param {router} router Router.
   * @param {SettingsService} settingsService Settings Service.
   * @param {TasksService} tasksService Tasks Service.
   */
  constructor(private route: ActivatedRoute,
    private dialog: MatDialog,
    private dateUtils: Dates,
    private router: Router,
    private settingsService: SettingsService,
    private translateService: TranslateService,
    private tasksService: TasksService) {
    this.route.data.subscribe((data: { recheduleLoansData: any }) => {
      this.loans = data.recheduleLoansData;
      this.dataSource = new MatTableDataSource(this.loans);
      this.selection = new SelectionModel(true, []);
    });
  }

  ngOnInit() {
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

  bulkLoanReschedule(action: string) {
    const rescheduleLoanDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { heading: this.translateService.instant('labels.heading.Reschedule Loan'), dialogContext: this.translateService.instant('labels.dialogContext.Are you sure you want to') + action + this.translateService.instant('labels.dialogContext.the Reschedule Loan') }
    });
    rescheduleLoanDialogRef.afterClosed().subscribe((response: { confirm: any }) => {
      if (response.confirm) {
        this.bulkLoanRescheduleRequest(action.toLowerCase());
      }
    });
  }

  bulkLoanRescheduleRequest(command: string) {
    const dateFormat = this.settingsService.dateFormat;
    const transactionDate = this.dateUtils.formatDate(this.settingsService.businessDate, dateFormat);
    const locale = this.settingsService.language.code;
    const formData = {
      dateFormat,
      locale
    };
    if (command === 'approve') {
      formData['approvedOnDate'] = transactionDate;
    } else {
      formData['rejectedOnDate'] = transactionDate;
    }
    const listSelectedAccounts = this.selection.selected;
    this.batchRequests = [];
    let reqId = 1;
    listSelectedAccounts.forEach((element: any) => {
      const url = 'rescheduleloans/' + element.id + '?command=' + command;
      const bodyData = JSON.stringify(formData);
      const batchData = { requestId: reqId++, relativeUrl: url, method: 'POST', body: bodyData };
      this.batchRequests.push(batchData);
    });
    this.tasksService.submitBatchData(this.batchRequests).subscribe((response: any) => {
      this.reload();
    });
  }

  applyFilter(filterValue: string = '') {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Refetches data fot the component
   * TODO: Replace by a custom reload component instead of hard-coded back-routing.
   */
  reload() {
    const url: string = this.router.url;
    this.router.navigateByUrl(`/checker-inbox-and-tasks`, { skipLocationChange: true })
      .then(() => this.router.navigate([url]));
  }

}
