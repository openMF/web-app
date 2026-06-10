/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CurrencyPipe, UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatSlideToggle, MatSlideToggleChange } from '@angular/material/slide-toggle';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatFooterCell,
  MatFooterCellDef,
  MatFooterRow,
  MatFooterRowDef,
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
import {
  Payment,
  ProjectedAmortizationSchedule
} from 'app/loans/models/working-capital/working-capital-loan-account.model';
import { DateFormatPipe } from 'app/pipes/date-format.pipe';
import { FormatNumberPipe } from 'app/pipes/format-number.pipe';
import { SettingsService } from 'app/settings/settings.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { TranslateService } from '@ngx-translate/core';
import { jsPDF, jsPDFOptions } from 'jspdf';
import autoTable from 'jspdf-autotable';

type PaymentStatus = 'disbursed' | 'executed' | 'current' | 'projected';

@Component({
  selector: 'mifosx-loan-amortization-schedule-tab',
  templateUrl: './loan-amortization-schedule-tab.component.html',
  styleUrl: './loan-amortization-schedule-tab.component.scss',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    CurrencyPipe,
    MatSlideToggle,
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
    MatFooterRow,
    DateFormatPipe,
    FormatNumberPipe,
    UpperCasePipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoanAmortizationScheduleTabComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private settingsService = inject(SettingsService);
  private dateUtils = inject(Dates);
  private translateService = inject(TranslateService);
  private cdr = inject(ChangeDetectorRef);

  amortizationSchedule: ProjectedAmortizationSchedule | null = null;
  dataSource = new MatTableDataSource<Payment>();
  currencyCode: string = '';
  hideProjected = false;
  groupExpectedSpan = 4;
  groupActualSpan = 0;
  groupHeaderColumns: string[] = [];

  executedCount = 0;
  currentCount = 0;
  projectedCount = 0;
  totalCount = 0;
  executedPercent = 0;
  currentPercent = 0;
  projectedPercent = 0;
  progressPercent = 0;

  private allPayments: Payment[] = [];
  private statusMap = new Map<number, PaymentStatus>();

  private readonly baseColumns: string[] = [
    'number',
    'status',
    'paymentDate',
    'expectedPaymentAmount',
    'expectedBalance',
    'expectedAmortizationAmount',
    'expectedDiscountFeeBalance'
  ];

  private readonly optionalColumns: { field: keyof Payment; column: string }[] = [
    { field: 'actualPaymentAmount', column: 'actualPaymentAmount' },
    { field: 'actualBalance', column: 'actualBalance' },
    { field: 'actualAmortizationAmount', column: 'actualAmortizationAmount' },
    { field: 'actualDiscountFeeBalance', column: 'actualDiscountFeeBalance' }
  ];

  displayedColumns: string[] = [...this.baseColumns];

  private readonly columnLabelKeys: Record<string, string> = {
    number: '#',
    paymentDate: 'labels.inputs.Payment Date',
    expectedPaymentAmount: 'labels.inputs.Payment Amount',
    expectedBalance: 'labels.inputs.Balance',
    expectedAmortizationAmount: 'labels.inputs.Amortization Amount',
    expectedDiscountFeeBalance: 'labels.inputs.Discount Fee Balance',
    actualPaymentAmount: 'labels.inputs.Payment',
    actualBalance: 'labels.inputs.Balance',
    actualAmortizationAmount: 'labels.inputs.Amortization',
    actualDiscountFeeBalance: 'labels.inputs.Discount Fee Balance'
  };

  currentBusinessDate: Date = this.settingsService.businessDate || new Date();

  ngOnInit(): void {
    this.route.data
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: { amortizationSchedule: ProjectedAmortizationSchedule }) => {
        this.amortizationSchedule = data.amortizationSchedule;
        this.allPayments = data.amortizationSchedule?.payments ?? [];
        this.computeStatuses();
        this.computeProgress();
        this.buildDisplayedColumns();
        this.applyFilter();
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

  getStatus(payment: Payment): PaymentStatus {
    return this.statusMap.get(payment.paymentNo) ?? 'projected';
  }

  statusTranslateKey(payment: Payment): string {
    const status = this.getStatus(payment);
    return `labels.inputs.${status.charAt(0).toUpperCase()}${status.slice(1)}`;
  }

  toggleHideProjected(event: MatSlideToggleChange): void {
    this.hideProjected = event.checked;
    this.applyFilter();
    this.cdr.markForCheck();
  }

  private computeStatuses(): void {
    this.statusMap.clear();
    for (const p of this.allPayments) {
      let status: PaymentStatus;
      p.paymentDate = this.dateUtils.parseDate(p.paymentDate);
      if (p.paymentNo === 0) {
        status = 'disbursed';
      } else if (p.paymentDate < this.currentBusinessDate || p.actualPaymentAmount != null || p.actualBalance != null) {
        status = 'executed';
      } else if (p.paymentDate > this.currentBusinessDate) {
        status = 'projected';
      } else {
        status = 'current';
      }
      this.statusMap.set(p.paymentNo, status);
    }
  }

  private computeProgress(): void {
    let executed = 0;
    let current = 0;
    let projected = 0;
    for (const p of this.allPayments) {
      const status = this.statusMap.get(p.paymentNo);
      if (status === 'disbursed' || status === 'executed') {
        executed++;
      } else if (status === 'current') {
        current++;
      } else {
        projected++;
      }
    }
    this.executedCount = executed;
    this.currentCount = current;
    this.projectedCount = projected;
    this.totalCount = this.allPayments.length;
    this.executedPercent = this.totalCount ? (executed / this.totalCount) * 100 : 0;
    this.currentPercent = this.totalCount ? (current / this.totalCount) * 100 : 0;
    this.projectedPercent = this.totalCount ? (projected / this.totalCount) * 100 : 0;
    this.progressPercent = this.executedPercent + this.currentPercent;
  }

  private applyFilter(): void {
    this.dataSource.data = this.hideProjected
      ? this.allPayments.filter((p) => this.getStatus(p) !== 'projected')
      : this.allPayments;
  }

  private buildDisplayedColumns(): void {
    const columns = [...this.baseColumns];
    const payments = this.allPayments;
    let actualSpan = 0;
    for (const { field, column } of this.optionalColumns) {
      if (payments.some((p) => p[field] != null)) {
        columns.push(column);
        actualSpan++;
      }
    }
    this.displayedColumns = columns;
    this.groupActualSpan = actualSpan;
    this.groupHeaderColumns = actualSpan > 0 ? [
            'grpBlank',
            'grpExpected',
            'grpActual'
          ] : [
            'grpBlank',
            'grpExpected'
          ];
  }

  exportToPDF(): void {
    const businessDate = this.dateUtils.formatDate(this.settingsService.businessDate, Dates.DEFAULT_DATEFORMAT);
    const fileName = `amortization-schedule-${businessDate}.pdf`;

    const options: jsPDFOptions = {
      orientation: 'l',
      unit: 'in',
      format: 'letter',
      precision: 2,
      compress: true,
      putOnlyUsedFonts: true
    };
    const pdf = new jsPDF(options);

    const columns = this.displayedColumns.map((col) => ({
      header: this.translateService.instant(this.columnLabelKeys[col] ?? col),
      dataKey: col
    }));

    const body = this.dataSource.data.map((payment) => {
      const row: Record<string, string | number> = {};
      for (const col of this.displayedColumns) {
        row[col] = this.getPaymentValue(payment, col);
      }
      return row;
    });

    autoTable(pdf, {
      columns,
      body,
      bodyStyles: { lineColor: [
          0,
          0,
          0
        ] },
      styles: { fontSize: 8, cellWidth: 'auto', halign: 'center' }
    });
    pdf.save(fileName);
  }

  private getPaymentValue(payment: Payment, column: string): string | number {
    const fmt = (v: number | undefined) =>
      v != null ? v.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 6 }) : '';
    switch (column) {
      case 'number':
        return payment.paymentNo;
      case 'status':
        return this.translateService.instant(this.statusTranslateKey(payment));
      case 'paymentDate':
        return payment.paymentDate ? this.dateUtils.formatDate(payment.paymentDate, Dates.DEFAULT_DATEFORMAT) : '';
      case 'expectedPaymentAmount':
        return fmt(payment.expectedPaymentAmount);
      case 'expectedBalance':
        return fmt(payment.expectedBalance);
      case 'actualBalance':
        return fmt(payment.actualBalance);
      case 'expectedAmortizationAmount':
        return fmt(payment.expectedAmortizationAmount);
      case 'actualPaymentAmount':
        return fmt(payment.actualPaymentAmount);
      case 'actualAmortizationAmount':
        return fmt(payment.actualAmortizationAmount);
      case 'expectedDiscountFeeBalance':
        return fmt(payment.expectedDiscountFeeBalance);
      case 'actualDiscountFeeBalance':
        return fmt(payment.actualDiscountFeeBalance);
      default:
        return '';
    }
  }
}
