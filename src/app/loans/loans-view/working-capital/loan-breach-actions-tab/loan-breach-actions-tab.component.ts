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
import {
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
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from 'app/core/alert/alert.service';
import { Dates } from 'app/core/utils/dates';
import { LoanBreachActionResetDialogComponent } from 'app/loans/custom-dialog/loan-breach-action-reset-dialog/loan-breach-action-reset-dialog.component';
import { LoanDelinquencyActionDialogComponent } from 'app/loans/custom-dialog/loan-delinquency-action-dialog/loan-delinquency-action-dialog.component';
import { LoansService } from 'app/loans/loans.service';
import { LoanDelinquencyAction } from 'app/loans/models/loan-account.model';
import { SettingsService } from 'app/settings/settings.service';
import { DatetimeFormatPipe } from 'app/pipes/datetime-format.pipe';
import { FormatNumberPipe } from 'app/pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanProductBaseComponent } from 'app/products/loan-products/common/loan-product-base.component';
import {
  WorkingCapitalBreachAction,
  WorkingCapitalBreachToggleRequest,
  WorkingCapitalNearBreachActions
} from 'app/loans/models/working-capital/working-capital-loan-account.model';
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';
import { ErrorHandlerService } from 'app/core/error-handler/error-handler.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  BreachToggleDialogComponent,
  BreachToggleDialogData,
  BreachToggleDialogResult
} from '../loan-account-actions/breach-toggle-dialog/breach-toggle-dialog.component';
import { resolveBreachErrorKey } from '../breach-error-messages';
import { findActiveBreachDisable } from '../breach-evaluation';
import { resolveBreachActionErrorMessage } from '../breach-action-error.helper';

type BreachActionStatus = 'active' | 'scheduled' | 'expired';
type BreachActionFilter = 'all' | BreachActionStatus;

interface BreachActionRow {
  id: number;
  action: string;
  startDate: number[];
  endDate: number[];
  startDateObj: Date;
  endDateObj: Date | null;
  /** Whether the action type defines an end date at all (RESUME and RESCHEDULE do not) */
  hasEndDate: boolean;
  status: BreachActionStatus;
  statusLabelKey: string;
  isOngoing: boolean;
  isResumedPause: boolean;
  durationDays: number;
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
    FaIconComponent,
    DatetimeFormatPipe,
    FormatNumberPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoanBreachActionsTabComponent extends LoanProductBaseComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private loansService = inject(LoansService);
  private dateUtils = inject(Dates);
  private settingsService = inject(SettingsService);
  private translateService = inject(TranslateService);
  private errorHandler = inject(ErrorHandlerService);
  private alertService = inject(AlertService);
  private changeDetectorRef = inject(ChangeDetectorRef);
  dialog = inject(MatDialog);

  // Pause dashboard state
  breachActions = signal<LoanDelinquencyAction[]>([]);
  filter = signal<BreachActionFilter>('all');
  resetInFlight = signal(false);

  loanId: string;
  locale: string;
  dateFormat: string;

  // Breach & Near Breach lists
  loanDetails: any;
  breachActionsList: WorkingCapitalBreachAction[] = [];
  nearBreachActions: WorkingCapitalNearBreachActions[] = [];

  breachActionsColumns: string[] = [
    'identifier',
    'action',
    'startDate',
    'minimumPayment',
    'frequency'
  ];
  nearBreachActionsColumns: string[] = [
    'identifier',
    'action',
    'threshold',
    'frequency',
    'submittedOnDate'
  ];

