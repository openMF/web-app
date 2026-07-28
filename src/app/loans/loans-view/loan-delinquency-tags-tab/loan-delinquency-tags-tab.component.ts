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

type DelinquencyActionStatus = 'active' | 'scheduled' | 'expired';

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

@Component({
  selector: 'mifosx-loan-delinquency-tags-tab',
  templateUrl: './loan-delinquency-tags-tab.component.html',
  styleUrls: ['./loan-delinquency-tags-tab.component.scss'],
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
  loanDelinquencyTagsColumns: string[] = [
    'classification',
    'addedOn',
    'liftedOn'
  ];
  loanDelinquencyActionsColumns: string[] = [];
  installmentDelinquencyTagsColumns: string[] = [
    'classification',
    'minimumAgeDays',
    'amount'
  ];
  loanDelinquencyRangeScheduleColumns: string[] = [
    'periodNumber',
    'fromDate',
    'toDate',
    'expectedAmount',
    'paidAmount',
    'outstandingAmount',
    'delinquentDays',
    'delinquentAmount',
    'minPaymentCriteriaMet'
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

  timelineYear = computed<number>(() => {
    const actions = this.loanDelinquencyActions();
    if (actions.length === 0) {
      return (this.businessDate() ?? new Date()).getFullYear();
    }
    return this.dateUtils.parseDate(actions[0].startDate).getFullYear();
  });

  timelineBars = computed<DelinquencyTimelineBar[]>(() => {
    const year = this.timelineYear();
    const yearStart = new Date(year, 0, 1).getTime();
    const daysInYear = this.isLeapYear(year) ? 366 : 365;
    const pxPerDay = TIMELINE_INNER_WIDTH / daysInYear;
    const ongoingLabel = this.translateService.instant('labels.inputs.Ongoing');

    return this.loanDelinquencyActions()
      .filter((item) => item.action === 'PAUSE')
      .map((item, index) => {
        const start = this.dateUtils.parseDate(item.startDate);
        const endDate = item.effectiveEndDate ?? item.endDate;
        const end = endDate ? this.dateUtils.parseDate(endDate) : null;
        const endRef = end ?? this.businessDate() ?? start;
        const durationDays = Math.max(1, Math.round((endRef.getTime() - start.getTime()) / MS_PER_DAY));
        const startDay = this.clamp(Math.floor((start.getTime() - yearStart) / MS_PER_DAY), 0, daysInYear);
        const endDay = this.clamp(Math.floor((endRef.getTime() - yearStart) / MS_PER_DAY), 0, daysInYear);
        const x = TIMELINE_PADDING_LEFT + startDay * pxPerDay;
        const width = Math.max(8, (endDay - startDay) * pxPerDay);
        const label = `P${index + 1}`;
        const tooltip = `${label} · ${this.shortDate(start)} → ${end ? this.shortDate(end) : ongoingLabel} (${durationDays}d)`;
        return {
          label,
          status: this.actionStatus(start, end),
          x,
          width,
          midX: x + width / 2,
          tooltip
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
    this.loanDelinquencyActionsColumns = this.loanProductService.isWorkingCapital ? [
          'identifier',
          'action',
          'startDate',
          'endDate',
          'minimumPayment',
          'frequency',
          'actions'
        ] : [
          'identifier',
          'action',
          'startDate',
          'endDate',
          'createdOn',
          'actions'
        ];

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
          this.wcLoanDelinquencyRangeSchedule = data.wcLoanDelinquencyRangeSchedule;
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

  createDelinquencyAction(): void {
    const action = 'pause';
    const loanDelinquencyActionDialogRef = this.dialog.open(LoanDelinquencyActionDialogComponent, {
      data: {
        action: action
      }
    });
    loanDelinquencyActionDialogRef.afterClosed().subscribe((response: { data: any }) => {
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
      if (response.confirm) {
        this.sendDelinquencyAction(action, null, null, null, null, null, null, null);
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
      if (response.confirm) {
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
      payload = {
        action,
        locale: this.locale,
        minimumPayment,
        minimumPaymentType,
        frequency,
        frequencyType
      };
    } else if (action === 'reset') {
      payload = {
        action,
        locale: this.locale,
        startNewPeriod
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

  actionClass(action: string): string {
    if (action === 'PAUSE') {
      return 'status-pending';
    }
    return 'status-active';
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
