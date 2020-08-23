/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { DatePipe } from '@angular/common';
import * as _ from 'lodash';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';

/** Dialog Imports */
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';

/** Custom Services */
import { TasksService } from '../../tasks.service';
import { SettingsService } from 'app/settings/settings.service';

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
   * @param {DatePipe} datePipe Date Pipe.
   * @param {router} router Router.
   * @param {SettingsService} settingsService Settings Service.
   * @param {TasksService} tasksService Tasks Service.
   */
  constructor(private route: ActivatedRoute,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private router: Router,
    private settingsService: SettingsService,
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

  approveBulkLoanReschedule() {
    const rescheduleLoanDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { heading: 'Reschedule Loan', dialogContext: 'Are you sure you want to Reschedule Loan' }
    });
    rescheduleLoanDialogRef.afterClosed().subscribe((response: { confirm: any }) => {
      if (response.confirm) {
        this.bulkLoanRescheduleApproval();
      }
    });
  }

  bulkLoanRescheduleApproval() {
    const dateFormat = this.settingsService.dateFormat;
    const approvedOnDate = this.datePipe.transform(new Date(), dateFormat);
    const locale = this.settingsService.language.code;
    const formData = {
      dateFormat,
      approvedOnDate,
      locale
    };
    const listSelectedAccounts = this.selection.selected;
    this.batchRequests = [];
    let reqId = 1;
    listSelectedAccounts.forEach((element: any) => {
      const url = 'rescheduleloans/' + element.id + '?command=approve';
      const bodyData = JSON.stringify(formData);
      const batchData = { requestId: reqId++, relativeUrl: url, method: 'POST', body: bodyData };
      this.batchRequests.push(batchData);
    });
    this.tasksService.submitBatchData(this.batchRequests).subscribe((response: any) => {
      console.log(response);
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
