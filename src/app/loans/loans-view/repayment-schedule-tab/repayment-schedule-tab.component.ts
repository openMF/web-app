import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Dates } from 'app/core/utils/dates';
import {
  EditablePeriod,
  RepaymentSchedule,
  RepaymentSchedulePeriod,
  RepaymentScheduleEditCache,
  ScheduleChangeRecord,
  ScheduleDeleteRecord
} from 'app/loans/models/loan-account.model';
import { SettingsService } from 'app/settings/settings.service';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { DatepickerBase } from 'app/shared/form-dialog/formfield/model/datepicker-base';
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';

import { jsPDF, jsPDFOptions } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { NgClass, CurrencyPipe } from '@angular/common';
import { MatIconButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatFooterCellDef,
  MatFooterCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow,
  MatFooterRowDef,
  MatFooterRow
} from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { FormatNumberPipe } from '../../../pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-repayment-schedule-tab',
  templateUrl: './repayment-schedule-tab.component.html',
  styleUrls: ['./repayment-schedule-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatFooterCellDef,
    MatFooterCell,
    NgClass,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatFooterRowDef,
    MatFooterRow,
    MatIconButton,
    MatTooltip,
    CurrencyPipe,
    DateFormatPipe,
    FormatNumberPipe
  ]
})
export class RepaymentScheduleTabComponent implements OnInit, OnChanges {
  private route = inject(ActivatedRoute);
  private settingsService = inject(SettingsService);
  private dateUtils = inject(Dates);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  /** Currency Code */
  @Input() currencyCode: string;
  /** Loan Repayment Schedule to be Edited */
  @Input() forEditing = false;
  /** Loan Repayment Schedule Details Data */
  @Input() repaymentScheduleDetails: RepaymentSchedule | null = null;
  loanDetailsDataRepaymentSchedule: RepaymentSchedule | null = null;

  editCache: { [key: string]: RepaymentScheduleEditCache } = {};
  listOfData: RepaymentSchedulePeriod[] = [];

  repaymentSchedulePeriods: RepaymentSchedulePeriod[] = [];

  totalRepaymentExpected: number = 0;

  /** Stores if there is any waived amount */
  isWaived: boolean;
  /** Columns to be displayed in original schedule table. */
  displayedColumns: string[] = [
    'number',
    'days',
    'date',
    'paiddate',
    'check',
    'balanceOfLoan',
    'principalDue',
    'interest',
    'fees',
    'penalties',
    'due',
    'paid',
    'inadvance',
    'late',
    'waived',
    'outstanding'
  ];
  /** Columns to be displayed in editable schedule table. */
  displayedColumnsEdit: string[] = [
    'number',
    'date',
    'balanceOfLoan',
    'principalDue',
    'interest',
    'fees',
    'due',
    'actions'
  ];

  /** Emits the installment change so the editing parent can build the schedule variations payload. */
  @Output() editPeriod = new EventEmitter<ScheduleChangeRecord>();
  /** Emits the delete/restore toggle of an installment for `exceptions.deletedinstallments`. */
  @Output() deletePeriod = new EventEmitter<ScheduleDeleteRecord>();

  businessDate: Date = new Date();

  private destroyRef = inject(DestroyRef);

