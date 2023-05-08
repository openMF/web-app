import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { LoansService } from 'app/loans/loans.service';
import { ErrorDialogComponent } from 'app/shared/error-dialog/error-dialog.component';
import { SystemService } from 'app/system/system.service';
import { TasksService } from 'app/tasks/tasks.service';

@Component({
  selector: 'mifosx-loan-locked',
  templateUrl: './loan-locked.component.html',
  styleUrls: ['./loan-locked.component.scss']
})
export class LoanLockedComponent implements OnInit {

  /** Loans Data */
  loans: any[] = [];
  /** Batch Requests */
  batchRequests: any[];
  /** Datasource for loans disbursal table */
  dataSource: MatTableDataSource<any>;
  /** Row Selection */
  selection: SelectionModel<any>;
  /** Displayed Columns for loan disbursal data */
  displayedColumns: string[] = ['select', 'loanId', 'lockPlacedOn', 'lockOwner', 'error', 'details'];
  /** Paginator for the table */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  currentPage = 0;
  pageSize = 10;
  /** Control for enable/disable button */
  allowRunInlineJob = false;
  /** Const for the jobName */
  jobName: String = 'LOAN_COB';

  /**
   * @param {LoansService} loansService Loans Service
   * @param {Router} router Router for navigation.
   * @param {MatDialog} dialog Dialog reference.
   */
  constructor(private route: ActivatedRoute,
    private router: Router,
    private loansService: LoansService,
    private systemService: SystemService,
    private tasksService: TasksService,
    private dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.loans);
    this.dataSource.paginator = this.paginator;
    this.selection = new SelectionModel(true, []);
    this.allowRunInlineJob = false;
    this.getLoansLocked(this.currentPage);
  }

  applyFilter(filterValue: string = '') {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  handlePage(e: any) {
    if (this.currentPage !== e.pageIndex) {
      this.currentPage = e.pageIndex;
      this.pageSize = e.pageSize;
      this.getLoansLocked(this.currentPage);
    }
  }

  getLoansLocked(page: number) {
    this.tasksService.getAllLoansLocked(page, this.pageSize).subscribe((data: any) => {
      this.loans = data.content;
      this.dataSource = new MatTableDataSource(this.loans);
      this.allowRunInlineJob = false;
      this.selection = new SelectionModel(true, []);
    });
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    if (numSelected === 0) {
      this.allowRunInlineJob = false;
    } else {
      this.allowRunInlineJob = true;
    }
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

  showDetails(loan: any) {
    this.dialog.open(ErrorDialogComponent, {
      width: '960px',
      height: '400px',
      data: '<pre><code>' + loan.stacktrace + '</code></pre>'
    });
  }

  viewLoanAccount(loan: any) {
    const loanId = loan.loanId;
    this.loansService.getLoanAccountDetails(loanId).subscribe((loanData: any) => {
      const clientId = loanData.clientId;
      this.router.navigateByUrl(`/clients/${clientId}/loans-accounts/${loanId}/general`);
    });
  }

  runInlineCOB(): void {
    const loanIds: any = [];
    this.selection.selected.forEach((row: any) => {
      loanIds.push(row.loanId);
    });
    if (loanIds.length > 0) {
      const payload = {
        loanIds: loanIds
      };
      this.systemService.runInlineCOB(this.jobName, payload).subscribe((data: any) => {
        this.getLoansLocked(0);
      });
    }
  }

}
