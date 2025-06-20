import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import {
  MatTableDataSource,
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow
} from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LoansService } from 'app/loans/loans.service';
import { ErrorDialogComponent } from 'app/shared/error-dialog/error-dialog.component';
import { SystemService } from 'app/system/system.service';
import { TasksService } from 'app/tasks/tasks.service';
import { MatButton, MatIconButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatTooltip } from '@angular/material/tooltip';
import { DatetimeFormatPipe } from '../../../../pipes/datetime-format.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-loan-locked',
  templateUrl: './loan-locked.component.html',
  styleUrls: ['./loan-locked.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCheckbox,
    MatCellDef,
    MatCell,
    MatIconButton,
    MatTooltip,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator,
    DatetimeFormatPipe
  ]
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
  displayedColumns: string[] = [
    'select',
    'loanId',
    'lockPlacedOn',
    'lockOwner',
    'error',
    'details'
  ];

  /** Paginator for the table */
  @ViewChild(MatPaginator, { static: false })
  set paginator(value: MatPaginator) {
    if (this.dataSource != null) {
      this.dataSource.paginator = value;
    }
  }

  currentPage = 0;
  itemsToRead = 5000;
  pageSize = 100;
  /** Control for enable/disable button */
  allowRunInlineJob = false;
  /** Const for the jobName */
  jobName: String = 'LOAN_COB';

  showPaginator = false;

  /**
   * @param {LoansService} loansService Loans Service
   * @param {Router} router Router for navigation.
   * @param {MatDialog} dialog Dialog reference.
   * @param {TranslateService} translateService Translate Service.
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loansService: LoansService,
    private systemService: SystemService,
    private tasksService: TasksService,
    private dialog: MatDialog,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.allowRunInlineJob = false;
    this.getLoansLocked(0);
  }

  applyFilter(filterValue: string = '') {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  changePaging(e: any) {
    this.pageSize = e.pageSize;
    if (this.currentPage !== e.pageIndex) {
      this.currentPage = e.pageIndex;
    }
  }

  getLoansLocked(page: number) {
    this.tasksService.getAllLoansLocked(page, this.itemsToRead).subscribe((data: any) => {
      this.loans = data.content;
      this.dataSource = new MatTableDataSource(this.loans);
      this.dataSource.paginator = this.paginator;
      this.showPaginator = this.loans.length > this.pageSize;
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
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row: any) => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? this.translateService.instant('labels.text.select') : this.translateService.instant('labels.text.deselect')} ${this.translateService.instant('labels.text.All')}`;
    }
    return `${this.selection.isSelected(row) ? this.translateService.instant('labels.text.deselect') : this.translateService.instant('labels.text.select')} ${this.translateService.instant('labels.text.row')} ${row.position + 1}`;
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