  /**
   * Retrieves the loans with associations data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor() {
    this.businessDate = this.settingsService.businessDate;
  }

  ngOnInit() {
    if (this.route.parent) {
      this.route.parent.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (data: { loanDetailsData: { repaymentSchedule?: RepaymentSchedule; currency?: { code: string } } }) => {
          this.loanDetailsDataRepaymentSchedule =
            data.loanDetailsData?.repaymentSchedule ?? this.getDefaultRepaymentSchedule();
          if (data.loanDetailsData?.currency?.code) {
            this.currencyCode = data.loanDetailsData.currency.code;
          }
          this.initializeRepaymentSchedule();
        },
        error: (err) => {
          console.error('Failed to load loan repayment schedule data:', err);
          this.loanDetailsDataRepaymentSchedule = this.getDefaultRepaymentSchedule();
          this.initializeRepaymentSchedule();
        }
      });
    } else {
      this.loanDetailsDataRepaymentSchedule = this.getDefaultRepaymentSchedule();
      this.initializeRepaymentSchedule();
    }
  }

  private initializeRepaymentSchedule(): void {
    if (!this.repaymentScheduleDetails) {
      this.repaymentScheduleDetails = this.loanDetailsDataRepaymentSchedule ?? this.getDefaultRepaymentSchedule();
    } else {
      this.repaymentScheduleDetails.periods ??= [];
      this.repaymentScheduleDetails.totalWaived ??= 0;
    }
    this.isWaived = (this.repaymentScheduleDetails.totalWaived ?? 0) > 0;
    this.updateEditCache();
  }

  private getDefaultRepaymentSchedule(): RepaymentSchedule {
    return {
      periods: [],
      totalWaived: 0,
      currency: {} as any,
      loanTermInDays: 0,
      totalPrincipalDisbursed: 0,
      totalPrincipalExpected: 0,
      totalPrincipalPaid: 0,
      totalInterestCharged: 0,
      totalFeeChargesCharged: 0,
      totalPenaltyChargesCharged: 0,
      totalWrittenOff: 0,
      totalRepaymentExpected: 0,
      totalRepayment: 0,
      totalPaidInAdvance: 0,
      totalPaidLate: 0,
      totalOutstanding: 0,
      totalCredits: 0
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['repaymentScheduleDetails'] && !changes['repaymentScheduleDetails'].firstChange) {
      this.initializeRepaymentSchedule();
    }
    this.totalRepaymentExpected = 0;
    this.listOfData.forEach((item) => {
      this.totalRepaymentExpected = this.totalRepaymentExpected + item.totalDueForPeriod;
    });
  }

  installmentStyle(installment: RepaymentSchedulePeriod): string {
    if (installment.complete) {
      return 'paid';
    }
    const isCurrent: string = this.isCurrent(installment);
    if (isCurrent !== '') {
      return isCurrent;
    }
    if (installment.isAdditional) {
      return 'additional';
    } else if (installment.downPaymentPeriod) {
      return 'downpayment';
    }
    return '';
  }

  isCurrent(installment: RepaymentSchedulePeriod): string {
    if (!installment.fromDate) {
      return '';
    } else {
      this.businessDate = this.settingsService.businessDate;
      const fromDate = this.dateUtils.parseDate(installment.fromDate);
      const dueDate = this.dateUtils.parseDate(installment.dueDate);
      if (fromDate <= this.businessDate && this.businessDate < dueDate) {
        return 'current';
      }
      if (this.businessDate > dueDate) {
        return 'overdued';
      }
    }
    return '';
  }

  exportToPDF() {
    const businessDate = this.dateUtils.formatDate(this.settingsService.businessDate, Dates.DEFAULT_DATEFORMAT);
    const fileName = `repaymentschedule-${businessDate}.pdf`;

    const options: jsPDFOptions = {
      orientation: 'l',
      unit: 'in',
      format: 'letter',
      precision: 2,
      compress: true,
      putOnlyUsedFonts: true
    };
    const pdf = new jsPDF(options);

    autoTable(pdf, {
      html: '#repaymentSchedule',
      bodyStyles: { lineColor: [
          0,
          0,
          0
        ] },
      styles: {
        fontSize: 8,
        cellWidth: 'auto',
        halign: 'center'
      }
    });
    pdf.save(fileName);
  }

  editInstallment(period: RepaymentSchedulePeriod): void {
    const periods = this.repaymentScheduleDetails?.periods;
    if (!period.period || !periods) {
      return;
    }
    const editable = period as EditablePeriod;
    if (editable.deleted) {
      return;
    }
    // The variations API identifies installments by their unmodified due date,
    // so keep the original values across repeated edits of the same row.
    editable.originalDueDate ??= this.dateUtils.formatDate(period.dueDate, this.settingsService.dateFormat);
    editable.originalTotalDueForPeriod ??= period.totalDueForPeriod;
    editable.originalDueDateValue ??= period.dueDate;

    // Fineract requires distinct, ascending due dates, so bound the picker between neighbors.
    const index = periods.indexOf(period);
    const previousPeriod = index > 0 ? periods[index - 1] : null;
    const nextPeriod = index >= 0 && index < periods.length - 1 ? periods[index + 1] : null;
    const minDate = previousPeriod ? this.shiftDays(this.dateUtils.parseDate(previousPeriod.dueDate), 1) : undefined;
    const maxDate = nextPeriod
      ? this.shiftDays(this.dateUtils.parseDate(nextPeriod.dueDate), -1)
      : this.shiftDays(this.dateUtils.parseDate(period.dueDate), 366);

    const formfields: FormfieldBase[] = [
      new DatepickerBase({
        controlName: 'dueDate',
        label: 'Due Date',
        value: this.dateUtils.parseDate(period.dueDate),
        type: 'date',
        required: true,
        minDate: minDate,
        maxDate: maxDate
      }),
      new InputBase({
        controlName: 'installmentAmount',
        label: 'Installment Amount',
        value: period.totalDueForPeriod,
        type: 'number',
        required: true
      })
    ];

    const data = {
      title: `Period ${period.period} - ${editable.originalDueDate}`,
      formfields: formfields
    };
    const editDialogRef = this.dialog.open(FormDialogComponent, { data, width: '50rem' });
    editDialogRef
      .afterClosed()
      .subscribe((response: { data?: { value?: { dueDate?: Date; installmentAmount?: number } } }) => {
        const value = response?.data?.value;
        if (!value) {
          return;
        }
        const amount = Number(value.installmentAmount);
        if (Number.isFinite(amount) && amount > 0) {
          period.totalDueForPeriod = amount;
        }
        if (value.dueDate instanceof Date) {
          period.dueDate = [
            value.dueDate.getFullYear(),
            value.dueDate.getMonth() + 1,
            value.dueDate.getDate()
          ];
        }

        const displayDueDate = this.dateUtils.formatDate(period.dueDate, this.settingsService.dateFormat);
        const change: ScheduleChangeRecord = { dueDate: editable.originalDueDate };
        if (period.totalDueForPeriod !== editable.originalTotalDueForPeriod) {
          change.installmentAmount = period.totalDueForPeriod;
        }
        if (displayDueDate !== editable.originalDueDate) {
          change.modifiedDueDate = displayDueDate;
        }
        editable.changed = change.installmentAmount !== undefined;
        editable.dueDateChanged = change.modifiedDueDate !== undefined;
        this.editPeriod.emit(change);
        // Dialog close happens outside this component's template events, so OnPush needs an explicit mark.
        this.cdr.markForCheck();
      });
  }

  private shiftDays(date: Date, days: number): Date {
    const shifted = new Date(date);
    shifted.setDate(shifted.getDate() + days);
    return shifted;
  }

  /**
   * Marks an installment for deletion (or restores it). Deleting reverts any
   * pending row edit first so a due date never appears in both the
   * `modifiedinstallments` and `deletedinstallments` variation arrays.
   */
  toggleDeleteInstallment(period: RepaymentSchedulePeriod): void {
    if (!period.period) {
      return;
    }
    const editable = period as EditablePeriod;
    editable.originalDueDate ??= this.dateUtils.formatDate(period.dueDate, this.settingsService.dateFormat);
    editable.originalTotalDueForPeriod ??= period.totalDueForPeriod;
    editable.originalDueDateValue ??= period.dueDate;

    if (!editable.deleted) {
      period.totalDueForPeriod = editable.originalTotalDueForPeriod;
      period.dueDate = editable.originalDueDateValue;
      editable.changed = false;
      editable.dueDateChanged = false;
    }
    editable.deleted = !editable.deleted;
    this.deletePeriod.emit({ dueDate: editable.originalDueDate, deleted: editable.deleted });
    this.cdr.markForCheck();
  }

