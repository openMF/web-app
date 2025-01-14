import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Dates } from 'app/core/utils/dates';
import { RepaymentSchedulePeriod } from 'app/loans/models/loan-account.model';
import { SettingsService } from 'app/settings/settings.service';

import { jsPDF, jsPDFOptions } from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'mifosx-repayment-schedule-tab',
  templateUrl: './repayment-schedule-tab.component.html',
  styleUrls: ['./repayment-schedule-tab.component.scss']
})
export class RepaymentScheduleTabComponent implements OnInit {
  /** Currency Code */
  @Input() currencyCode: string;
  /** Loan Repayment Schedule to be Edited */
  @Input() forEditing = false;
  /** Loan Repayment Schedule Details Data */
  @Input() repaymentScheduleDetails: any = null;
  loanDetailsDataRepaymentSchedule: any = [];

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
    'due'
  ];

  /** Form functions event */
  @Output() editPeriod = new EventEmitter();

  businessDate: Date = new Date();

  /**
   * Retrieves the loans with associations data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(
    private route: ActivatedRoute,
    private settingsService: SettingsService,
    private dates: Dates
  ) {
    this.route.parent.data.subscribe((data: { loanDetailsData: any }) => {
      if (data.loanDetailsData) {
        this.currencyCode = data.loanDetailsData.currency.code;
      }
      this.loanDetailsDataRepaymentSchedule = data.loanDetailsData ? data.loanDetailsData.repaymentSchedule : [];
    });
    this.businessDate = this.settingsService.businessDate;
  }

  ngOnInit() {
    if (this.repaymentScheduleDetails == null) {
      this.repaymentScheduleDetails = this.loanDetailsDataRepaymentSchedule;
    }
    this.isWaived = this.repaymentScheduleDetails.totalWaived > 0;
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
      const fromDate = this.dates.parseDate(installment.fromDate);
      const dueDate = this.dates.parseDate(installment.dueDate);
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
    const businessDate = this.dates.formatDate(this.settingsService.businessDate, Dates.DEFAULT_DATEFORMAT);
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
}
