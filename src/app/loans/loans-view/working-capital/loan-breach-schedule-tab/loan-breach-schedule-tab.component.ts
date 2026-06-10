/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { NgClass } from '@angular/common';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource
} from '@angular/material/table';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import { BreachSchedule } from 'app/loans/models/working-capital-loan-account.model';
import { DateFormatPipe } from 'app/pipes/date-format.pipe';
import { FormatNumberPipe } from 'app/pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

type Severity = 'mild' | 'moderate' | 'severe';

interface BreachPeriodView extends BreachSchedule {
  severity: Severity;
  gapPercent: number;
  gapBarWidth: number;
  fromDateObj: Date;
  toDateObj: Date;
  barX: number;
  barY: number;
  barWidth: number;
  barHeight: number;
  showLabel: boolean;
}

interface MonthMark {
  gridX: number;
  labelX: number;
  label: string;
}

interface BreachKpis {
  count: number;
  totalDays: number;
  peakOutstanding: number;
  avgGapPercent: number;
  status: 'in-breach' | 'resolved' | 'compliant';
}

const SEVERITY_MILD_THRESHOLD = 25;
const SEVERITY_MODERATE_THRESHOLD = 80;
const HEIGHT_SCALE_MAX_PERCENT = 140;
const MIN_BAR_HEIGHT = 18;
const MAX_BAR_HEIGHT = 100;
const MIN_BAR_WIDTH = 4;
const LABEL_MIN_BAR_WIDTH = 20;
const VIEWBOX_WIDTH = 1200;
const VIEWBOX_HEIGHT = 200;
const LEFT_PAD = 30;
const RIGHT_PAD = 30;
const BASELINE_Y = 145;
const TOP_Y = 38;
const TODAY_LINE_BOTTOM_Y = 155;
const MONTH_LABEL_Y = 170;
const TODAY_LABEL_Y = 32;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