  /** Totals of the editable schedule, excluding installments marked for deletion. */
  editTotals(): { principal: number; interest: number; fees: number; due: number } {
    const totals = { principal: 0, interest: 0, fees: 0, due: 0 };
    (this.repaymentScheduleDetails?.periods ?? []).forEach((period) => {
      if (!period.period || (period as EditablePeriod).deleted) {
        return;
      }
      totals.principal += period.principalDue || 0;
      totals.interest += period.interestOriginalDue || 0;
      totals.fees += period.feeChargesDue || 0;
      totals.due += period.totalDueForPeriod || 0;
    });
    return totals;
  }

  /** True when the principal spread across the remaining installments covers the loan amount. */
  principalCoversLoan(): boolean {
    return Math.abs(this.editTotals().principal - (this.repaymentScheduleDetails?.totalPrincipalExpected ?? 0)) < 0.005;
  }

  updateEditCache(): void {
    if (this.repaymentScheduleDetails?.periods) {
      this.listOfData = this.repaymentScheduleDetails.periods;
      this.totalRepaymentExpected = 0;
      this.listOfData.forEach((item) => {
        this.editCache[item.period] = {
          edit: false,
          data: { ...item }
        };
        this.totalRepaymentExpected = this.totalRepaymentExpected + item.totalDueForPeriod;
      });
    }
  }

  numberOnly(inputFormControl: { value: string }, event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode === 46) {
      if (!(inputFormControl.value.indexOf('.') > -1)) {
        return true;
      }
      return false;
    } else if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
}
