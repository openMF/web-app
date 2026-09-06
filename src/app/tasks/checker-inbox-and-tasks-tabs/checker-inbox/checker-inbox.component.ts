/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, OnInit, inject, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
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
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ClientsService } from 'app/clients/clients.service';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  from,
  map,
  mergeMap,
  Observable,
  of,
  switchMap,
  toArray
} from 'rxjs';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { environment } from 'environments/environment';

/** Custom Services */
import { TasksService } from '../../tasks.service';
import { SettingsService } from 'app/settings/settings.service';

/** Dialog Components */
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';
import { Dates } from 'app/core/utils/dates';
import { TranslateService } from '@ngx-translate/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatCheckbox } from '@angular/material/checkbox';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

interface MakerCheckerRecord {
  id: number;
  actionName: string;
  entityName: string;
  madeOnDate?: string;
  processingResult?: string;
  maker?: string;
}

interface BulkActionFailure {
  id: number;
  error?: string;
}

interface BulkActionResult {
  action: string;
  succeeded: number;
  failed: BulkActionFailure[];
}

type BulkActionOutcome =
  { item: MakerCheckerRecord; success: true } | { item: MakerCheckerRecord; success: false; error: unknown };

@Component({
  selector: 'mifosx-checker-inbox',
  templateUrl: './checker-inbox.component.html',
  styleUrls: ['./checker-inbox.component.scss'],
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
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    DateFormatPipe,
    MatIcon,
    MatAutocompleteModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckerInboxComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private dateUtils = inject(Dates);
  private translateService = inject(TranslateService);
  private tasksService = inject(TasksService);
  private settingsService = inject(SettingsService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private clientsService = inject(ClientsService);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private authenticationService = inject(AuthenticationService);

  /** Data to be displayed */
  searchData: MakerCheckerRecord[];
  /** Maker Checker Template */
  makerCheckerTemplate: any;
  /** Checks if there is any data based on the search */
  noSearchedData = false;
  /** Checks if there is any checker data */
  checkerData = false;
  /** Request and action state. */
  loading = false;
  searchError = false;
  processing = false;
  processingCount = 0;
  actionResult: BulkActionResult | null = null;
  private searchRequestId = 0;
  /** Show/hide advanced search form */
  showAdvancedSearch = false;
  /** Maker Checker Search Form */
  makerCheckerSearchForm: FormGroup;
  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date(2100, 0, 1);
  /** DataSource */
  dataSource: MatTableDataSource<MakerCheckerRecord>;
  /** Selecting rows from table */
  selection: SelectionModel<MakerCheckerRecord>;
  /** Customer search is backed by the clients endpoint; maker-checkers receives only the selected ID. */
  customerControl = new FormControl<string | any>('');
  customers: any[] = [];
  /** Displayed Column in table */
  displayedColumns: string[] = [
    'select',
    'id',
    'madeOnDate',
    'status',
    'user',
    'action',
    'entity'
  ];

  /**
   * Retrieves the maker checker data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Dialog} dialog MatDialog.
   * @param {Dates} dateUtils Date Utils.
   * @param {router} router Router.
   * @param {SettingsService} settingsService Settings Service.
   * @param {TasksService} tasksService Tasks Service.
   * @param {FormBuilder} formBuilder Form Builder.
   */
  constructor() {
    this.route.data
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: { makerCheckerResource: MakerCheckerRecord[]; makerCheckerTemplate: any }) => {
        this.searchData = data.makerCheckerResource || [];
        this.checkerData = this.searchData.length > 0;
        this.makerCheckerTemplate = data.makerCheckerTemplate;
        this.dataSource = new MatTableDataSource(this.searchData);
        this.selection = new SelectionModel(true, []);
      });
  }

  ngOnInit() {
    this.createMakerCheckerSearchForm();
    this.customerControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((value: string | any) => this.searchCustomers(value)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((customers) => {
        this.customers = customers;
        this.changeDetectorRef.markForCheck();
      });
  }

  /**
   * Creates the standing instruction form.
   */
  createMakerCheckerSearchForm() {
    this.makerCheckerSearchForm = this.formBuilder.group({
      makerDateTimeFrom: [''],
      makerDateTimeTo: [''],
      actionName: [''],
      entityName: [''],
      resourceId: ['']
    });
  }

  /**
   * Toggle advanced search form visibility.
   */
  toggleAdvancedSearch() {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }

  search() {
    this.loadMakerCheckers();
  }

  private loadMakerCheckers(): void {
    const requestId = ++this.searchRequestId;
    const dateFormat = this.settingsService.dateFormat;
    const selectedCustomer = this.customerControl.value;
    const makerCheckerSearchParams = {
      ...this.makerCheckerSearchForm.value,
      makerDateTimeFrom: this.dateUtils.formatDate(this.makerCheckerSearchForm.value.makerDateTimeFrom, dateFormat),
      makerDateTimeTo: this.dateUtils.formatDate(this.makerCheckerSearchForm.value.makerDateTimeTo, dateFormat),
      clientId: typeof selectedCustomer === 'object' ? selectedCustomer?.id : undefined
    };
    this.loading = true;
    this.searchError = false;
    this.tasksService
      .getMakerCheckerData(makerCheckerSearchParams)
      .pipe(
        finalize(() => {
          if (requestId === this.searchRequestId) this.loading = false;
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe({
        next: (response: MakerCheckerRecord[]) => {
          if (requestId !== this.searchRequestId) return;
          this.searchData = response;
          this.checkerData = this.searchData.length > 0;
          this.noSearchedData = this.searchData.length === 0;
          this.dataSource = new MatTableDataSource(this.searchData);
          this.selection = new SelectionModel(true, []);
        },
        error: () => {
          if (requestId === this.searchRequestId) this.searchError = true;
        }
      });
  }

  private searchCustomers(value: string | any) {
    if (typeof value !== 'string' || value.trim().length < 2) {
      return of([]);
    }
    return this.clientsService.searchByText(value.trim(), 0, 20).pipe(
      map((response: any) => response?.content || []),
      catchError(() => of([]))
    );
  }

  displayCustomer(customer: any): string {
    return typeof customer === 'string' ? customer : customer?.displayName || customer?.accountNumber || '';
  }

  checkerPermission(row: MakerCheckerRecord): string {
    return `${row.actionName}_${row.entityName}_CHECKER`.replace(/[^A-Za-z0-9_]/g, '_').toUpperCase();
  }

  canAction(row: MakerCheckerRecord): boolean {
    if (!environment.productionModeEnableRBAC) return true;
    const permissions = this.authenticationService.getCredentials()?.permissions || [];
    return permissions.includes('ALL_FUNCTIONS') || permissions.includes(this.checkerPermission(row));
  }

  hasActionableRows(): boolean {
    return this.dataSource?.data.some((row) => this.canAction(row)) || false;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.filter((row) => this.canAction(row)).length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.filter((row) => this.canAction(row)).forEach((row) => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'Deselect' : 'Select'} checker item ${row.id}`;
  }

  approveChecker() {
    const approveCheckerDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        heading: this.translateService.instant('labels.heading.Approve Checker'),
        dialogContext:
          this.translateService.instant('labels.dialogContext.Are you sure you want to approve checker') +
          ` (${this.selection.selected.length})`
      }
    });
    approveCheckerDialogRef.afterClosed().subscribe((response: { confirm: any }) => {
      if (response?.confirm && this.selection.hasValue()) {
        this.bulkCheckerApproveorReject('approve');
      }
    });
  }

  rejectChecker() {
    const rejectCheckerDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        heading: this.translateService.instant('labels.heading.Reject Checker'),
        dialogContext:
          this.translateService.instant('labels.dialogContext.Are you sure you want to reject checker') +
          ` (${this.selection.selected.length})`
      }
    });
    rejectCheckerDialogRef.afterClosed().subscribe((response: { confirm: any }) => {
      if (response?.confirm && this.selection.hasValue()) {
        this.bulkCheckerApproveorReject('reject');
      }
    });
  }

  deleteChecker() {
    const deleteCheckerDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        heading: this.translateService.instant('labels.heading.Delete Checker'),
        dialogContext:
          'The selected pending checker item(s) will be removed. Unlike approval or rejection, deletion does not retain equivalent maker-checker audit information.'
      }
    });
    deleteCheckerDialogRef.afterClosed().subscribe((response: { confirm: any }) => {
      if (response?.confirm && this.selection.hasValue()) {
        this.bulkDeleteChecker();
      }
    });
  }

  bulkCheckerApproveorReject(action: string) {
    this.processSelected(action, (item) => this.tasksService.executeMakerCheckerAction(item.id, action));
  }

  bulkDeleteChecker() {
    this.processSelected('delete', (item) => this.tasksService.deleteMakerChecker(item.id));
  }

  private processSelected(action: string, request: (item: MakerCheckerRecord) => Observable<unknown>): void {
    const selected = [...this.selection.selected];
    if (!selected.length || this.processing) return;
    this.processing = true;
    this.actionResult = null;
    this.processingCount = selected.length;
    this.selection.clear();
    from(selected)
      .pipe(
        mergeMap(
          (item) =>
            request(item).pipe(
              map((): BulkActionOutcome => ({ item, success: true })),
              catchError((error: unknown) => of<BulkActionOutcome>({ item, success: false, error }))
            ),
          4
        ),
        toArray(),
        finalize(() => {
          this.processing = false;
          this.processingCount = 0;
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe((results: BulkActionOutcome[]) => {
        const failed = results.filter(this.isFailedOutcome).map((result) => ({
          id: result.item.id,
          error: this.bulkErrorMessage(result.error)
        }));
        this.actionResult = { action, succeeded: results.length - failed.length, failed };
        this.loadMakerCheckers();
      });
  }

  private bulkErrorMessage(error: unknown): string | undefined {
    if (typeof error !== 'object' || error === null) return undefined;
    const response = error as { error?: { defaultUserMessage?: unknown }; message?: unknown };
    if (typeof response.error?.defaultUserMessage === 'string') return response.error.defaultUserMessage;
    return typeof response.message === 'string' ? response.message : undefined;
  }

  private isFailedOutcome(result: BulkActionOutcome): result is Extract<BulkActionOutcome, { success: false }> {
    return !result.success;
  }

  applyFilter(filterValue: string = '') {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Refetches data for the component
   * TODO: Replace by a custom reload component instead of hard-coded back-routing.
   */
  reload() {
    this.loadMakerCheckers();
  }
}