@Component({
  selector: 'mifosx-loan-breach-schedule-tab',
  templateUrl: './loan-breach-schedule-tab.component.html',
  styleUrl: './loan-breach-schedule-tab.component.scss',
  standalone: true,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    NgClass,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    DateFormatPipe,
    FormatNumberPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoanBreachScheduleTabComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private dateUtils = inject(Dates);
  private settingsService = inject(SettingsService);

  dataSource = new MatTableDataSource<BreachPeriodView>();
  currencyCode: string = '';

  readonly displayedColumns: string[] = [
    'periodNumber',
    'severity',
    'fromDate',
    'toDate',
    'numberOfDays',
    'minPaymentAmount',
    'outstandingAmount',
    'gap'
  ];

  breachPeriods: BreachPeriodView[] = [];
  monthMarks: MonthMark[] = [];
  kpis: BreachKpis = {
    count: 0,
    totalDays: 0,
    peakOutstanding: 0,
    avgGapPercent: 0,
    status: 'compliant'
  };

  readonly viewBoxWidth = VIEWBOX_WIDTH;
  readonly viewBoxHeight = VIEWBOX_HEIGHT;
  readonly leftPad = LEFT_PAD;
  readonly rightPad = RIGHT_PAD;
  readonly baselineY = BASELINE_Y;
  readonly topY = TOP_Y;
  readonly todayLineBottomY = TODAY_LINE_BOTTOM_Y;
  readonly monthLabelY = MONTH_LABEL_Y;
  readonly todayLabelY = TODAY_LABEL_Y;
  readonly mildLabel = `<${SEVERITY_MILD_THRESHOLD}%`;
  readonly moderateLabel = `${SEVERITY_MILD_THRESHOLD}–${SEVERITY_MODERATE_THRESHOLD}%`;
  readonly severeLabel = `>${SEVERITY_MODERATE_THRESHOLD}%`;

  todayX: number | null = null;
  timelineYearLabel = '';

  ngOnInit(): void {
    this.route.data
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: { breachSchedule: BreachSchedule[] }) => {
        this.processBreachPeriods(data.breachSchedule ?? []);
        this.dataSource.data = this.breachPeriods;
      });

    if (this.route.parent) {
      this.route.parent.data
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((data: { loanDetailsData: { currency?: { code: string } } }) => {
          if (data?.loanDetailsData?.currency?.code) {
            this.currencyCode = data.loanDetailsData.currency.code;
          }
        });
    }
  }

  severityLabel(severity: Severity): string {
    return severity.charAt(0).toUpperCase() + severity.slice(1);
  }

  buildTooltip(period: BreachPeriodView): string {
    const from = this.dateUtils.formatDate(period.fromDateObj, Dates.DEFAULT_DATEFORMAT);
    const to = this.dateUtils.formatDate(period.toDateObj, Dates.DEFAULT_DATEFORMAT);
    const gapSign = period.gapPercent >= 0 ? '+' : '';
    return (
      `P${period.periodNumber} · ${from} → ${to} (${period.numberOfDays}d) · ` +
      `Min ${period.minPaymentAmount.toFixed(2)} · ` +
      `Outstanding ${period.outstandingAmount.toFixed(2)} (${gapSign}${period.gapPercent.toFixed(1)}%)`
    );
  }

  private processBreachPeriods(periods: BreachSchedule[]): void {
    if (periods.length === 0) {
      this.breachPeriods = [];
      this.monthMarks = [];
      this.kpis = { count: 0, totalDays: 0, peakOutstanding: 0, avgGapPercent: 0, status: 'compliant' };
      this.todayX = null;
      this.timelineYearLabel = '';
      return;
    }

    const parsed = periods.map((p) => ({
      ...p,
      fromDateObj: this.toDate(p.fromDate),
      toDateObj: this.toDate(p.toDate)
    }));

    const minFrom = new Date(Math.min(...parsed.map((p) => p.fromDateObj.getTime())));
    const maxTo = new Date(Math.max(...parsed.map((p) => p.toDateObj.getTime())));
    const rangeStart = new Date(minFrom.getFullYear(), minFrom.getMonth(), 1);
    const rangeEnd = new Date(maxTo.getFullYear(), maxTo.getMonth() + 1, 1);
    const rangeDays = this.daysBetween(rangeStart, rangeEnd);
    const usableWidth = VIEWBOX_WIDTH - LEFT_PAD - RIGHT_PAD;
    const pxPerDay = rangeDays > 0 ? usableWidth / rangeDays : 0;

    this.timelineYearLabel =
      rangeStart.getFullYear() === maxTo.getFullYear()
        ? `${rangeStart.getFullYear()}`
        : `${rangeStart.getFullYear()} – ${maxTo.getFullYear()}`;

    this.monthMarks = this.buildMonthMarks(rangeStart, rangeEnd, pxPerDay);

    const today = this.settingsService.businessDate || new Date();
    let totalDays = 0;
    let peakOutstanding = 0;
    let gapSum = 0;
    let isCurrentlyInBreach = false;

    this.breachPeriods = parsed.map((p) => {
      const gap = p.outstandingAmount - p.minPaymentAmount;
      const gapPercent = p.minPaymentAmount > 0 ? (gap / p.minPaymentAmount) * 100 : 0;
      const severity: Severity =
        gapPercent < SEVERITY_MILD_THRESHOLD
          ? 'mild'
          : gapPercent <= SEVERITY_MODERATE_THRESHOLD
            ? 'moderate'
            : 'severe';

      const barX = LEFT_PAD + this.daysBetween(rangeStart, p.fromDateObj) * pxPerDay;
      const barWidth = Math.max(p.numberOfDays * pxPerDay, MIN_BAR_WIDTH);
      const heightRatio = Math.min(Math.max(gapPercent / HEIGHT_SCALE_MAX_PERCENT, 0), 1);
      const barHeight = MIN_BAR_HEIGHT + heightRatio * (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT);
      const barY = BASELINE_Y - barHeight;

      totalDays += p.numberOfDays;
      peakOutstanding = Math.max(peakOutstanding, p.outstandingAmount);
      gapSum += gapPercent;

      if (today >= p.fromDateObj && today <= p.toDateObj) {
        isCurrentlyInBreach = true;
      }

      return {
        ...p,
        severity,
        gapPercent,
        gapBarWidth: Math.min(Math.max(gapPercent, 0), 100),
        barX,
        barY,
        barWidth,
        barHeight,
        showLabel: barWidth >= LABEL_MIN_BAR_WIDTH
      };
    });

    this.kpis = {
      count: this.breachPeriods.length,
      totalDays,
      peakOutstanding,
      avgGapPercent: gapSum / this.breachPeriods.length,
      status: isCurrentlyInBreach ? 'in-breach' : 'resolved'
    };

    this.todayX =
      today >= rangeStart && today < rangeEnd ? LEFT_PAD + this.daysBetween(rangeStart, today) * pxPerDay : null;
  }

  private buildMonthMarks(rangeStart: Date, rangeEnd: Date, pxPerDay: number): MonthMark[] {
    const marks: MonthMark[] = [];
    const cursor = new Date(rangeStart);
    const locale = this.settingsService.language?.code || 'en';
    while (cursor < rangeEnd) {
      const nextMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
      const gridX = LEFT_PAD + this.daysBetween(rangeStart, cursor) * pxPerDay;
      const nextX = LEFT_PAD + this.daysBetween(rangeStart, nextMonth) * pxPerDay;
      marks.push({
        gridX,
        labelX: (gridX + nextX) / 2,
        label: cursor.toLocaleString(locale, { month: 'short' })
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return marks;
  }

  private daysBetween(start: Date, end: Date): number {
    return (end.getTime() - start.getTime()) / MS_PER_DAY;
  }

  private toDate(value: Date | number[] | string): Date {
    if (value instanceof Date) return value;
    return this.dateUtils.parseDate(value);
  }
}
