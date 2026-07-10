import { AfterViewInit, Directive, OnDestroy, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatSort } from '@angular/material/sort';
import { forkJoin, merge, of, Subscription } from 'rxjs';
import { finalize, startWith, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { SettingsService } from 'app/settings/settings.service';
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';
import { TasksService } from '../tasks.service';
import { ClientDetailsDialogComponent } from '../check-inbox-dialog/client-details-dialog/client-details-dialog.component';
import { Dates } from 'app/core/utils/dates';

@Directive()
export abstract class BaseCheckerInboxComponent implements OnDestroy, AfterViewInit {
  searchData: any[] = [];
  noSearchedData = false;
  checkerData = false;
  makerCheckerSearchForm!: UntypedFormGroup;
  dataSource = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []);
  pageSize = 10;
  pageIndex = 0;
  totalElements = 0;
  displayedColumns: string[] = [
    'select',
    'updatedOnDate',
    'clientName',
    'clientAccountNo',
    'clientOfficeHierarchyPath',
    'action'
  ];

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;
  @ViewChild('includeOUPath', { static: false }) includeOUPath!: MatCheckbox;

  private _listSub?: Subscription;

  constructor(
    protected dialog: MatDialog,
    protected router: Router,
    protected formBuilder: UntypedFormBuilder,
    protected tasksService: TasksService,
    protected settingsService: SettingsService,
    protected dateUtils: Dates
  ) { }

  ngAfterViewInit() {
    if (!this.sort || !this.paginator) return;
    const includeOUChange$ = this.includeOUPath ? this.includeOUPath.change : of({});
    this._listSub = merge(
      this.sort.sortChange.pipe(tap(() => (this.paginator.pageIndex = 0))),
      this.paginator.page,
      includeOUChange$
    )
      .pipe(
        startWith({}),
        tap(() => this.loadCheckerData())
      )
      .subscribe();
  }

  ngOnDestroy() {
    this._listSub?.unsubscribe();
  }

  abstract createMakerCheckerSearchForm(): void;

  loadCheckerData() {
    const cleanForm = Object.entries(this.makerCheckerSearchForm.value)
      .filter(([_, v]) => v !== '' && v != null)
      .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});

    const pageIndex = this.paginator ? this.paginator.pageIndex : this.pageIndex;
    const pageSize = this.paginator ? this.paginator.pageSize : this.pageSize;
    const dateFormat = "dd MMMM yyyy";

    const countryId = this.settingsService.getSelectedCountry()?.id;

    const params = {
      ...cleanForm,
      offset: pageIndex * pageSize,
      limit: pageSize,
      sortBy: this.sort?.active || undefined,
      sortOrder: this.sort?.direction || undefined,
      includeClientHierarchyPath: this.includeOUPath ? this.includeOUPath.checked : true,
      dateFrom: this.dateUtils.formatDate(this.makerCheckerSearchForm.value.dateFrom, dateFormat),
      dateTo: this.dateUtils.formatDate(this.makerCheckerSearchForm.value.dateTo, dateFormat),
      ...(countryId ? { countryId } : {})
    };

    this.tasksService.getClientKYCApprovals(params)
      .pipe(
        finalize(() => {
          this.selection.clear();
        })
      )
      .subscribe({
        next: (response: any) => {
          this.searchData = response?.pageItems || response || [];
          this.totalElements = response?.totalFilteredRecords ?? this.searchData.length;
          this.noSearchedData = this.searchData.length === 0;
          this.dataSource.data = this.searchData;
        },
        error: (err) => {
          console.error('Error fetching client KYC approvals:', err);
          this.noSearchedData = true;
          this.dataSource.data = [];
        }
      });

  }

  search() {
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }

    if (this.sort) {
      this.sort.active = '';
    }
    this.loadCheckerData();
  }

  viewClient(clientId: string) {
    const dialogRef = this.dialog.open(ClientDetailsDialogComponent, { data: { clientId } });
    dialogRef.afterClosed().subscribe(result => result === 'confirmed' && this.refreshCurrentResults());
  }

  approveChecker() {
    this.confirmAndRun('Approve entry', 'Are you sure you want to approve entry?', 'verify');
  }


  confirmAndRun(title: string, message: string, action: string) {
    const ref = this.dialog.open(ConfirmationDialogComponent, {
      data: { heading: title, dialogContext: message },
    });
    ref.afterClosed().subscribe((res: { confirm: boolean }) => res.confirm && this.bulkCheckerApproveorReject(action));
  }

  bulkCheckerApproveorReject(action: string) {
    const selected = this.selection.selected;
    if (selected.length === 0) return;
    const requests = selected.map(el =>
      this.tasksService.executeClientKYCAction(el.clientId, action)
    );
    forkJoin(requests).subscribe({
      next: () => this.refreshCurrentResults(),
      error: (err) => console.error('Bulk Approve maker checker action failed:', err)
    });
  }

  private refreshCurrentResults() {
    this.loadCheckerData();
  }

  applyFilter(filterValue: string = '') {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  reload() {
    const url = this.router.url;
    this.router.navigateByUrl(`/checker-inbox-and-tasks`, { skipLocationChange: true })
      .then(() => this.router.navigate([url]));
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    return numSelected === this.dataSource.data.length;
  }

  masterToggle(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      for (const row of this.dataSource.data) {
        this.selection.select(row);
      }
    }
  }


  checkboxLabel(row?: any): string {
    if (row) {
      const action = this.selection.isSelected(row) ? 'deselect' : 'select';
      return `${action} row`;
    }

    const action = this.isAllSelected() ? 'deselect' : 'select';
    return `${action} all`;
  }


}
