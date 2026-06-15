/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { Dates } from 'app/core/utils/dates';
import { LoanDelinquencyActionDialogComponent } from 'app/loans/custom-dialog/loan-delinquency-action-dialog/loan-delinquency-action-dialog.component';
import { LoansService } from 'app/loans/loans.service';
import { LoanDelinquencyAction } from 'app/loans/models/loan-account.model';
import { SettingsService } from 'app/settings/settings.service';
import { DateFormatPipe } from 'app/pipes/date-format.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanProductBaseComponent } from 'app/products/loan-products/common/loan-product-base.component';

type BreachActionStatus = 'active' | 'scheduled' | 'expired';
type BreachActionFilter = 'all' | BreachActionStatus;

interface BreachActionRow {
  id: number;
  action: string;
  startDate: number[];
  endDate: number[];
  startDateObj: Date;
  endDateObj: Date | null;
  status: BreachActionStatus;
  statusLabelKey: string;
  isOngoing: boolean;
  durationDays: number;
  label: string;
}

interface TimelineBar {
  label: string;
  status: BreachActionStatus;
  x: number;
  width: number;
  midX: number;
  tooltip: string;
}

const TIMELINE_PADDING_LEFT = 60;
const TIMELINE_INNER_WIDTH = 1140;
const MS_PER_DAY = 86_400_000;

