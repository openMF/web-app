/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Dates } from 'app/core/utils/dates';
import { LoanDelinquencyActionDialogComponent } from 'app/loans/custom-dialog/loan-delinquency-action-dialog/loan-delinquency-action-dialog.component';
import { LoansService } from 'app/loans/loans.service';
import {
  DelinquencyRangeSchedule,
  DelinquentData,
  InstallmentLevelDelinquency,
  LoanDelinquencyAction,
  LoanDelinquencyTags
} from 'app/loans/models/loan-account.model';
import { SettingsService } from 'app/settings/settings.service';
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';
import { Currency } from 'app/shared/models/general.model';
import { NgClass, CurrencyPipe } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatTooltip } from '@angular/material/tooltip';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { DatetimeFormatPipe } from '../../../pipes/datetime-format.pipe';
import { FormatNumberPipe } from '../../../pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanProductBaseComponent } from 'app/products/loan-products/common/loan-product-base.component';
import { LoanDelinquencyActionRescheduleDialogComponent } from 'app/loans/custom-dialog/loan-delinquency-action-reschedule-dialog/loan-delinquency-action-reschedule-dialog.component';
import { StringEnumOptionData } from 'app/shared/models/option-data.model';
import { ProductsService } from 'app/products/products.service';
import { LoanDelinquencyActionResetDialogComponent } from 'app/loans/custom-dialog/loan-delinquency-action-reset-dialog/loan-delinquency-action-reset-dialog.component';
import { LoanDelinquencyActionDisableDialogComponent } from 'app/loans/custom-dialog/loan-delinquency-action-disable-dialog/loan-delinquency-action-disable-dialog.component';

type DelinquencyActionStatus = 'active' | 'scheduled' | 'expired';
type DelinquencyActionFilter = 'all' | DelinquencyActionStatus;

interface DelinquencyActionRow {
  /** The action as returned by the backend, for the cells that render raw fields */
  raw: LoanDelinquencyAction;
  id: number;
  action: string;
  startDateObj: Date;
  endDateObj: Date | null;
  /** Whether the action type defines an end date at all (point-in-time actions and RESCHEDULE do not) */
  hasEndDate: boolean;
  status: DelinquencyActionStatus;
  statusLabelKey: string;
  isOngoing: boolean;
  durationDays: number;
  icon: string;
  badgeClass: string;
}

interface DelinquencyTimelineBar {
  label: string;
  status: DelinquencyActionStatus;
  x: number;
  width: number;
  midX: number;
  tooltip: string;
}

const TIMELINE_PADDING_LEFT = 60;
const TIMELINE_INNER_WIDTH = 1140;
const MS_PER_DAY = 86_400_000;

/** Actions that record a moment rather than a window, so they never carry an end date. */
const POINT_IN_TIME_ACTIONS = [
  'RESUME',
  'ENABLE',
  'UNDO_RESET'
];