  rows = computed<BreachActionRow[]>(() => {
    const businessDate = this.settingsService.businessDate;
    return this.breachActions().map((item) => {
      // RESUME and ENABLE mark a moment rather than a window.
      const isPointInTime = item.action === 'RESUME' || item.action === 'ENABLE';
      const isRescheduleAction = item.action === 'RESCHEDULE';
      const isResumedPause = item.action === 'PAUSE' && !!item.effectiveEndDate;
      const start = this.dateUtils.parseDate(item.startDate);
      const rawEnd = item.effectiveEndDate ?? item.endDate;
      // Any action without an end date is an open window: an open DISABLE, but also
      // a RESCHEDULE, which never carries one. Parsing the missing value would yield
      // today for an absent field and an invalid date for an explicit null, and the
      // resulting NaN propagates through the status and the duration bars.
      const end = isPointInTime || !rawEnd ? null : this.dateUtils.parseDate(rawEnd);
      const reference = end ?? businessDate;
      // Both boundary dates count: a pause from Jul 1st to Jul 16th lasts 16 days, not 15.
      // A pause closed by a RESUME is the exception: the loan is already active on the resume
      // date, so that day is not a paused day and must not be added.
      const elapsedDays = Math.round((reference.getTime() - start.getTime()) / MS_PER_DAY);
      const durationDays = Math.max(1, isResumedPause ? elapsedDays : elapsedDays + 1);

      let status: BreachActionStatus;
      if (isPointInTime) {
        status = 'active';
      } else if (!end) {
        status = start.getTime() <= businessDate.getTime() ? 'active' : 'scheduled';
      } else if (start.getTime() < businessDate.getTime() && end.getTime() < businessDate.getTime()) {
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
        hasEndDate: !isPointInTime && !isRescheduleAction,
        status,
        statusLabelKey: this.statusKey(status),
        isOngoing: !end && status === 'active',
        isResumedPause: isResumedPause,
        durationDays
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
    const pauseRows = rows.filter((row) => row.action === 'PAUSE');
    const activeCount = pauseRows.filter((row) => row.status === 'active').length;
    const totalDays = pauseRows.reduce((sum, row) => sum + row.durationDays, 0);
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

  hasActivePause = computed<boolean>(() =>
    this.rows().some((r) => r.action === 'PAUSE' && r.status === 'active' && !r.isResumedPause)
  );

  hasPauseActiveToday = computed<boolean>(() => this.rows().some((r) => r.action === 'PAUSE' && r.status === 'active'));

  /** DISABLE window covering the business date, if any. */
  activeBreachDisable = computed<BreachActionRow | null>(() =>
    findActiveBreachDisable(this.rows(), this.settingsService.businessDate)
  );

  /** True while breach evaluation is suspended for this loan. */
  breachEvaluationDisabled = computed<boolean>(() => this.activeBreachDisable() !== null);

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
    const ongoingLabel = this.translateService.instant('labels.inputs.Ongoing');

    return this.rows()
      .filter((row) => row.action === 'PAUSE')
      .map((row, index) => {
        const endRef = row.endDateObj ?? today;
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
    this.loanProductService.initialize(LoanProductBaseComponent.resolveProductTypeDefault(this.route, 'loan'));
    this.loanId = this.route.parent.snapshot.params['loanId'];

    this.route.parent.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { loanDetailsData: any }) => {
      this.loanDetails = data.loanDetailsData;
    });

    this.route.data
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        (data: {
          loanBreachActions: WorkingCapitalBreachAction[];
          loanNearBreachActions: WorkingCapitalNearBreachActions[];
        }) => {
          this.breachActionsList = data.loanBreachActions || [];
          this.nearBreachActions = data.loanNearBreachActions || [];
          this.setBreachActions((data.loanBreachActions as LoanDelinquencyAction[]) || []);
        }
      );
  }

  ngOnInit(): void {
    this.locale = this.settingsService.language.code;
    this.dateFormat = this.settingsService.dateFormat;
  }

  get breachEnabled(): boolean {
    return this.loanProductService.isWorkingCapital && this.loanDetails?.breach != null;
  }

  get nearBreachEnabled(): boolean {
    return this.loanProductService.isWorkingCapital && this.loanDetails?.nearBreach != null;
  }

  /**
   * Whether disabling or enabling breach evaluation applies at all. The backend
   * rejects the action with loan.is.not.active or no.breach.configuration, so
   * both conditions are checked here instead of surfacing an avoidable error.
   */
  get breachToggleAvailable(): boolean {
    return this.breachEnabled && this.loanDetails?.status?.active === true;
  }

  loanAction(actionName: string): void {
    this.router.navigate(
      [
        '../actions',
        actionName
      ],
      {
        queryParams: { productType: this.loanProductService.productType.value },
        relativeTo: this.route,
        state: { data: this.loanDetails }
      }
    );
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

  createBreachActionReset(): void {
    const dialogRef = this.dialog.open(LoanBreachActionResetDialogComponent, {
      data: { action: 'reset' }
    });
    dialogRef.afterClosed().subscribe((response: { data: any }) => {
      if (response?.data) {
        this.sendBreachResetAction(!!response.data.value.restartPeriodFromResetDate);
      }
    });
  }

  resumeBreachAction(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        heading: this.translateService.instant('labels.buttons.Resume Breach'),
        dialogContext: this.translateService.instant(
          'labels.dialogContext.Are you sure you want to resume the breach pause'
        )
      }
    });
    dialogRef.afterClosed().subscribe((response: { data: any }) => {
      if (!response) {
        return;
      }
      const businessDate = this.settingsService.businessDate;
      this.sendResumeBreachAction(businessDate);
    });
  }

  sendResumeBreachAction(startDate: Date): void {
    const payload = {
      action: 'resume',
      locale: this.locale,
      dateFormat: this.dateFormat,
      startDate: this.dateUtils.formatDate(startDate, this.dateFormat)
    };

    this.loansService.createBreachAction(this.loanId, payload).subscribe(() => {
      this.loansService.getBreachActions(this.loanId).subscribe((breachActions: LoanDelinquencyAction[]) => {
        this.setBreachActions(breachActions);
      });
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

  sendBreachResetAction(restartPeriodFromResetDate: boolean): void {
    const payload = {
      action: 'reset',
      locale: this.locale,
      dateFormat: this.dateFormat,
      restartPeriodFromResetDate
    };

    this.resetInFlight.set(true);
    this.loansService.createBreachAction(this.loanId, payload).subscribe({
      // resetInFlight is intentionally not released on success: reload()
      // re-navigates and recreates the component, so releasing it earlier
      // would re-enable the button against stale state before the reload lands.
      next: () => this.reload(),
      error: (error: unknown) => {
        // The interceptor already alerts with the raw backend message; this
        // supersedes it with the translated breach-action message when one exists.
        const message = resolveBreachActionErrorMessage(error, this.translateService);
        if (message) {
          this.alertService.alert({
            type: this.translateService.instant('errors.error.bad.request.type'),
            message
          });
        }
        this.resetInFlight.set(false);
      }
    });
  }

  /**
   * Opens the confirmation dialog and suspends or resumes breach evaluation.
   *
   * The action is derived from the current state so the two are never offered
   * at the same time.
   */
  toggleBreachEvaluation(): void {
    const action: 'disable' | 'enable' = this.breachEvaluationDisabled() ? 'enable' : 'disable';
    const businessDate = this.settingsService.businessDate;
    this.dialog
      .open<BreachToggleDialogComponent, BreachToggleDialogData, BreachToggleDialogResult>(
        BreachToggleDialogComponent,
        {
          data: { action, businessDate }
        }
      )
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (!result?.confirm) {
          return;
        }
        // endDate is deliberately absent: the backend rejects it for both actions.
        const payload: WorkingCapitalBreachToggleRequest = {
          action,
          startDate: this.dateUtils.formatDate(businessDate, this.dateFormat),
          dateFormat: this.dateFormat,
          locale: this.locale
        };
        this.loansService
          .toggleWorkingCapitalBreachEvaluation(this.loanId, payload)
          .pipe(
            catchError((error) => this.handleBreachError(error)),
            takeUntilDestroyed(this.destroyRef)
          )
          .subscribe({
            next: () => this.refreshBreachData(),
            // Already surfaced by the error handler.
            error: () => undefined
          });
      });
  }

  /**
   * Reloads the breach actions and the breach schedule after a successful
   * toggle, so the history, the disabled badge and the schedule all reflect the
   * recalculation the backend performs on enable.
   *
   * The breach and near-breach result lists are reloaded too: they arrive from
   * the route resolver, which does not re-run on a toggle, so without this they
   * would keep showing the evaluation from before the action.
   */
  private refreshBreachData(): void {
    this.loansService
      .getBreachActions(this.loanId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((breachActions: LoanDelinquencyAction[]) => {
        this.breachActionsList = (breachActions as WorkingCapitalBreachAction[]) || [];
        this.setBreachActions(breachActions);
        // breachActionsList is a plain field, so OnPush needs to be told it changed.
        this.changeDetectorRef.markForCheck();
      });
    this.loansService
      .getWorkingCapitalLoanNearBreachActions(this.loanId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((nearBreachActions: WorkingCapitalNearBreachActions[]) => {
        this.nearBreachActions = nearBreachActions || [];
        this.changeDetectorRef.markForCheck();
      });
    this.loansService
      .getWorkingCapitalLoanBreachSchedule(this.loanId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  /**
   * Reports a breach failure.
   *
   * Known validation codes become a translated business rule alert; anything
   * else falls back to the shared HTTP handler, which already covers
   * connectivity, authorisation and server errors.
   * @param error Failed HTTP response
   */
  private handleBreachError(error: HttpErrorResponse): Observable<never> {
    const key = resolveBreachErrorKey(error);
    if (!key) {
      return this.errorHandler.handleError(error, 'Breach Evaluation');
    }
    this.alertService.alert({
      type: this.translateService.instant('errors.loans.businessRule'),
      message: this.translateService.instant(key)
    });
    return throwError(() => error);
  }

  setBreachActions(breachActions: LoanDelinquencyAction[]): void {
    const sorted = [...(breachActions || [])].sort(
      (a, b) => this.dateUtils.parseDate(a.startDate).getTime() - this.dateUtils.parseDate(b.startDate).getTime()
    );
    this.breachActions.set(sorted);
  }

  /** Icon representing a breach action type in the history table. */
  actionIcon(action: string): string {
    switch (action) {
      case 'RESUME':
      case 'ENABLE':
        return 'play';
      case 'RESCHEDULE':
        return 'calendar';
      case 'DISABLE':
        return 'ban';
      default:
        return 'pause';
    }
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