@Component({
  selector: 'mifosx-loan-breach-actions-tab',
  templateUrl: './loan-breach-actions-tab.component.html',
  styleUrls: ['./loan-breach-actions-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    DateFormatPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoanBreachActionsTabComponent extends LoanProductBaseComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private loansService = inject(LoansService);
  private dateUtils = inject(Dates);
  private settingsService = inject(SettingsService);
  dialog = inject(MatDialog);

  breachActions = signal<LoanDelinquencyAction[]>([]);
  filter = signal<BreachActionFilter>('all');

  loanId: string;
  locale: string;
  dateFormat: string;

  rows = computed<BreachActionRow[]>(() => {
    const businessDate = this.settingsService.businessDate;
    return this.breachActions().map((item, index) => {
      const start = this.dateUtils.parseDate(item.startDate);
      const end = this.dateUtils.parseDate(item.endDate);
      const reference = end ?? businessDate;
      const durationDays = Math.max(1, Math.round((reference.getTime() - start.getTime()) / MS_PER_DAY));

      let status: BreachActionStatus;
      if (start.getTime() < businessDate.getTime() && end.getTime() < businessDate.getTime()) {
        status = 'expired';
      } else if (start.getTime() > businessDate.getTime() && end.getTime() > businessDate.getTime()) {
        status = 'scheduled';
      } else if (start.getTime() <= businessDate.getTime() && end.getTime() >= businessDate.getTime()) {
        status = 'active';
      } else {
        status = 'expired';
      }

      return {
        id: item.id,
        action: item.action,
        startDate: item.startDate,
        endDate: item.endDate,
        startDateObj: start,
        endDateObj: end,
        status,
        statusLabelKey: this.statusKey(status),
        isOngoing: !end && status === 'active',
        durationDays,
        label: `P${index + 1}`
      };
    });
  });

  filteredRows = computed<BreachActionRow[]>(() => {
    const filter = this.filter();
    if (filter === 'all') {
      return this.rows();
    }
    return this.rows().filter((row) => row.status === filter);
  });

  maxDurationDays = computed<number>(() => {
    const rows = this.rows();
    if (rows.length === 0) return 1;
    return Math.max(...rows.map((row) => row.durationDays));
  });

  kpis = computed(() => {
    const rows = this.rows();
    const activeCount = rows.filter((row) => row.status === 'active').length;
    const totalDays = rows.reduce((sum, row) => sum + row.durationDays, 0);
    const lastAction = rows.length
      ? rows.reduce((latest, row) => (row.startDateObj.getTime() > latest.startDateObj.getTime() ? row : latest))
      : null;
    return {
      total: rows.length,
      activeCount,
      totalDays,
      lastActionDate: lastAction?.startDateObj ?? null
    };
  });

  hasActivePause = computed<boolean>(() => this.kpis().activeCount > 0);

  timelineYear = computed<number>(() => {
    const rows = this.rows();
    if (rows.length === 0) return new Date().getFullYear();
    return rows[0].startDateObj.getFullYear();
  });

  timelineBars = computed<TimelineBar[]>(() => {
    const year = this.timelineYear();
    const yearStart = new Date(year, 0, 1).getTime();
    const today = this.startOfToday();
    const daysInYear = this.isLeapYear(year) ? 366 : 365;
    const pxPerDay = TIMELINE_INNER_WIDTH / daysInYear;

    return this.rows().map((row) => {
      const endRef = row.endDateObj ?? today;
      const startDay = this.clamp(Math.floor((row.startDateObj.getTime() - yearStart) / MS_PER_DAY), 0, daysInYear);
      const endDay = this.clamp(Math.floor((endRef.getTime() - yearStart) / MS_PER_DAY), 0, daysInYear);
      const x = TIMELINE_PADDING_LEFT + startDay * pxPerDay;
      const width = Math.max(8, (endDay - startDay) * pxPerDay);
      const tooltip = `${row.label} · ${this.shortDate(row.startDateObj)} → ${row.endDateObj ? this.shortDate(row.endDateObj) : 'Ongoing'} (${row.durationDays}d)`;
      return {
        label: row.label,
        status: row.status,
        x,
        width,
        midX: x + width / 2,
        tooltip
      };
    });
  });

  todayMarker = computed<number | null>(() => {
    const year = this.timelineYear();
    const today = new Date();
    if (today.getFullYear() !== year) return null;
    const yearStart = new Date(year, 0, 1).getTime();
    const daysInYear = this.isLeapYear(year) ? 366 : 365;
    const day = Math.floor((this.startOfToday().getTime() - yearStart) / MS_PER_DAY);
    return TIMELINE_PADDING_LEFT + day * (TIMELINE_INNER_WIDTH / daysInYear);
  });

  monthGridLines = Array.from({ length: 13 }, (_, i) => {
    return TIMELINE_PADDING_LEFT + (i * TIMELINE_INNER_WIDTH) / 12;
  });

  monthLabels = this.dateUtils.monthLabels.map((name, i) => ({
    name,
    x: TIMELINE_PADDING_LEFT + (i * TIMELINE_INNER_WIDTH) / 12 + TIMELINE_INNER_WIDTH / 24
  }));

  filters: { value: BreachActionFilter; label: string }[] = [
    { value: 'all', label: 'labels.buttons.All' },
    { value: 'active', label: 'labels.inputs.Active' },
    { value: 'scheduled', label: 'labels.inputs.Scheduled' },
    { value: 'expired', label: 'labels.inputs.Expired' }
  ];

  constructor() {
    super();
    this.loanId = this.route.parent.parent.snapshot.params['loanId'];

    this.route.parent.data
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: { breachActions: LoanDelinquencyAction[] }) => {
        this.setBreachActions(data.breachActions || []);
      });
  }

  ngOnInit(): void {
    this.locale = this.settingsService.language.code;
    this.dateFormat = this.settingsService.dateFormat;
  }

  selectFilter(value: BreachActionFilter): void {
    this.filter.set(value);
  }

  createBreachActionPause(): void {
    const action = 'pause';
    const dialogRef = this.dialog.open(LoanDelinquencyActionDialogComponent, {
      data: { action }
    });
    dialogRef.afterClosed().subscribe((response: { data: any }) => {
      if (!response) {
        return;
      }
      const startDate: Date = response.data.value.startDate;
      const endDate: Date = response.data.value.endDate;
      this.sendBreachAction(action, startDate, endDate);
    });
  }

  sendBreachAction(action: string, startDate: Date | null, endDate: Date | null): void {
    const payload = {
      action,
      locale: this.locale,
      dateFormat: this.dateFormat,
      startDate: this.dateUtils.formatDate(startDate, this.dateFormat),
      endDate: this.dateUtils.formatDate(endDate, this.dateFormat)
    };

    this.loansService.createBreachAction(this.loanId, payload).subscribe(() => {
      this.loansService.getBreachActions(this.loanId).subscribe((breachActions: LoanDelinquencyAction[]) => {
        this.setBreachActions(breachActions);
      });
    });
  }

  setBreachActions(breachActions: LoanDelinquencyAction[]): void {
    const sorted = [...(breachActions || [])].sort(
      (a, b) => this.dateUtils.parseDate(a.startDate).getTime() - this.dateUtils.parseDate(b.startDate).getTime()
    );
    this.breachActions.set(sorted);
  }

  durationBarWidth(row: BreachActionRow): number {
    const max = this.maxDurationDays();
    if (max === 0) return 0;
    return Math.min(100, Math.round((row.durationDays / max) * 100));
  }

  trackById(_index: number, row: BreachActionRow): number {
    return row.id;
  }

  trackByLabel(_index: number, bar: TimelineBar): string {
    return bar.label;
  }

  private startOfToday(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  private shortDate(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  }

  private statusKey(status: BreachActionStatus): string {
    switch (status) {
      case 'active':
        return 'labels.inputs.Active';
      case 'scheduled':
        return 'labels.inputs.Scheduled';
      case 'expired':
        return 'labels.inputs.Expired';
    }
  }
}
