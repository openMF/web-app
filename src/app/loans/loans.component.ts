/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  LOCALE_ID,
  OnInit,
  inject
} from '@angular/core';
import { formatCurrency, formatNumber, getCurrencySymbol } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatPrefix } from '@angular/material/form-field';
import { CdkDropList, CdkDrag, CdkDragHandle, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

/** rxjs Imports */
import { Subject, from, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, mergeMap } from 'rxjs/operators';

/** Translation Imports */
import { TranslateService } from '@ngx-translate/core';

/** Third-party Imports */
import * as ExcelJS from 'exceljs';

/** Custom Services */
import { LoansService } from './loans.service';
import { AccountNumberComponent } from '../shared/account-number/account-number.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { nameInitials } from 'app/core/utils/name-initials';
import { Dates } from 'app/core/utils/dates';
import { sanitizeCsvValue } from 'app/core/utils/csv.utils';
import { SettingsService } from 'app/settings/settings.service';

type Severity = 'active' | 'arrears' | 'pending' | 'closed' | 'rejected' | 'neutral';
type SortDirection = '' | 'asc' | 'desc';

/**
 * A column the list can display. Core columns have bespoke cell markup in the
 * template; standard and datatable columns render a precomputed text cell.
 */
interface ColumnDef {
  /** Stable id, also the persisted token: core key, `std:<key>`, or `dt:<table>:<column>`. */
  id: string;
  /** Translate key for core/standard columns, raw display text for datatable columns. */
  label: string;
  translate: boolean;
  kind: 'core' | 'std' | 'dt';
  /** Minimum grid track width in px; the row scrolls horizontally once mins no longer fit. */
  min: number;
  /** fr share of the leftover space. */
  grow: number;
  /** Render the cell in the monospace numeric style. */
  mono?: boolean;
  /** Display text for standard columns. */
  text?: (loan: any) => string;
  /** Sort key for standard columns; falls back to lowercased text when omitted. */
  raw?: (loan: any) => string | number;
  /** Datatable columns: source table, column, Fineract display type, and code lookups. */
  dtTable?: string;
  dtColumn?: string;
  dtType?: string;
  codeValues?: Map<number, string>;
}

/** One registered loan datatable, reduced to what the column picker needs. */
interface LoanDatatableMeta {
  name: string;
  label: string;
  columns: {
    name: string;
    label: string;
    type: string;
    codeValues?: Map<number, string>;
  }[];
}

/** The kind of control an ad-hoc filter row renders, chosen from the field's ColumnDef. */
type FilterType = 'text' | 'number' | 'date' | 'boolean' | 'select';

/**
 * One user-added filter in the right-hand panel, beyond the three always-on defaults
 * (office, loan product, show-closed). Freshly added with every bound left empty, which
 * is deliberately a no-op match — adding a filter never hides rows until it's configured.
 */
interface ActiveFilter {
  uid: number;
  /** ColumnDef id this filter targets — resolved back via LoansComponent.resolveColumnDef. */
  columnId: string;
  /** Resolved once at add-time so the panel doesn't re-translate on every render. */
  label: string;
  type: FilterType;
  text: string;
  numberMin: number | null;
  numberMax: number | null;
  dateFrom: string | null;
  dateTo: string | null;
  boolValue: '' | 'true' | 'false';
  /** 'select' only: the field's code-lookup values, resolved once at add-time. */
  selectOptions: string[];
  selectValues: Set<string>;
}

/** First page is small for a fast first paint; the remaining pages are fetched in parallel behind it. */
const FIRST_CHUNK = 100;
const NEXT_CHUNK = 500;
/** Cap on concurrent /loans requests during the background load, to avoid overwhelming the backend. */
const MAX_PARALLEL_REQUESTS = 6;

/** Page size and safety cap for the bulk datatable reads behind custom-table columns. */
const DATATABLE_PAGE_SIZE = 500;
const DATATABLE_MAX_PAGES = 40;

const COLUMNS_STORAGE_KEY = 'mifosXLoansListColumns';
/** Borrower is never in this list — it's structural, always shown first, not part of the picker. */
const DEFAULT_COLUMN_IDS = [
  'status',
  'accountNo',
  'principal',
  'product'
];

/** 'accrued_interest_all' / 'AccruedInterestAll' → 'Accrued Interest All'. */
function humanizeName(name: string): string {
  return name
    .replace(/_cd_.*$/, '')
    .replace(/[_\s]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .trim()
    .replace(/\b[a-z]/g, (char) => char.toUpperCase());
}

/**
 * Loans list component.
 *
 * Loans are loaded progressively (first chunk fast, the rest in the background), and
 * search, status filtering, sorting, and pagination all run on the client, so they
 * cover every loan rather than just one server page.
 *
 * Displayed columns are user-configurable (cog button in the toolbar) and persisted in
 * localStorage. Besides the built-in loan fields, columns from any datatable registered
 * against m_loan can be shown; each such table is bulk-loaded once via the datatable
 * advanced query API and joined to the rows client-side by loan id.
 */
@Component({
  selector: 'mifosx-loans',
  templateUrl: './loans.component.html',
  styleUrls: ['./loans.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatProgressBar,
    MatSlideToggle,
    MatIcon,
    MatIconButton,
    MatPrefix,
    AccountNumberComponent,
    CdkDropList,
    CdkDrag,
    CdkDragHandle
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'onEscapeKey()' }
})
export class LoansComponent implements OnInit {
  private loansService = inject(LoansService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);
  private dateUtils = inject(Dates);
  private settingsService = inject(SettingsService);
  private translateService = inject(TranslateService);
  private locale = inject(LOCALE_ID);

  /**
   * Loaded pages keyed by their request offset. Chunks are fetched in parallel and can
   * arrive out of order, so the flat list is rebuilt in offset order to keep row order
   * deterministic run-to-run.
   */
  private chunks = new Map<number, any[]>();
  /** Full loan set loaded so far, flattened from `chunks` (all client-side operations run against this). */
  private allLoans: any[] = [];
  /** Result of the current filter + sort, cached so page navigation only re-slices. */
  private viewRows: any[] = [];
  /** Loans on the current page after filtering and sorting. */
  pagedLoans: any[] = [];

  /** Row count after the closed-accounts filter and search — drives the pager and badge. */
  totalRows = 0;

  /** True while loans are still streaming in from the server. */
  isLoading = false;

  /** True while the current view is being written out to an .xlsx file. */
  exporting = false;

  pageSize = 50;
  pageSizeOptions = [
    25,
    50,
    100,
    200
  ];
  currentPage = 0;

  filterText = '';
  showClosedAccounts = false;
  sortColumn = '';
  sortDirection: SortDirection = '';

  /** Structural: always shown, always first, never part of the picker or the reorder list. */
  private readonly borrowerColumn: ColumnDef = {
    id: 'borrower',
    label: 'labels.inputs.Borrower',
    translate: true,
    kind: 'core',
    min: 200,
    grow: 2
  };

  /** The four other built-in columns. */
  private readonly coreColumns: ColumnDef[] = [
    { id: 'status', label: 'labels.inputs.Status', translate: true, kind: 'core', min: 125, grow: 1 },
    { id: 'accountNo', label: 'labels.inputs.Loan Account', translate: true, kind: 'core', min: 115, grow: 1 },
    { id: 'principal', label: 'labels.inputs.Principal', translate: true, kind: 'core', min: 110, grow: 1 },
    { id: 'product', label: 'labels.inputs.Loan Product', translate: true, kind: 'core', min: 140, grow: 1.2 }
  ];

  /** Optional loan fields, all derivable from the /loans list response already loaded. */
  private readonly stdColumns: ColumnDef[] = [
    {
      id: 'std:externalId',
      label: 'labels.inputs.External Id',
      translate: true,
      kind: 'std',
      min: 115,
      grow: 1,
      mono: true,
      text: (loan) => this.externalIdText(loan)
    },
    {
      id: 'std:office',
      label: 'labels.inputs.Office',
      translate: true,
      kind: 'std',
      min: 130,
      grow: 1,
      text: (loan) => this.officeNameById.get(loan._officeId) ?? ''
    },
    {
      id: 'std:loanOfficer',
      label: 'labels.inputs.Loan Officer',
      translate: true,
      kind: 'std',
      min: 130,
      grow: 1,
      text: (loan) => loan.loanOfficerName ?? ''
    },
    {
      id: 'std:interestRate',
      label: 'labels.inputs.Interest Rate',
      translate: true,
      kind: 'std',
      min: 95,
      grow: 0.6,
      mono: true,
      raw: (loan) => this.numberOrNaN(loan.annualInterestRate ?? loan.interestRatePerPeriod),
      text: (loan) => this.percentText(loan.annualInterestRate ?? loan.interestRatePerPeriod)
    },
    {
      id: 'std:numberOfRepayments',
      label: 'labels.inputs.Number of Repayments',
      translate: true,
      kind: 'std',
      min: 90,
      grow: 0.6,
      mono: true,
      raw: (loan) => this.numberOrNaN(loan.numberOfRepayments),
      text: (loan) => (loan.numberOfRepayments ?? '') + ''
    },
    {
      id: 'std:disbursedDate',
      label: 'labels.inputs.Disbursement Date',
      translate: true,
      kind: 'std',
      min: 110,
      grow: 0.8,
      mono: true,
      raw: (loan) => this.dateSortKey(loan.timeline?.actualDisbursementDate ?? loan.timeline?.expectedDisbursementDate),
      text: (loan) => this.dateText(loan.timeline?.actualDisbursementDate ?? loan.timeline?.expectedDisbursementDate)
    },
    {
      id: 'std:maturityDate',
      label: 'labels.inputs.Maturity Date',
      translate: true,
      kind: 'std',
      min: 110,
      grow: 0.8,
      mono: true,
      raw: (loan) => this.dateSortKey(loan.timeline?.actualMaturityDate ?? loan.timeline?.expectedMaturityDate),
      text: (loan) => this.dateText(loan.timeline?.actualMaturityDate ?? loan.timeline?.expectedMaturityDate)
    },
    {
      id: 'std:submittedDate',
      label: 'labels.inputs.Submitted On Date',
      translate: true,
      kind: 'std',
      min: 110,
      grow: 0.8,
      mono: true,
      raw: (loan) => this.dateSortKey(loan.timeline?.submittedOnDate),
      text: (loan) => this.dateText(loan.timeline?.submittedOnDate)
    },
    {
      id: 'std:closedDate',
      label: 'labels.inputs.Closed Date',
      translate: true,
      kind: 'std',
      min: 110,
      grow: 0.8,
      mono: true,
      raw: (loan) => this.dateSortKey(loan.timeline?.closedOnDate),
      text: (loan) => this.dateText(loan.timeline?.closedOnDate)
    },
    {
      id: 'std:principalOutstanding',
      label: 'labels.inputs.Principal Outstanding',
      translate: true,
      kind: 'std',
      min: 125,
      grow: 1,
      mono: true,
      raw: (loan) => this.numberOrNaN(loan.summary?.principalOutstanding),
      text: (loan) => this.moneyText(loan, loan.summary?.principalOutstanding)
    },
    {
      id: 'std:totalOutstanding',
      label: 'labels.inputs.Total Outstanding',
      translate: true,
      kind: 'std',
      min: 125,
      grow: 1,
      mono: true,
      raw: (loan) => this.numberOrNaN(loan.summary?.totalOutstanding),
      text: (loan) => this.moneyText(loan, loan.summary?.totalOutstanding)
    },
    {
      id: 'std:totalOverdue',
      label: 'labels.inputs.Total Overdue',
      translate: true,
      kind: 'std',
      min: 125,
      grow: 1,
      mono: true,
      raw: (loan) => this.numberOrNaN(loan.summary?.totalOverdue),
      text: (loan) => this.moneyText(loan, loan.summary?.totalOverdue)
    },
    {
      id: 'std:inArrears',
      label: 'labels.inputs.In Arrears',
      translate: true,
      kind: 'std',
      min: 85,
      grow: 0.5,
      raw: (loan) => (loan.inArrears ? 1 : 0),
      text: (loan) => this.yesNoText(!!loan.inArrears)
    },
    {
      id: 'std:currency',
      label: 'labels.inputs.Currency',
      translate: true,
      kind: 'std',
      min: 80,
      grow: 0.5,
      mono: true,
      text: (loan) => loan.currency?.code ?? ''
    }
  ];

  /** Ids of the non-borrower columns the user has enabled, in display order; persisted in localStorage. */
  private visibleColumnIds: string[] = [...DEFAULT_COLUMN_IDS];

  /** Ordered columns currently rendered; rebuilt whenever the selection or table metadata changes. */
  visibleColumns: ColumnDef[] = [];
  /** Grid track template shared by the header and every row. */
  gridTemplate = '';
  /** Sum of column minimums — rows narrower than this scroll horizontally instead of collapsing. */
  gridMinWidth = 0;

  columnsPanelOpen = false;

  /** Datatables registered against m_loan; null until first needed (panel open or saved dt column). */
  dtTables: LoanDatatableMeta[] | null = null;
  dtTablesLoading = false;
  dtTablesError = false;

  /** Bulk-loaded datatable rows, keyed table → loan id → row. */
  private dtRows = new Map<string, Map<number, any>>();
  /** Tables currently streaming in. */
  dtLoading = new Set<string>();
  /** Tables whose bulk load failed; re-enabling one of their columns retries. */
  dtFailed = new Set<string>();

  /** Flat office list for the office filter (populated once, independent of loan loading). */
  offices: any[] = [];
  selectedOfficeId: number | null = null;
  private officeNameById = new Map<number, string>();

  /** Basic loan product list for the product filter (populated once, independent of loan loading). */
  loanProducts: any[] = [];
  selectedLoanProductId: number | null = null;

  /** User-added filters beyond the three defaults above, shown in the right-hand panel. */
  activeFilters: ActiveFilter[] = [];
  addFilterMenuOpen = false;
  addFilterSearch = '';
  private nextFilterUid = 1;

  private searchInput$ = new Subject<string>();
  /** Debounces active-filter edits (typed text, typed numbers) into one re-filter, like search. */
  private filterUpdate$ = new Subject<void>();

  constructor() {
    this.searchInput$
      .pipe(debounceTime(200), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((text: string) => {
        this.filterText = text;
        this.currentPage = 0;
        this.applyView();
      });
    this.filterUpdate$.pipe(debounceTime(200), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.currentPage = 0;
      this.applyView();
    });
  }

  ngOnInit() {
    this.visibleColumnIds = this.restoreColumns();
    this.rebuildVisibleColumns();
    if (this.hasDatatableColumnsSelected()) {
      this.loadDatatableMeta();
    }
    // A different language can need more (or less) room for the same header label.
    this.translateService.onLangChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.rebuildVisibleColumns();
      this.cdr.markForCheck();
    });
    this.isLoading = true;
    this.loadAllLoans();
    this.loansService
      .getOffices()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((offices) => {
        this.offices = offices ?? [];
        this.officeNameById = new Map(
          this.offices.map((office) => [
            office.id,
            office.name
          ])
        );
        // The office column may have rendered blank cells before this arrived.
        if (this.visibleColumns.some((col) => col.id === 'std:office')) {
          this.rebuildAllCells();
          this.applyView();
        } else {
          this.cdr.markForCheck();
        }
      });
    this.loansService
      .getLoanProducts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((loanProducts) => {
        this.loanProducts = loanProducts ?? [];
        this.cdr.markForCheck();
      });
  }

  get hasResults(): boolean {
    return this.totalRows > 0;
  }

  /**
   * Export walks `viewRows`, which only reflects loans loaded so far. While the
   * background chunks (or a visible datatable column) are still streaming in, an
   * export would silently omit not-yet-loaded loans/cells instead of covering
   * every matching row as documented.
   */
  get canExport(): boolean {
    return this.hasResults && !this.isLoading && this.dtLoading.size === 0;
  }

  /** Panel options for built-in columns: the four core columns, then the optional loan fields. */
  get standardColumnOptions(): ColumnDef[] {
    return [
      ...this.coreColumns,
      ...this.stdColumns
    ];
  }

  /** Non-borrower visible columns in display order — what the panel's reorder list renders. */
  get reorderableColumns(): ColumnDef[] {
    return this.visibleColumns.slice(1);
  }

  onSearchInput(value: string) {
    this.searchInput$.next(value.trim().toLowerCase());
  }

  clearSearch(searchInput: HTMLInputElement) {
    searchInput.value = '';
    this.onSearchInput('');
  }

  /** Mirrors horizontal scroll between the top sync bar and the real (bottom) scrollbar. */
  private syncingScroll = false;
  syncScroll(source: HTMLElement, target: HTMLElement) {
    if (this.syncingScroll) return;
    this.syncingScroll = true;
    target.scrollLeft = source.scrollLeft;
    this.syncingScroll = false;
  }

  toggleShowClosed() {
    this.showClosedAccounts = !this.showClosedAccounts;
    this.currentPage = 0;
    this.applyView();
  }

  /** Sets the sort column/direction, cycling asc → desc → none on repeated clicks. */
  setSort(column: string) {
    if (this.sortColumn === column) {
      if (this.sortDirection === 'asc') {
        this.sortDirection = 'desc';
      } else if (this.sortDirection === 'desc') {
        this.sortColumn = '';
        this.sortDirection = '';
      } else {
        this.sortDirection = 'asc';
      }
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.currentPage = 0;
    this.applyView();
  }

  goToPage(page: number) {
    const clamped = Math.min(Math.max(page, 0), this.totalPages() - 1);
    if (clamped === this.currentPage) return;
    this.currentPage = clamped;
    this.updatePage();
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 0;
    this.updatePage();
  }

  onOfficeChange(value: number | null) {
    this.selectedOfficeId = value;
    this.currentPage = 0;
    this.applyView();
  }

  onLoanProductChange(value: number | null) {
    this.selectedLoanProductId = value;
    this.currentPage = 0;
    this.applyView();
  }

  rangeStart(): number {
    return this.totalRows === 0 ? 0 : this.currentPage * this.pageSize + 1;
  }

  rangeEnd(): number {
    const end = (this.currentPage + 1) * this.pageSize;
    return end > this.totalRows ? this.totalRows : end;
  }

  totalPages(): number {
    return this.pageSize > 0 ? Math.max(1, Math.ceil(this.totalRows / this.pageSize)) : 1;
  }

  /* ── Export ───────────────────────────────────────────────── */

  /**
   * Writes every row currently matching the filters (all pages, not just the one on
   * screen) to an .xlsx file, one column per column the user has visible, in the same
   * order and with the same headers shown in the table.
   */
  async exportToXlsx(): Promise<void> {
    if (this.exporting || !this.canExport) return;
    this.exporting = true;
    this.cdr.detectChanges();
    try {
      const columns = this.visibleColumns;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Loans');
      worksheet.addRow(columns.map((col) => sanitizeCsvValue(this.columnLabel(col))));
      for (const loan of this.viewRows) {
        worksheet.addRow(columns.map((col) => sanitizeCsvValue(this.exportCellValue(loan, col))));
      }
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = this.exportFileName();
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
    } catch (error) {
      console.error('Failed to export loans:', error);
    } finally {
      this.exporting = false;
      // exceljs resolves its write internally, sometimes outside Angular's zone, so
      // markForCheck() alone can leave this flagged-dirty-but-never-flushed — force
      // an immediate repaint instead of hoping a tick gets scheduled.
      this.cdr.detectChanges();
    }
  }

  /** Plain-text value for one cell — mirrors the template's per-column rendering for the four core columns. */
  private exportCellValue(loan: any, col: ColumnDef): string {
    switch (col.id) {
      case 'borrower':
        return loan._borrowerName ?? '';
      case 'status':
        return loan.status?.value ?? '';
      case 'accountNo':
        return loan.accountNo ?? '';
      case 'principal':
        return this.moneyText(loan, loan.principal);
      case 'product':
        return loan.loanProductName ?? '';
      default:
        return loan._cells?.[col.id] ?? '';
    }
  }

  private exportFileName(): string {
    const now = new Date();
    const pad = (value: number) => String(value).padStart(2, '0');
    const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
    return `Loans_${stamp}.xlsx`;
  }

  /* ── Column configuration ─────────────────────────────────── */

  toggleColumnsPanel() {
    this.columnsPanelOpen = !this.columnsPanelOpen;
    if (this.columnsPanelOpen) {
      this.loadDatatableMeta();
    }
  }

  closeColumnsPanel() {
    this.columnsPanelOpen = false;
  }

  onEscapeKey() {
    if (this.columnsPanelOpen || this.addFilterMenuOpen) {
      this.columnsPanelOpen = false;
      this.addFilterMenuOpen = false;
      this.cdr.markForCheck();
    }
  }

  isColumnVisible(id: string): boolean {
    return this.visibleColumnIds.includes(id);
  }

  toggleColumn(id: string) {
    if (id === 'borrower') return;
    const index = this.visibleColumnIds.indexOf(id);
    if (index >= 0) {
      this.visibleColumnIds.splice(index, 1);
    } else {
      this.visibleColumnIds.push(id);
    }
    this.persistColumns();
    this.onColumnsChanged();
  }

  resetColumns() {
    this.visibleColumnIds = [...DEFAULT_COLUMN_IDS];
    this.persistColumns();
    this.onColumnsChanged();
  }

  /**
   * Reorders visible columns from a drag in the panel's "Visible Columns" list.
   *
   * Reorders only the currently-resolved ids (what was actually on screen to drag) and
   * appends any not-yet-resolved ones (e.g. a datatable column whose metadata is still
   * loading) at the end, so a drag mid-load can't scramble columns the user never saw.
   */
  moveColumn(event: CdkDragDrop<ColumnDef[]>) {
    const visibleIds = this.reorderableColumns.map((col) => col.id);
    moveItemInArray(visibleIds, event.previousIndex, event.currentIndex);
    const pending = this.visibleColumnIds.filter((id) => !visibleIds.includes(id));
    this.visibleColumnIds = [
      ...visibleIds,
      ...pending
    ];
    this.persistColumns();
    this.onColumnsChanged();
  }

  dtColumnId(tableName: string, columnName: string): string {
    return `dt:${tableName}:${columnName}`;
  }

  /** Re-derives visible columns, kicks off any missing datatable loads, and re-renders. */
  private onColumnsChanged() {
    this.rebuildVisibleColumns();
    this.refreshDataColumns();
  }

  /** Rebuilds visibleColumns by walking visibleColumnIds in order — that order is the display order. */
  private rebuildVisibleColumns() {
    const defs: ColumnDef[] = [this.borrowerColumn];
    for (const id of this.visibleColumnIds) {
      const def = this.resolveColumnDef(id);
      if (def) defs.push(def);
    }
    this.visibleColumns = defs;
    const mins = defs.map((def) => this.effectiveMinWidth(def));
    this.gridTemplate = '4px 36px ' + defs.map((def, i) => `minmax(${mins[i]}px, ${def.grow}fr)`).join(' ');
    // 4px rail + 36px avatar + column minimums + 14px gaps + 32px row padding.
    this.gridMinWidth = 40 + mins.reduce((sum, min) => sum + min, 0) + 14 * (defs.length + 1) + 32;
    if (this.sortColumn && !defs.some((def) => def.id === this.sortColumn)) {
      this.sortColumn = '';
      this.sortDirection = '';
    }
  }

  /**
   * A column's declared `min` is tuned for its value cells; the header label (especially
   * once translated — some languages run notably longer than English) can need more room
   * than that to avoid clipping. Whichever is larger wins.
   */
  private effectiveMinWidth(def: ColumnDef): number {
    const label = def.translate ? this.translateService.instant(def.label) : def.label;
    return Math.max(def.min, this.headerTextMinWidth(label));
  }

  /** Estimated px width of a header label in its bold, uppercase, letter-spaced 10.5px font, plus the sort icon. */
  private headerTextMinWidth(text: string): number {
    return Math.ceil((text || '').length * 8) + 14;
  }

  /** Resolves a persisted column id to its definition; undefined for a stale or not-yet-loaded datatable column. */
  private resolveColumnDef(id: string): ColumnDef | undefined {
    const core = this.coreColumns.find((col) => col.id === id);
    if (core) return core;
    const std = this.stdColumns.find((col) => col.id === id);
    if (std) return std;
    if (!id.startsWith('dt:')) return undefined;
    for (const table of this.dtTables ?? []) {
      const column = table.columns.find((candidate) => this.dtColumnId(table.name, candidate.name) === id);
      if (column) {
        return {
          id,
          label: column.label,
          translate: false,
          kind: 'dt',
          ...this.dtColumnSizing(column.type),
          dtTable: table.name,
          dtColumn: column.name,
          dtType: column.type,
          codeValues: column.codeValues
        };
      }
    }
    return undefined;
  }

  private dtColumnSizing(type: string): { min: number; grow: number; mono?: boolean } {
    switch (type) {
      case 'DATE':
      case 'DATETIME':
        return { min: 110, grow: 0.8, mono: true };
      case 'INTEGER':
      case 'DECIMAL':
        return { min: 100, grow: 0.8, mono: true };
      case 'BOOLEAN':
        return { min: 85, grow: 0.5 };
      default:
        return { min: 130, grow: 1 };
    }
  }

  private hasDatatableColumnsSelected(): boolean {
    return this.visibleColumnIds.some((id) => id.startsWith('dt:'));
  }

  private persistColumns() {
    try {
      localStorage.setItem(COLUMNS_STORAGE_KEY, JSON.stringify(this.visibleColumnIds));
    } catch {
      /* Storage full or unavailable — the selection just won't survive a reload. */
    }
  }

  private restoreColumns(): string[] {
    try {
      const saved = JSON.parse(localStorage.getItem(COLUMNS_STORAGE_KEY));
      if (Array.isArray(saved) && saved.length) {
        // Older saved state persisted 'borrower' too, back when it was a removable column.
        return saved.filter((id: any) => typeof id === 'string' && id !== 'borrower');
      }
    } catch {
      /* Corrupt entry — fall through to the defaults. */
    }
    return [...DEFAULT_COLUMN_IDS];
  }

  /* ── Datatable metadata and bulk data ─────────────────────── */

  private loadDatatableMeta() {
    if (this.dtTables !== null || this.dtTablesLoading) return;
    this.dtTablesLoading = true;
    this.dtTablesError = false;
    this.loansService
      .getLoanDataTables()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          this.dtTables = this.parseDatatableMeta(res);
          this.dtTablesLoading = false;
          this.pruneUnknownDtColumns();
          this.onColumnsChanged();
        },
        error: (error) => {
          console.error('Failed to load loan datatables:', error);
          this.dtTablesLoading = false;
          this.dtTablesError = true;
          this.cdr.markForCheck();
        }
      });
  }

  private parseDatatableMeta(res: any): LoanDatatableMeta[] {
    const tables: LoanDatatableMeta[] = [];
    for (const table of res ?? []) {
      const name = table?.registeredTableName;
      if (!name) continue;
      const columns = (table.columnHeaderData ?? [])
        .filter(
          (col: any) => ![
              'id',
              'loan_id',
              'client_id'
            ].includes((col.columnName ?? '').toLowerCase())
        )
        .map((col: any) => ({
          name: col.columnName,
          label: humanizeName(col.columnName ?? ''),
          type: (col.columnDisplayType ?? 'STRING').toUpperCase(),
          codeValues: col.columnValues?.length
            ? new Map<number, string>(
                col.columnValues.map((value: any) => [
                  value.id,
                  value.value
                ])
              )
            : undefined
        }));
      if (columns.length) {
        tables.push({ name, label: humanizeName(name), columns });
      }
    }
    return tables;
  }

  /**
   * Drops saved datatable columns whose table or column no longer exists, and any
   * ad-hoc filter targeting one — an unresolvable filter's raw value always reads
   * as empty, which silently excludes every row once the filter has a value set.
   */
  private pruneUnknownDtColumns() {
    const known = new Set<string>();
    for (const table of this.dtTables ?? []) {
      for (const column of table.columns) {
        known.add(this.dtColumnId(table.name, column.name));
      }
    }
    const filtered = this.visibleColumnIds.filter((id) => !id.startsWith('dt:') || known.has(id));
    if (filtered.length !== this.visibleColumnIds.length) {
      this.visibleColumnIds = filtered;
      this.persistColumns();
    }
    const remainingFilters = this.activeFilters.filter(
      (filter) => !filter.columnId.startsWith('dt:') || known.has(filter.columnId)
    );
    if (remainingFilters.length !== this.activeFilters.length) {
      this.activeFilters = remainingFilters;
    }
  }

  /**
   * Bulk-loads a datatable once: pages through the advanced query API and indexes rows
   * by loan id. For multi-row tables the last row per loan wins (the newest entry under
   * the API's id ordering).
   */
  private ensureDatatableLoaded(tableName: string | undefined) {
    if (!tableName || this.dtRows.has(tableName) || this.dtLoading.has(tableName)) return;
    const table = (this.dtTables ?? []).find((candidate) => candidate.name === tableName);
    if (!table) return;
    this.dtLoading.add(tableName);
    this.dtFailed.delete(tableName);
    const resultColumns = [
      'loan_id',
      ...table.columns.map((column) => column.name)
    ];
    const rows = new Map<number, any>();
    const loadPage = (page: number) => {
      this.loansService
        .queryLoanDatatableRows(tableName, resultColumns, page, DATATABLE_PAGE_SIZE)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (res: any) => {
            const content: any[] = res?.content ?? (Array.isArray(res) ? res : []);
            for (const row of content) {
              const loanId = Number(row?.loan_id);
              if (!isNaN(loanId)) {
                rows.set(loanId, row);
              }
            }
            // Fineract serializes this endpoint's Spring Page via Gson, which reflects
            // declared fields (content) but not interface default-methods (last/totalPages),
            // so a full page — rather than a `last` flag — is what signals "there may be more".
            const isFullPage = content.length === DATATABLE_PAGE_SIZE;
            if (isFullPage && page + 1 < DATATABLE_MAX_PAGES) {
              loadPage(page + 1);
            } else {
              this.dtLoading.delete(tableName);
              this.dtRows.set(tableName, rows);
              this.rebuildAllCells();
              this.applyView();
            }
          },
          error: (error) => {
            console.error(`Failed to load datatable ${tableName}:`, error);
            this.dtLoading.delete(tableName);
            this.dtFailed.add(tableName);
            this.cdr.markForCheck();
          }
        });
    };
    loadPage(0);
  }

  /* ── Ad-hoc filters (right panel) ─────────────────────────── */

  /** Fields offered by "Add Filter", excluding product/office — those are the default filters above. */
  filterableStandardOptions(search: string): ColumnDef[] {
    const pool = [
      ...this.coreColumns.filter((col) => col.id !== 'product'),
      ...this.stdColumns.filter((col) => col.id !== 'std:office')
    ];
    if (!search) return pool;
    const needle = search.toLowerCase();
    return pool.filter((col) => this.columnLabel(col).toLowerCase().includes(needle));
  }

  filterableDtOptions(table: LoanDatatableMeta, search: string): LoanDatatableMeta['columns'] {
    if (!search) return table.columns;
    const needle = search.toLowerCase();
    if (table.label.toLowerCase().includes(needle)) return table.columns;
    return table.columns.filter((col) => col.label.toLowerCase().includes(needle));
  }

  columnLabel(col: ColumnDef): string {
    return col.translate ? this.translateService.instant(col.label) : col.label;
  }

  isFilterActive(columnId: string): boolean {
    return this.activeFilters.some((filter) => filter.columnId === columnId);
  }

  toggleAddFilterMenu() {
    this.addFilterMenuOpen = !this.addFilterMenuOpen;
    if (this.addFilterMenuOpen) {
      this.addFilterSearch = '';
      this.loadDatatableMeta();
    }
  }

  closeAddFilterMenu() {
    this.addFilterMenuOpen = false;
  }

  /** Adds an empty (no-op) filter row for the given field and opens it for editing. */
  addFilter(columnId: string) {
    if (this.isFilterActive(columnId)) {
      this.closeAddFilterMenu();
      return;
    }
    const def = this.resolveColumnDef(columnId);
    if (!def) return;
    const type = this.filterTypeFor(def);
    this.activeFilters = [
      ...this.activeFilters,
      {
        uid: this.nextFilterUid++,
        columnId,
        label: this.columnLabel(def),
        type,
        text: '',
        numberMin: null,
        numberMax: null,
        dateFrom: null,
        dateTo: null,
        boolValue: '',
        selectOptions: type === 'select' ? Array.from(def.codeValues?.values() ?? []).sort() : [],
        selectValues: new Set<string>()
      }
    ];
    this.closeAddFilterMenu();
    this.currentPage = 0;
    this.refreshDataColumns();
  }

  removeFilter(uid: number) {
    this.activeFilters = this.activeFilters.filter((filter) => filter.uid !== uid);
    this.currentPage = 0;
    this.refreshDataColumns();
  }

  clearAllFilters() {
    this.activeFilters = [];
    this.currentPage = 0;
    this.applyView();
  }

  /** Resets the three always-on defaults; leaves any ad-hoc filters in the list untouched. */
  resetDefaultFilters() {
    this.selectedOfficeId = null;
    this.selectedLoanProductId = null;
    this.showClosedAccounts = false;
    this.currentPage = 0;
    this.applyView();
  }

  updateFilterText(filter: ActiveFilter, value: string) {
    filter.text = value;
    this.filterUpdate$.next();
  }

  updateFilterNumber(filter: ActiveFilter, bound: 'min' | 'max', value: string) {
    const num = value === '' ? null : Number(value);
    const parsed = num !== null && isNaN(num) ? null : num;
    if (bound === 'min') {
      filter.numberMin = parsed;
    } else {
      filter.numberMax = parsed;
    }
    this.filterUpdate$.next();
  }

  updateFilterDate(filter: ActiveFilter, bound: 'from' | 'to', value: string) {
    if (bound === 'from') {
      filter.dateFrom = value || null;
    } else {
      filter.dateTo = value || null;
    }
    this.filterUpdate$.next();
  }

  updateFilterBool(filter: ActiveFilter, value: string) {
    filter.boolValue = value as ActiveFilter['boolValue'];
    this.filterUpdate$.next();
  }

  toggleFilterSelectOption(filter: ActiveFilter, option: string) {
    if (filter.selectValues.has(option)) {
      filter.selectValues.delete(option);
    } else {
      filter.selectValues.add(option);
    }
    this.filterUpdate$.next();
  }

  /** Picks the right panel control for a field from its ColumnDef — dt columns key off Fineract's display type. */
  private filterTypeFor(def: ColumnDef): FilterType {
    if (def.kind === 'dt') {
      switch (def.dtType) {
        case 'DATE':
        case 'DATETIME':
          return 'date';
        case 'INTEGER':
        case 'DECIMAL':
          return 'number';
        case 'BOOLEAN':
          return 'boolean';
        case 'CODELOOKUP':
        case 'CODEVALUE':
          return def.codeValues?.size ? 'select' : 'text';
        default:
          return 'text';
      }
    }
    switch (def.id) {
      case 'principal':
      case 'std:interestRate':
      case 'std:numberOfRepayments':
      case 'std:principalOutstanding':
      case 'std:totalOutstanding':
      case 'std:totalOverdue':
        return 'number';
      case 'std:disbursedDate':
      case 'std:maturityDate':
      case 'std:submittedDate':
      case 'std:closedDate':
        return 'date';
      case 'std:inArrears':
        return 'boolean';
      default:
        return 'text';
    }
  }

  /** Every std/dt column currently needed: visible ones plus whatever ad-hoc filters target, deduped. */
  private dataColumns(): ColumnDef[] {
    const seen = new Set<string>();
    const defs: ColumnDef[] = [];
    const add = (col: ColumnDef | undefined) => {
      if (col && (col.kind === 'std' || col.kind === 'dt') && !seen.has(col.id)) {
        seen.add(col.id);
        defs.push(col);
      }
    };
    for (const col of this.visibleColumns) add(col);
    for (const filter of this.activeFilters) add(this.resolveColumnDef(filter.columnId));
    return defs;
  }

  /** Ensures every std/dt column now in play has its data loaded, then re-renders. Columns or filters changed. */
  private refreshDataColumns() {
    for (const col of this.dataColumns()) {
      if (col.kind === 'dt') {
        this.ensureDatatableLoaded(col.dtTable);
      }
    }
    this.rebuildAllCells();
    this.applyView();
  }

  /** True if the loan satisfies every ad-hoc filter; an unconfigured (freshly added) filter always matches. */
  private matchesFilter(loan: any, filter: ActiveFilter): boolean {
    const raw = this.sortKey(loan, filter.columnId);
    switch (filter.type) {
      case 'text': {
        if (!filter.text) return true;
        return String(raw ?? '')
          .toLowerCase()
          .includes(filter.text.toLowerCase());
      }
      case 'number': {
        if (filter.numberMin === null && filter.numberMax === null) return true;
        const num = typeof raw === 'number' ? raw : NaN;
        if (isNaN(num) || num === Number.MIN_SAFE_INTEGER) return false;
        if (filter.numberMin !== null && num < filter.numberMin) return false;
        if (filter.numberMax !== null && num > filter.numberMax) return false;
        return true;
      }
      case 'date': {
        if (!filter.dateFrom && !filter.dateTo) return true;
        const time = typeof raw === 'number' ? raw : 0;
        if (!time) return false;
        if (filter.dateFrom && time < new Date(filter.dateFrom).getTime()) return false;
        // Inclusive of the whole "to" day.
        if (filter.dateTo && time > new Date(filter.dateTo).getTime() + 86399999) return false;
        return true;
      }
      case 'boolean': {
        if (!filter.boolValue) return true;
        // Both boolean sources (std:inArrears, dt BOOLEAN columns) encode as 1/0, never a real boolean.
        const truthy = raw === 1;
        return filter.boolValue === 'true' ? truthy : !truthy;
      }
      case 'select': {
        if (filter.selectValues.size === 0) return true;
        const rawText = String(raw ?? '');
        for (const option of filter.selectValues) {
          if (option.toLowerCase() === rawText) return true;
        }
        return false;
      }
    }
  }

  /* ── Loading ──────────────────────────────────────────────── */

  /**
   * Loads all loans. The first (small) page is fetched on its own so the list paints
   * quickly and to learn the total; the remaining pages are then fetched in parallel
   * (capped at MAX_PARALLEL_REQUESTS) and rendered as each one arrives.
   */
  private loadAllLoans() {
    this.loansService
      .getLoansPage(0, FIRST_CHUNK)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (page: any) => {
          const items: any[] = page?.pageItems ?? [];
          const total: number = page?.totalFilteredRecords ?? items.length;
          this.storeChunk(0, items);

          const offsets: number[] = [];
          for (let offset = FIRST_CHUNK; offset < total; offset += NEXT_CHUNK) {
            offsets.push(offset);
          }
          if (offsets.length === 0) {
            this.isLoading = false;
            this.applyView();
            return;
          }

          from(offsets)
            .pipe(
              mergeMap(
                (offset) =>
                  this.loansService.getLoansPage(offset, NEXT_CHUNK).pipe(
                    map((page: any) => ({ offset, page })),
                    // A failed chunk must not abort the merged stream; skip it and keep the rest loading.
                    catchError((error) => {
                      console.error(`Failed to load loans at offset ${offset}:`, error);
                      return of(null);
                    })
                  ),
                MAX_PARALLEL_REQUESTS
              ),
              takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
              next: (result: { offset: number; page: any } | null) => {
                if (result?.page?.pageItems) {
                  this.storeChunk(result.offset, result.page.pageItems);
                }
              },
              complete: () => {
                this.isLoading = false;
                this.applyView();
                if (this.allLoans.length < total) {
                  console.warn(`Loans list: loaded ${this.allLoans.length} of ${total} loans (failed or short pages).`);
                }
              }
            });
        },
        error: (error) => {
          console.error('Failed to load loans:', error);
          this.isLoading = false;
          this.applyView();
        }
      });
  }

  /** Decorates and stores a page of loans under its offset, then schedules a re-render. */
  private storeChunk(offset: number, items: any[]) {
    const columns = this.dataColumns();
    this.chunks.set(
      offset,
      items.map((loan) => this.decorate(loan, columns))
    );
    this.allLoans = Array.from(this.chunks.keys())
      .sort((a, b) => a - b)
      .flatMap((key) => this.chunks.get(key));
    this.scheduleApplyView();
  }

  /**
   * Coalesces applyView calls to one per animation frame, so a burst of parallel chunk
   * arrivals re-filters/re-sorts the growing set once instead of once per response.
   */
  private applyViewScheduled = false;
  private scheduleApplyView() {
    if (this.applyViewScheduled) return;
    this.applyViewScheduled = true;
    requestAnimationFrame(() => {
      this.applyViewScheduled = false;
      this.applyView();
    });
  }

  /** Precomputes display and search fields so template bindings don't recompute each change-detection cycle. */
  private decorate(loan: any, columns: ColumnDef[] = this.dataColumns()): any {
    const borrowerName = loan.clientName || loan.group?.name || loan.groupName || '';
    const severity = this.severity(loan);
    loan._borrowerName = borrowerName;
    loan._initials = nameInitials(borrowerName);
    loan._borrowerRoute = this.getBorrowerRoute(loan);
    loan._viewRoute = [
      loan.id,
      'general'
    ];
    loan._severity = severity;
    // Single source of truth for "dead account": drives both the closed-accounts filter and the faded styling.
    loan._isClosed = severity === 'closed' || severity === 'rejected';
    // Client loans carry office at the top level; group loans only have it nested.
    loan._officeId = loan.clientOfficeId ?? loan.group?.officeId ?? null;
    loan._search = [
      loan.id,
      loan.accountNo,
      borrowerName,
      loan.loanProductName,
      loan.status?.value
    ]
      .filter((value: any) => value !== undefined && value !== null)
      .join(' ')
      .toLowerCase();
    this.buildCells(loan, columns);
    return loan;
  }

  /* ── Dynamic cell values ──────────────────────────────────── */

  /**
   * Precomputes display text and sort/filter keys for one loan, across every std/dt column
   * currently in play — not just the visible ones, since an ad-hoc filter can target a
   * column the user never chose to display.
   */
  private buildCells(loan: any, columns: ColumnDef[] = this.dataColumns()) {
    const cells: Record<string, string> = {};
    const raw: Record<string, string | number> = {};
    for (const col of columns) {
      if (col.kind === 'std') {
        const text = col.text(loan) ?? '';
        cells[col.id] = text;
        raw[col.id] = col.raw ? col.raw(loan) : text.toLowerCase();
      } else if (col.kind === 'dt') {
        const row = this.dtRows.get(col.dtTable)?.get(Number(loan.id));
        const cell = this.dtCell(col, row);
        cells[col.id] = cell.text;
        raw[col.id] = cell.raw;
      }
    }
    loan._cells = cells;
    loan._raw = raw;
  }

  private rebuildAllCells() {
    const columns = this.dataColumns();
    for (const loan of this.allLoans) {
      this.buildCells(loan, columns);
    }
  }

  /** Formats one datatable value by its Fineract column display type. */
  private dtCell(col: ColumnDef, row: any): { text: string; raw: string | number } {
    const value = row?.[col.dtColumn];
    if (value === null || value === undefined || value === '') {
      return { text: '', raw: '' };
    }
    switch (col.dtType) {
      case 'DATE':
      case 'DATETIME': {
        const date = this.dateUtils.parseDate(value);
        const time = date?.getTime();
        if (time === undefined || isNaN(time)) {
          return { text: String(value), raw: String(value).toLowerCase() };
        }
        return { text: this.dateUtils.formatDate(date, this.settingsService.dateFormat), raw: time };
      }
      case 'DECIMAL': {
        const num = Number(value);
        if (isNaN(num)) return { text: String(value), raw: String(value).toLowerCase() };
        return { text: formatNumber(num, this.locale, '1.0-2'), raw: num };
      }
      case 'INTEGER': {
        const num = Number(value);
        if (isNaN(num)) return { text: String(value), raw: String(value).toLowerCase() };
        return { text: String(value), raw: num };
      }
      case 'BOOLEAN': {
        const truthy = value === true || value === 'true' || value === 1 || value === '1';
        return { text: this.yesNoText(truthy), raw: truthy ? 1 : 0 };
      }
      case 'CODELOOKUP':
      case 'CODEVALUE': {
        const text = col.codeValues?.get(Number(value)) ?? String(value);
        return { text, raw: text.toLowerCase() };
      }
      default:
        return { text: String(value), raw: String(value).toLowerCase() };
    }
  }

  private externalIdText(loan: any): string {
    const externalId = loan.externalId;
    if (externalId === null || externalId === undefined) return '';
    return typeof externalId === 'object' ? (externalId.value ?? '') : String(externalId);
  }

  private numberOrNaN(value: any): number {
    const num = Number(value);
    // Finite sentinel so missing values sort first without producing NaN in the comparator.
    return isNaN(num) ? Number.MIN_SAFE_INTEGER : num;
  }

  private percentText(value: any): string {
    const num = Number(value);
    if (value === null || value === undefined || isNaN(num)) return '';
    return formatNumber(num, this.locale, '1.0-2') + '%';
  }

  private moneyText(loan: any, value: any): string {
    const num = Number(value);
    if (value === null || value === undefined || isNaN(num)) return '';
    const code = loan.currency?.code ?? '';
    return formatCurrency(num, this.locale, getCurrencySymbol(code, 'narrow'), code, '1.2-2');
  }

  private dateSortKey(value: any): number {
    if (!value) return 0;
    const time = this.dateUtils.parseDate(value)?.getTime();
    return time === undefined || isNaN(time) ? 0 : time;
  }

  private dateText(value: any): string {
    if (!value) return '';
    const date = this.dateUtils.parseDate(value);
    const time = date?.getTime();
    if (time === undefined || isNaN(time)) return '';
    return this.dateUtils.formatDate(date, this.settingsService.dateFormat);
  }

  private yesNoText(value: boolean): string {
    return this.translateService.instant(value ? 'labels.commons.Yes' : 'labels.commons.No');
  }

  /* ── Filtering, sorting, paging ───────────────────────────── */

  /** Applies the closed-accounts filter, search, and sort to the loaded set, then repages. */
  private applyView() {
    const officeId = this.selectedOfficeId;
    const productId = this.selectedLoanProductId;
    const text = this.filterText;
    const filters = this.activeFilters;
    const rows = this.allLoans.filter(
      (loan) =>
        (this.showClosedAccounts || !loan._isClosed) &&
        (officeId === null || loan._officeId === officeId) &&
        (productId === null || loan.loanProductId === productId) &&
        (!text || loan._search.includes(text)) &&
        filters.every((filter) => this.matchesFilter(loan, filter))
    );
    if (this.sortColumn && this.sortDirection) {
      const direction = this.sortDirection === 'asc' ? 1 : -1;
      rows.sort((a, b) => this.compareBy(a, b, this.sortColumn) * direction);
    }
    this.viewRows = rows;
    this.updatePage();
  }

  /** Re-slices the cached filtered/sorted rows for the current page — no re-filter or re-sort. */
  private updatePage() {
    this.totalRows = this.viewRows.length;
    const maxPage = this.totalPages() - 1;
    if (this.currentPage > maxPage) {
      this.currentPage = maxPage;
    }
    const start = this.currentPage * this.pageSize;
    this.pagedLoans = this.viewRows.slice(start, start + this.pageSize);
    this.cdr.markForCheck();
  }

  private compareBy(a: any, b: any, column: string): number {
    const keyA = this.sortKey(a, column);
    const keyB = this.sortKey(b, column);
    if (typeof keyA === 'number' && typeof keyB === 'number') {
      return keyA - keyB;
    }
    return String(keyA).localeCompare(String(keyB), undefined, { numeric: true, sensitivity: 'base' });
  }

  private sortKey(loan: any, column: string): string | number {
    switch (column) {
      case 'borrower':
        return loan._borrowerName || '';
      case 'status':
        return loan.status?.value || '';
      case 'accountNo':
        return loan.accountNo || '';
      case 'principal':
        return typeof loan.principal === 'number' ? loan.principal : Number(loan.principal) || 0;
      case 'product':
        return loan.loanProductName || '';
      default: {
        const raw = loan._raw?.[column];
        return raw === undefined || raw === null ? '' : raw;
      }
    }
  }

  /** Borrower route for client or group loans, empty when neither is present. */
  private getBorrowerRoute(loan: any): any[] {
    if (loan.clientId) {
      return [
        '/clients',
        loan.clientId,
        'general'
      ];
    }
    if (loan.group?.id || loan.groupId) {
      return [
        '/groups',
        loan.group?.id || loan.groupId,
        'general'
      ];
    }
    return [];
  }

  /** UI severity class for a loan row, driven by the status Fineract returns. */
  private severity(loan: any): Severity {
    if (loan.status?.overpaid) return 'pending';
    // Active-but-overdue loans are flagged as 'arrears' (needs attention), not faded like dead accounts.
    if (loan.status?.active) return loan.inArrears ? 'arrears' : 'active';
    if (loan.status?.pendingApproval || loan.status?.waitingForDisbursal) return 'pending';
    const statusId = loan.status?.id;
    if (loan.status?.rejected || loan.status?.withdrawnByClient || statusId === 400 || statusId === 500) {
      return 'rejected';
    }
    if (loan.status?.closed || statusId === 600 || statusId === 601 || statusId === 602) return 'closed';
    return 'neutral';
  }
}
