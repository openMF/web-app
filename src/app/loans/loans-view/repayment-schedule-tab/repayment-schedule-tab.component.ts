import {
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
  RepaymentSchedule,
  RepaymentSchedulePeriod,
  RepaymentScheduleEditCache
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

  /** Form functions event */
  @Output() editPeriod = new EventEmitter();

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
    if (!period.period) {
      return;
    }
    this.editCache[period.period].edit = true;
    const formfields: FormfieldBase[] = [
      new DatepickerBase({
        controlName: 'dueDate',
        label: 'Due Date',
        value: this.dateUtils.parseDate(period.dueDate),
        type: 'date',
        required: true
      }),
      new InputBase({
        controlName: 'principalDue',
        label: 'Amount',
        value: period.principalDue,
        type: 'number',
        required: true
      })
    ];

    const data = {
      title: 'Period',
      formfields: formfields
    };
    const addDialogRef = this.dialog.open(FormDialogComponent, { data, width: '50rem' });
    addDialogRef.afterClosed().subscribe((response: { data?: { value?: Record<string, unknown> } }) => {
      if (response.data) {
      }
    });
  }

  cancelEdit(id: string): void {
    const index = this.listOfData.findIndex((item) => item.period?.toString() === id);
    if (index === -1) {
      return;
    }
    this.editCache[id] = {
      data: { ...this.listOfData[index] },
      edit: false
    };
  }

  saveEdit(period: string): void {
    const index = this.listOfData.findIndex((item) => item.period?.toString() === period);
    if (index === -1) {
      return;
    }
    Object.assign(this.listOfData[index], this.editCache[period].data);
    this.editCache[period].edit = false;
    this.editPeriod.emit(period);
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