@Component({
  selector: 'mifosx-loan-delinquency-tags-tab',
  templateUrl: './loan-delinquency-tags-tab.component.html',
  styleUrls: ['./loan-delinquency-tags-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    NgClass,
    MatTooltip,
    CurrencyPipe,
    DateFormatPipe,
    DatetimeFormatPipe,
    FormatNumberPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoanDelinquencyTagsTabComponent extends LoanProductBaseComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private loansServices = inject(LoansService);
  private productsServices = inject(ProductsService);
  private dateUtils = inject(Dates);
  private settingsService = inject(SettingsService);
  private translateService = inject(TranslateService);
  private cdr = inject(ChangeDetectorRef);
  dialog = inject(MatDialog);

  loanDelinquencyTags: LoanDelinquencyTags[] = [];
  loanDelinquencyActions = signal<LoanDelinquencyAction[]>([]);
  wcLoanDelinquencyRangeSchedule: DelinquencyRangeSchedule[] = [];
  currency: Currency;
  installmentLevelDelinquency: InstallmentLevelDelinquency[] = [];

  filter = signal<DelinquencyActionFilter>('all');

  filters: { value: DelinquencyActionFilter; label: string }[] = [
    { value: 'all', label: 'labels.buttons.All' },
    { value: 'active', label: 'labels.inputs.Active' },
    { value: 'scheduled', label: 'labels.inputs.Scheduled' },
    { value: 'expired', label: 'labels.inputs.Expired' }
  ];

  loanId: any;
  loanProductId: any;

  locale: string;
  dateFormat: string;

  frequencyTypeOptions: StringEnumOptionData[] = [];
  minimumPaymentTypeOptions: StringEnumOptionData[] = [];

  businessDate = computed<Date | null>(() => this.settingsService.businessDate);

  currentLoanDelinquencyAction = computed<LoanDelinquencyAction | null>(() => {
    const actions = this.loanDelinquencyActions();
    return actions.length > 0 ? actions[actions.length - 1] : null;
  });

  allowPause = computed<boolean>(() => {
    const current = this.currentLoanDelinquencyAction();
    if (current == null || this.loanProductService.isWorkingCapital) {
      return true;
    }
    return !this.isCurrentAndPauseAction(current);
  });

  /**
   * Whether the delinquency evaluation is currently disabled for this working capital loan.
   * Derived from the actions list: a `DISABLE` action with no (effective) end date is still in force.
   * While disabled, the backend rejects pause/resume/reschedule, so those actions are hidden.
   */
  isDelinquencyDisabled = computed<boolean>(() =>
    this.loanDelinquencyActions().some(
      (item) => item.action === 'DISABLE' && (item.effectiveEndDate ?? item.endDate) == null
    )
  );

  /**
   * Whether there is an active RESET that can still be undone.
   * Undo Reset is LIFO and only meaningful while a RESET remains open (endDate === null);
   * once a reset is undone the backend closes it by setting its endDate.
   */
  hasActiveReset = computed<boolean>(() =>
    this.loanDelinquencyActions().some((item) => item.action === 'RESET' && item.endDate == null)
  );

  /**
   * The delinquency actions decorated with everything the dashboard renders:
   * resolved dates, lifecycle status, duration and badge styling.
   */
  actionRows = computed<DelinquencyActionRow[]>(() => {
    const businessDate = this.businessDate();
    return this.loanDelinquencyActions().map((item) => {
      const isPointInTime = POINT_IN_TIME_ACTIONS.includes(item.action);
      const isReschedule = item.action === 'RESCHEDULE';
      const isResumedPause = item.action === 'PAUSE' && !!item.effectiveEndDate;
      const start = this.dateUtils.parseDate(item.startDate);
      const rawEnd = item.effectiveEndDate ?? item.endDate;
      // An action without an end date is an open window. parseDate turns a missing
      // value into today, which would render an open window as closing now.
      const end = isPointInTime || !rawEnd ? null : this.dateUtils.parseDate(rawEnd);
      const reference = end ?? businessDate ?? start;
      // Both boundary dates count: a pause from Jul 1st to Jul 16th lasts 16 days, not 15.
      // A pause closed by a RESUME is the exception: the loan is already active on the resume
      // date, so that day is not a paused day and must not be added.
      const elapsedDays = Math.round((reference.getTime() - start.getTime()) / MS_PER_DAY);
      const durationDays = Math.max(1, isResumedPause ? elapsedDays : elapsedDays + 1);
      const status = this.actionStatus(start, end);

      return {
        raw: item,
        id: item.id,
        action: item.action,
        startDateObj: start,
        endDateObj: end,
        hasEndDate: !isPointInTime && !isReschedule,
        status,
        statusLabelKey: this.statusKey(status),
        isOngoing: !end && status === 'active',
        durationDays,
        icon: this.actionIcon(item.action),
        badgeClass: this.actionBadgeClass(item.action)
      };
    });
  });

  filteredActionRows = computed<DelinquencyActionRow[]>(() => {
    const filter = this.filter();
    if (filter === 'all') {
      return this.actionRows();
    }
    return this.actionRows().filter((row) => row.status === filter);
  });

  pauseRows = computed<DelinquencyActionRow[]>(() => this.actionRows().filter((row) => row.action === 'PAUSE'));

  kpis = computed(() => {
    const rows = this.actionRows();
    const pauses = this.pauseRows();
    const lastAction = rows.length
      ? rows.reduce((latest, row) => (row.startDateObj.getTime() > latest.startDateObj.getTime() ? row : latest))
      : null;
    return {
      total: rows.length,
      activePauses: pauses.filter((row) => row.status === 'active').length,
      totalDaysPaused: pauses.reduce((sum, row) => sum + row.durationDays, 0),
      lastActionDate: lastAction?.startDateObj ?? null
    };
  });

  hasPauseActiveToday = computed<boolean>(() => this.pauseRows().some((row) => row.status === 'active'));

  maxDurationDays = computed<number>(() => {
    const rows = this.actionRows();
    if (rows.length === 0) {
      return 1;
    }
    return Math.max(...rows.map((row) => row.durationDays));
  });

  timelineYear = computed<number>(() => {
    const rows = this.actionRows();
    if (rows.length === 0) {
      return (this.businessDate() ?? new Date()).getFullYear();
    }
    return rows[0].startDateObj.getFullYear();
  });

  timelineBars = computed<DelinquencyTimelineBar[]>(() => {
    const year = this.timelineYear();
    const yearStart = new Date(year, 0, 1).getTime();
    const daysInYear = this.isLeapYear(year) ? 366 : 365;
    const pxPerDay = TIMELINE_INNER_WIDTH / daysInYear;
    const ongoingLabel = this.translateService.instant('labels.inputs.Ongoing');

    return this.pauseRows().map((row, index) => {
      const endRef = row.endDateObj ?? this.businessDate() ?? row.startDateObj;
      const startDay = this.clamp(Math.floor((row.startDateObj.getTime() - yearStart) / MS_PER_DAY), 0, daysInYear);
      const endDay = this.clamp(Math.floor((endRef.getTime() - yearStart) / MS_PER_DAY), 0, daysInYear);
      const x = TIMELINE_PADDING_LEFT + startDay * pxPerDay;
      const width = Math.max(8, (endDay - startDay) * pxPerDay);
      // The lane charts pauses only, so it numbers them consecutively: the index
      // within the full action list would skip numbers on every non-pause action.
      const label = `P${index + 1}`;
      const endLabel = row.endDateObj ? this.shortDate(row.endDateObj) : ongoingLabel;
      return {
        label,
        status: row.status,
        x,
        width,
        midX: x + width / 2,
        tooltip: `${label} · ${this.shortDate(row.startDateObj)} → ${endLabel} (${row.durationDays}d)`
      };
    });
  });

  todayMarker = computed<number | null>(() => {
    const businessDate = this.businessDate();
    const year = this.timelineYear();
    if (!businessDate || businessDate.getFullYear() !== year) {
      return null;
    }
    const yearStart = new Date(year, 0, 1).getTime();
    const daysInYear = this.isLeapYear(year) ? 366 : 365;
    const day = Math.floor((businessDate.getTime() - yearStart) / MS_PER_DAY);
    return TIMELINE_PADDING_LEFT + day * (TIMELINE_INNER_WIDTH / daysInYear);
  });

  monthGridLines = Array.from({ length: 13 }, (_, i) => {
    return TIMELINE_PADDING_LEFT + (i * TIMELINE_INNER_WIDTH) / 12;
  });

  monthLabels = this.dateUtils.monthLabels.map((name, i) => ({
    name,
    x: TIMELINE_PADDING_LEFT + (i * TIMELINE_INNER_WIDTH) / 12 + TIMELINE_INNER_WIDTH / 24
  }));

  constructor() {
    super();
    this.loanId = this.route.parent.parent.snapshot.params['loanId'];

    this.route.parent.data
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        (data: {
          loanDelinquencyTagsData: LoanDelinquencyTags[];
          loanDelinquencyData: any;
          loanDelinquencyActions: LoanDelinquencyAction[];
          wcLoanDelinquencyRangeSchedule: DelinquencyRangeSchedule[];
        }) => {
          this.loanDelinquencyTags = data.loanDelinquencyTagsData;
          this.setLoanDelinquencyAction(data.loanDelinquencyActions || []);
          const loanDelinquencyDataResponse = data.loanDelinquencyData ?? null;
          const loanDelinquencyData: DelinquentData | null = loanDelinquencyDataResponse?.delinquent || null;
          this.currency = loanDelinquencyDataResponse?.currency;
          this.installmentLevelDelinquency = [];
          if (loanDelinquencyData != null) {
            this.installmentLevelDelinquency = loanDelinquencyData.installmentLevelDelinquency || [];
          }
          if (loanDelinquencyDataResponse?.product) {
            this.loanProductId = loanDelinquencyDataResponse.product.id;
          }
          this.wcLoanDelinquencyRangeSchedule = data.wcLoanDelinquencyRangeSchedule || [];
          this.cdr.markForCheck();
        }
      );
  }

  ngOnInit(): void {
    this.locale = this.settingsService.language.code;
    this.dateFormat = this.settingsService.dateFormat;
    if (this.loanProductService.isWorkingCapital) {
      this.productsServices
        .getLoanProductsTemplate(this.loanProductService.loanProductPath)
        .subscribe((response: any) => {
          this.frequencyTypeOptions = response.periodFrequencyTypeOptions;
          this.minimumPaymentTypeOptions = response.delinquencyMinimumPaymentTypeOptions;
        });
    }
  }

  selectFilter(value: DelinquencyActionFilter): void {
    this.filter.set(value);
  }

  durationBarWidth(row: DelinquencyActionRow): number {
    const max = this.maxDurationDays();
    if (max === 0) {
      return 0;
    }
    return Math.min(100, Math.round((row.durationDays / max) * 100));
  }

  trackByRowId(_index: number, row: DelinquencyActionRow): number {
    return row.id;
  }

  trackByLabel(_index: number, bar: DelinquencyTimelineBar): string {
    return bar.label;
  }

  createDelinquencyAction(): void {
    const action = 'pause';
    const loanDelinquencyActionDialogRef = this.dialog.open(LoanDelinquencyActionDialogComponent, {
      data: {
        action: action
      }
    });
    loanDelinquencyActionDialogRef.afterClosed().subscribe((response: { data: any }) => {
      if (!response?.data) {
        return;
      }
      const startDate: Date = response.data.value.startDate;
      const endDate: Date = response.data.value.endDate;

      this.sendDelinquencyAction(action, startDate, endDate, null, null, null, null, null);
    });
  }

  createDelinquencyActionReschedule(): void {
    const action = 'reschedule';
    const loanDelinquencyActionDialogRef = this.dialog.open(LoanDelinquencyActionRescheduleDialogComponent, {
      data: {
        action: action,
        frequencyTypeOptions: this.frequencyTypeOptions,
        minimumPaymentTypeOptions: this.minimumPaymentTypeOptions
      }
    });
    loanDelinquencyActionDialogRef.afterClosed().subscribe((response: { data: any }) => {
      if (!response?.data) {
        return;
      }
      const minimumPayment: number = response.data.value.minimumPayment;
      const minimumPaymentType: string = response.data.value.minimumPaymentType;
      const frequency: number = response.data.value.frequency;
      const frequencyType: string = response.data.value.frequencyType;

      this.sendDelinquencyAction(
        action,
        null,
        null,
        minimumPayment,
        minimumPaymentType,
        frequency,
        frequencyType,
        null
      );
    });
  }

  createDelinquencyActionReset(): void {
    const action = 'reset';
    const loanDelinquencyActionDialogRef = this.dialog.open(LoanDelinquencyActionResetDialogComponent, {
      data: {
        action: action,
        startNewPeriod: false
      }
    });
    loanDelinquencyActionDialogRef.afterClosed().subscribe((response: { data: any }) => {
      if (response?.data) {
        const startNewPeriod: boolean = response.data.value.startNewPeriod;

        this.sendDelinquencyAction(action, null, null, null, null, null, null, startNewPeriod);
      }
    });
  }

  createDelinquencyActionUndoReset(): void {
    const action = 'undo_reset';
    const loanDelinquencyActionDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        heading: this.translateService.instant('labels.heading.Undo Reset'),
        dialogContext: this.translateService.instant(
          'labels.dialogContext.Are you sure you want to undo last reset action'
        )
      }
    });
    loanDelinquencyActionDialogRef.afterClosed().subscribe((response: { confirm: any }) => {
      if (response?.confirm) {
        this.sendDelinquencyAction(action, null, null, null, null, null, null, null);
      }
    });
  }

  createDelinquencyDisable(): void {
    this.confirmDelinquencyToggle('disable');
  }

  createDelinquencyEnable(): void {
    this.confirmDelinquencyToggle('enable');
  }

  /**
   * Opens the disable/enable confirmation dialog. The start date is always the current business date
   * (no backdating), so it is only displayed, and the action is submitted without an end date.
   */
  private confirmDelinquencyToggle(action: 'disable' | 'enable'): void {
    const dialogRef = this.dialog.open(LoanDelinquencyActionDisableDialogComponent, {
      data: {
        action,
        businessDate: this.businessDate()
      }
    });
    dialogRef.afterClosed().subscribe((response: { confirm: any }) => {
      if (response?.confirm) {
        this.sendDelinquencyAction(
          action,
          this.dateUtils.parseDate(this.businessDate()),
          null,
          null,
          null,
          null,
          null,
          null
        );
      }
    });
  }

  resumeDelinquencyClassification(item: LoanDelinquencyAction): void {
    const removePauseDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        heading: this.translateService.instant('labels.heading.Loan Delinquency Classification'),
        dialogContext:
          this.translateService.instant(
            'labels.dialogContext.Are you sure you want resume the Delinquency Classification for Loan'
          ) + this.loanId,
        type: 'Mild'
      }
    });
    removePauseDialogRef.afterClosed().subscribe((response: any) => {
      if (response?.confirm) {
        if (this.loanProductService.isLoanProduct) {
          this.sendDelinquencyAction('resume', null, null, null, null, null, null, null);
        } else {
          this.sendDelinquencyAction(
            'resume',
            this.dateUtils.parseDate(this.businessDate()),
            null,
            null,
            null,
            null,
            null,
            null
          );
        }
      }
    });
  }

  sendDelinquencyAction(
    action: string,
    startDate: Date | null,
    endDate: Date | null,
    minimumPayment: number | null,
    minimumPaymentType: string | null,
    frequency: number | null,
    frequencyType: string | null,
    startNewPeriod: boolean | null
  ): void {
    let payload: any = {
      action,
      locale: this.locale,
      dateFormat: this.dateFormat,
      startDate: this.dateUtils.formatDate(startDate, this.dateFormat)
    };
    if (action === 'pause') {
      payload = {
        action,
        locale: this.locale,
        dateFormat: this.dateFormat,
        startDate: this.dateUtils.formatDate(startDate, this.dateFormat),
        endDate: this.dateUtils.formatDate(endDate, this.dateFormat)
      };
    } else if (action === 'reschedule') {
      // Both groups are optional but the backend rejects explicit empty values,
      // so only the fields the user actually provided are sent.
      payload = { action, locale: this.locale };
      Object.entries({ minimumPayment, minimumPaymentType, frequency, frequencyType }).forEach(
        ([
          key,
          value
        ]) => {
          if (value !== null && value !== undefined && (value as any) !== '') {
            payload[key] = value;
          }
        }
      );
    } else if (action === 'reset') {
      payload = {
        action,
        locale: this.locale,
        startNewPeriod
      };
    } else if (action === 'undo_reset') {
      payload = {
        action,
        locale: this.locale,
        dateFormat: this.dateFormat
      };
    }

    this.loansServices
      .createDelinquencyActions(this.loanProductService.loanAccountPath, this.loanId, payload)
      .subscribe((result: any) => {
        this.loansServices
          .getDelinquencyActions(this.loanProductService.loanAccountPath, this.loanId)
          .subscribe((loanDelinquencyActions: LoanDelinquencyAction[]) => {
            this.setLoanDelinquencyAction(loanDelinquencyActions);
          });
        this.refreshDelinquencyRangeSchedule();
      });
  }

  /**
   * Re-fetches the working capital range schedule after a delinquency command succeeds.
   * The backend recomputes the whole schedule synchronously (expected amounts, period
   * boundaries, delinquency figures), but this table is seeded by a route resolver, so
   * without an explicit re-read it keeps rendering the pre-command snapshot. The full
   * array is replaced because a reschedule can renumber periods and change the row count.
   */
  private refreshDelinquencyRangeSchedule(): void {
    if (!this.loanProductService.isWorkingCapital) {
      return;
    }
    this.loansServices
      .getWorkingCapitalLoanDelinquencyRangeSchedule(this.loanId)
      .subscribe((rangeSchedule: DelinquencyRangeSchedule[]) => {
        this.wcLoanDelinquencyRangeSchedule = rangeSchedule || [];
        this.cdr.markForCheck();
      });
  }

  setLoanDelinquencyAction(loanDelinquencyActions: LoanDelinquencyAction[]): void {
    const sorted = [...(loanDelinquencyActions || [])].sort(
      (objA: LoanDelinquencyAction, objB: LoanDelinquencyAction) =>
        this.dateUtils.parseDate(objA.startDate).getTime() - this.dateUtils.parseDate(objB.startDate).getTime()
    );
    this.loanDelinquencyActions.set(sorted);
  }

  isCurrentAndPauseAction(item: LoanDelinquencyAction): boolean {
    return (
      this.currentLoanDelinquencyAction()?.id === item.id &&
      item.action === 'PAUSE' &&
      !this.dateUtils.isBefore(this.businessDate(), this.dateUtils.parseDate(item.startDate)) &&
      !this.dateUtils.isAfter(this.businessDate(), this.dateUtils.parseDate(item.effectiveEndDate ?? item.endDate))
    );
  }

  /** Whether the row offers the inline resume button. */
  canResume(row: DelinquencyActionRow): boolean {
    return this.isCurrentAndPauseAction(row.raw) && !this.isDelinquencyDisabled();
  }

  private actionIcon(action: string): string {
    switch (action) {
      case 'PAUSE':
        return 'pause';
      case 'RESUME':
      case 'ENABLE':
        return 'play';
      case 'DISABLE':
        return 'ban';
      default:
        return 'calendar';
    }
  }

  /**
   * Badge tint by intent: suppressing evaluation reads as an alert, restoring it
   * reads as positive, and everything else keeps the neutral blue.
   */
  private actionBadgeClass(action: string): string {
    if (action === 'DISABLE') {
      return 'action-badge--alert';
    }
    if (action === 'ENABLE' || action === 'RESUME') {
      return 'action-badge--positive';
    }
    return '';
  }

  private actionStatus(start: Date, end: Date | null): DelinquencyActionStatus {
    const businessDate = this.businessDate();
    if (!businessDate) {
      return 'active';
    }
    if (this.dateUtils.isBefore(businessDate, start)) {
      return 'scheduled';
    }
    if (end && this.dateUtils.isAfter(businessDate, end)) {
      return 'expired';
    }
    return 'active';
  }

  private statusKey(status: DelinquencyActionStatus): string {
    switch (status) {
      case 'active':
        return 'labels.inputs.Active';
      case 'scheduled':
        return 'labels.inputs.Scheduled';
      case 'expired':
        return 'labels.inputs.Expired';
    }
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
}
