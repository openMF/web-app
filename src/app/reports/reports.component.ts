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
  OnInit,
  ViewChild,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatPaginator } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

interface Report {
  id: number;
  reportName: string;
  reportType: string;
  reportCategory: string;
}

interface ReportGroup {
  category: string;
  categoryKey: string;
  reports: Report[];
  collapsed: boolean;
}

const ENGINE_TYPES = [
  'Table',
  'Pentaho',
  'BIRT',
  'Chart',
  'SMS'
] as const;

/**
 * Reports component.
 */
@Component({
  selector: 'mifosx-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    RouterLink,
    MatTooltipModule,
    MatPaginator
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsComponent implements OnInit {
  private static readonly PINNED_KEY = 'mifosx.reports.pinned';
  private static readonly COLLAPSE_KEY = 'mifosx.reports.collapsedGroups';
  private static readonly PINNED_LIMIT = 6;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  /** Raw reports data from resolver. */
  private reportsData: Report[] = [];
  /** Category filter from route (e.g. /reports/Loan). */
  private routeCategory: string | undefined;

  /** Free-text search term. */
  searchTerm = '';
  /** Selected engine filter, null = all engines. */
  selectedEngine: string | null = null;

  /** State persisted in localStorage. */
  private pinnedIds = new Set<number>();
  private collapsedGroups = new Set<string>();

  /** Derived views. */
  totalCount = 0;
  filteredCount = 0;
  pinnedReports: Report[] = [];
  engineCounts: Record<string, number> = {};
  paginatedGroups: ReportGroup[] = [];
  private filteredReports: Report[] = [];

  pageSize = 25;
  pageIndex = 0;
  readonly pageSizeOptions = [
    10,
    25,
    50,
    100
  ];

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  readonly engines = ENGINE_TYPES;

  constructor() {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { reports: Report[] }) => {
      this.reportsData = data.reports ?? [];
    });
    this.routeCategory = this.route.snapshot.params['filter'];
  }

  ngOnInit(): void {
    this.loadPersistedState();
    this.totalCount = this.reportsData.length;
    this.computeEngineCounts();
    this.recompute();
  }

  /* ── Filtering / search ───────────────────────────────────── */

  onSearchInput(value: string): void {
    this.searchTerm = value;
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.recompute();
  }

  setEngineFilter(engine: string | null): void {
    this.selectedEngine = this.selectedEngine === engine ? null : engine;
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.recompute();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedEngine = null;
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.recompute();
  }

  hasActiveFilters(): boolean {
    return this.searchTerm.length > 0 || this.selectedEngine !== null;
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.regroupPaginated();
    this.cdr.markForCheck();
  }

  /* ── Pinning ──────────────────────────────────────────────── */

  togglePin(report: Report, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    if (this.pinnedIds.has(report.id)) {
      this.pinnedIds.delete(report.id);
    } else if (this.pinnedIds.size < ReportsComponent.PINNED_LIMIT) {
      this.pinnedIds.add(report.id);
    } else {
      // At limit — no-op; user must unpin first.
      return;
    }
    this.savePinned();
    this.computePinned();
    this.cdr.markForCheck();
  }

  isPinned(reportId: number): boolean {
    return this.pinnedIds.has(reportId);
  }

  isPinLimitReached(): boolean {
    return this.pinnedIds.size >= ReportsComponent.PINNED_LIMIT;
  }

  /* ── Group collapse ───────────────────────────────────────── */

  toggleGroup(categoryKey: string): void {
    if (this.collapsedGroups.has(categoryKey)) {
      this.collapsedGroups.delete(categoryKey);
    } else {
      this.collapsedGroups.add(categoryKey);
    }
    this.saveCollapsed();
    this.regroupPaginated();
    this.cdr.markForCheck();
  }

  /* ── Translation key helpers (kept from previous impl) ────── */

  getCategoryKey(category: string): string {
    if (!category || category === '(NULL)' || category.trim() === '') {
      return 'labels.text.withoutCategory';
    }
    if (category.startsWith('labels.text.')) {
      return category;
    }
    return 'labels.text.' + category;
  }

  cleanTranslatedCategory(translatedText: string): string {
    if (!translatedText) {
      return '';
    }
    return translatedText.replace(/^labels\.text\./, '').replace(/^label\.text\./, '');
  }

  trackById(_: number, item: Report): number {
    return item.id;
  }

  trackByCategory(_: number, group: ReportGroup): string {
    return group.categoryKey;
  }

  isGroupCollapsed(categoryKey: string): boolean {
    return this.collapsedGroups.has(categoryKey);
  }

  /* ── Internals ────────────────────────────────────────────── */

  private recompute(): void {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredReports = this.reportsData.filter((r) => {
      if (this.routeCategory && r.reportCategory !== this.routeCategory) {
        return false;
      }
      if (this.selectedEngine && r.reportType !== this.selectedEngine) {
        return false;
      }
      if (term.length > 0) {
        const haystack = `${r.reportName} ${r.reportType} ${r.reportCategory}`.toLowerCase();
        if (!haystack.includes(term)) {
          return false;
        }
      }
      return true;
    });
    this.filteredCount = this.filteredReports.length;
    this.regroupPaginated();
    this.computePinned();
  }

  private regroupPaginated(): void {
    const start = this.pageIndex * this.pageSize;
    const pageSlice = this.filteredReports.slice(start, start + this.pageSize);
    const groupsMap = new Map<string, Report[]>();
    pageSlice.forEach((report) => {
      const key = this.getCategoryKey(report.reportCategory);
      const bucket = groupsMap.get(key) ?? [];
      bucket.push(report);
      groupsMap.set(key, bucket);
    });
    this.paginatedGroups = Array.from(groupsMap.entries()).map(
      ([
        categoryKey,
        reports
      ]) => ({
        category: reports[0]?.reportCategory ?? '',
        categoryKey,
        reports,
        collapsed: this.collapsedGroups.has(categoryKey)
      })
    );
  }

  private computePinned(): void {
    if (this.pinnedIds.size === 0) {
      this.pinnedReports = [];
      return;
    }
    this.pinnedReports = this.reportsData.filter((r) => this.pinnedIds.has(r.id));
  }

  private computeEngineCounts(): void {
    const counts: Record<string, number> = {};
    ENGINE_TYPES.forEach((t) => (counts[t] = 0));
    this.reportsData.forEach((r) => {
      if (counts[r.reportType] !== undefined) {
        counts[r.reportType]++;
      }
    });
    this.engineCounts = counts;
  }

  private loadPersistedState(): void {
    try {
      const pinned = localStorage.getItem(ReportsComponent.PINNED_KEY);
      if (pinned) {
        const parsed = JSON.parse(pinned);
        if (Array.isArray(parsed)) {
          this.pinnedIds = new Set(parsed.filter((v) => typeof v === 'number'));
        }
      }
      const collapsed = localStorage.getItem(ReportsComponent.COLLAPSE_KEY);
      if (collapsed) {
        const parsed = JSON.parse(collapsed);
        if (Array.isArray(parsed)) {
          this.collapsedGroups = new Set(parsed.filter((v) => typeof v === 'string'));
        }
      }
    } catch {
      // Corrupted localStorage — start fresh.
      this.pinnedIds = new Set();
      this.collapsedGroups = new Set();
    }
  }

  private savePinned(): void {
    try {
      localStorage.setItem(ReportsComponent.PINNED_KEY, JSON.stringify([...this.pinnedIds]));
    } catch {
      // Storage unavailable — silently ignore; UI still updates in-memory.
    }
  }

  private saveCollapsed(): void {
    try {
      localStorage.setItem(ReportsComponent.COLLAPSE_KEY, JSON.stringify([...this.collapsedGroups]));
    } catch {
      // Storage unavailable.
    }
  }
}
