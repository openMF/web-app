/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MatCard, MatCardHeader, MatCardContent, MatCardTitle } from '@angular/material/card';
import { Chart, registerables } from 'chart.js';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { ThemingService } from 'app/shared/theme-toggle/theming.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

Chart.register(...registerables);

/**
 * Savings Account Dashboard Component
 * Displays graphical analysis and metrics for a specific savings account
 */
@Component({
  selector: 'mifosx-savings-account-dashboard',
  standalone: true,
  templateUrl: './savings-account-dashboard.component.html',
  styleUrls: ['./savings-account-dashboard.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatCardTitle
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SavingsAccountDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);
  private themingService = inject(ThemingService);

  @ViewChild('balanceTrendChart', { static: false }) balanceTrendChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('txnSplitChart', { static: false }) txnSplitChartCanvas!: ElementRef<HTMLCanvasElement>;

  private balanceTrendChart: any;
  private txnSplitChart: any;
  private isViewInitialized = false;

  /** Savings data */
  savingsAccountData: any;

  /** Metrics */
  currentBalance: number = 0;
  availableBalance: number = 0;
  totalDeposits: number = 0;
  totalWithdrawals: number = 0;
  interestEarned: number = 0;
  currencyCode: string = '';
  currencySymbol: string = '';
  accountNo: string = '';
  productName: string = '';
  activatedOn: string = '';
  interestRate: number = 0;

  /** Recent transactions */
  recentTransactions: any[] = [];

  /** Balance trend data */
  balanceDates: string[] = [];
  balanceValues: number[] = [];

  ngOnInit(): void {
    this.route.parent?.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { savingsAccountData: any }) => {
      if (data.savingsAccountData) {
        this.savingsAccountData = data.savingsAccountData;
        this.calculateMetrics();
        this.processTransactions();
        if (this.isViewInitialized) {
          this.createBalanceTrendChart();
          this.createTxnSplitChart();
        }
      }
    });

    this.translate.onLangChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (this.isViewInitialized && this.savingsAccountData) {
        this.createBalanceTrendChart();
        this.createTxnSplitChart();
      }
    });

    this.themingService.theme.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (this.isViewInitialized && this.savingsAccountData) {
        setTimeout(() => {
          this.createBalanceTrendChart();
          this.createTxnSplitChart();
        }, 50);
      }
    });
  }

  ngAfterViewInit(): void {
    this.isViewInitialized = true;
    if (this.savingsAccountData) {
      this.createBalanceTrendChart();
      this.createTxnSplitChart();
    }
  }

  calculateMetrics(): void {
    if (!this.savingsAccountData) return;

    const summary = this.savingsAccountData.summary || {};
    this.currentBalance = summary.accountBalance || 0;
    this.availableBalance = summary.availableBalance || summary.accountBalance || 0;
    this.totalDeposits = summary.totalDeposits || 0;
    this.totalWithdrawals = summary.totalWithdrawals || 0;
    this.interestEarned = summary.totalInterestEarned || 0;
    this.currencyCode = this.savingsAccountData.currency?.code || 'USD';
    this.currencySymbol = this.savingsAccountData.currency?.displaySymbol || '$';
    this.accountNo = this.savingsAccountData.accountNo || '';
    this.productName = this.savingsAccountData.savingsProductName || '';
    this.interestRate = this.savingsAccountData.nominalAnnualInterestRate || 0;

    const timeline = this.savingsAccountData.timeline;
    if (timeline?.activatedOnDate) {
      const d = timeline.activatedOnDate;
      if (Array.isArray(d) && d.length >= 3) {
        this.activatedOn = `${d[2]}/${d[1]}/${d[0]}`;
      }
    }
  }

  processTransactions(): void {
    const transactions = this.savingsAccountData?.transactions || [];

    // Recent transactions (last 8)
    this.recentTransactions = transactions.slice(0, 8);

    this.balanceDates = [];
    this.balanceValues = [];

    // Prepend activation date with 0 balance to draw a trend line if transactions exist
    if (transactions.length > 0) {
      const timeline = this.savingsAccountData?.timeline;
      if (timeline?.activatedOnDate) {
        const d = timeline.activatedOnDate;
        if (Array.isArray(d) && d.length >= 3) {
          this.balanceDates.push(`${d[2]}/${d[1]}`);
          this.balanceValues.push(0);
        }
      }
    }

    // Balance trend — walk transactions in chronological order
    const chronological = [...transactions].reverse();
    chronological.forEach((txn: any) => {
      if (txn.date && txn.runningBalance !== undefined) {
        const date = txn.date;
        let dateStr = '';
        if (Array.isArray(date) && date.length >= 3) {
          dateStr = `${date[2]}/${date[1]}`;
        } else {
          dateStr = String(date);
        }
        this.balanceDates.push(dateStr);
        this.balanceValues.push(txn.runningBalance);
      }
    });
  }

  getTransactionTypeLabel(txn: any): string {
    if (!txn?.transactionType) return '';
    return txn.transactionType.value || '';
  }

  isDebit(txn: any): boolean {
    if (!txn?.transactionType) return false;
    return (
      txn.transactionType.withdrawal === true ||
      txn.transactionType.feeDeduction === true ||
      txn.transactionType.overdraftInterest === true ||
      txn.transactionType.withholdTax === true
    );
  }

  formatTxnDate(txn: any): string {
    if (!txn?.date) return '';
    const d = txn.date;
    if (Array.isArray(d) && d.length >= 3) {
      const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
      ];
      return `${d[2]} ${months[d[1] - 1]} ${d[0]}`;
    }
    return String(d);
  }

  createBalanceTrendChart(): void {
    if (!this.balanceTrendChartCanvas) return;

    if (this.balanceTrendChart) {
      this.balanceTrendChart.destroy();
    }

    const canvas = this.balanceTrendChartCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isDark = document.body.classList.contains('dark-theme');

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 250);
    gradient.addColorStop(0, isDark ? 'rgba(59, 130, 246, 0.35)' : 'rgba(37, 99, 235, 0.22)');
    gradient.addColorStop(1, 'rgba(37, 99, 235, 0.00)');

    this.balanceTrendChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.balanceDates,
        datasets: [
          {
            label: this.translate.instant('labels.inputs.Balance') || 'Balance',
            data: this.balanceValues,
            backgroundColor: gradient,
            borderColor: isDark ? '#3b82f6' : '#2563eb',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: this.balanceValues.length > 20 ? 0 : 5,
            pointHoverRadius: 7,
            pointBackgroundColor: isDark ? '#3b82f6' : '#2563eb',
            pointBorderColor: isDark ? '#1e2124' : '#ffffff',
            pointBorderWidth: 2,
            pointHoverBorderColor: isDark ? '#1e2124' : '#ffffff',
            pointHoverBorderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(15, 23, 42, 0.9)',
            padding: 12,
            titleFont: { size: 13, weight: 'bold' },
            bodyFont: { size: 12 },
            callbacks: {
              label: (context: any) => {
                const value = context.parsed.y || 0;
                return `${this.currencySymbol}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: isDark ? '#94a3b8' : '#64748b',
              font: { size: 10, weight: '500' },
              maxRotation: 0,
              minRotation: 0,
              autoSkip: true,
              maxTicksLimit: 8
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
              drawBorder: false,
              borderDash: [
                4,
                4
              ]
            },
            ticks: {
              color: isDark ? '#94a3b8' : '#64748b',
              font: { size: 10, weight: '500' },
              callback: (value: any) => {
                return `${this.currencySymbol}${Number(value).toLocaleString()}`;
              }
            }
          }
        }
      }
    });
  }

  createTxnSplitChart(): void {
    if (!this.txnSplitChartCanvas) return;

    if (this.txnSplitChart) {
      this.txnSplitChart.destroy();
    }

    const canvas = this.txnSplitChartCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isDark = document.body.classList.contains('dark-theme');

    const depositLabel = this.translate.instant('labels.inputs.Total Deposits') || 'Deposits';
    const withdrawalLabel = this.translate.instant('labels.inputs.Total Withdrawls') || 'Withdrawals';
    const interestLabel = this.translate.instant('labels.inputs.Interest Earned') || 'Interest Earned';

    this.txnSplitChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: [
          depositLabel,
          withdrawalLabel,
          interestLabel
        ],
        datasets: [
          {
            data: [
              this.totalDeposits,
              this.totalWithdrawals,
              this.interestEarned
            ],
            backgroundColor: [
              '#2563eb',
              '#f43f5e',
              '#8b5cf6'
            ],
            borderWidth: 4,
            borderColor: isDark ? '#1e2124' : '#ffffff',
            borderRadius: 6,
            hoverBorderWidth: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              font: { size: 11, weight: '500' },
              color: isDark ? '#e2e8f0' : '#64748b',
              usePointStyle: true,
              pointStyle: 'circle',
              generateLabels: (chart: any) => {
                const data = chart.data;
                if (data.labels.length && data.datasets.length) {
                  return data.labels.map((label: string, i: number) => {
                    const value = data.datasets[0].data[i];
                    return {
                      text: `${label}: ${this.currencySymbol}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                      fillStyle: data.datasets[0].backgroundColor[i],
                      fontColor: isDark ? '#e2e8f0' : '#64748b',
                      hidden: false,
                      index: i
                    };
                  });
                }
                return [];
              }
            }
          },
          tooltip: {
            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(15, 23, 42, 0.9)',
            padding: 12,
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 13 },
            callbacks: {
              label: (context: any) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                return `${label}: ${this.currencySymbol}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
              }
            }
          }
        }
      },
      plugins: [
        {
          id: 'centerText',
          beforeDraw: (chart: any) => {
            const { ctx: c, chartArea } = chart;
            if (!chartArea) return;
            const width = chartArea.right - chartArea.left;
            const height = chartArea.bottom - chartArea.top;
            c.restore();

            const valFontSize = Math.round(height * 0.11);
            c.font = `600 ${valFontSize}px 'DM Sans', sans-serif`;
            c.textBaseline = 'bottom';
            c.textAlign = 'center';
            const text = `${this.currencySymbol}${this.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
            const textX = chartArea.left + width / 2;
            const textY = chartArea.top + height / 2;
            c.fillStyle = isDark ? '#ffffff' : '#0f172a';
            c.fillText(text, textX, textY - 2);

            const labelFontSize = Math.round(height * 0.05);
            c.font = `700 ${labelFontSize}px 'DM Sans', sans-serif`;
            c.textBaseline = 'top';
            c.fillStyle = isDark ? '#94a3b8' : '#64748b';
            c.fillText('NET BALANCE', textX, textY + 8);

            c.save();
          }
        }
      ]
    });
  }

  ngOnDestroy(): void {
    if (this.balanceTrendChart) {
      this.balanceTrendChart.destroy();
      this.balanceTrendChart = null;
    }
    if (this.txnSplitChart) {
      this.txnSplitChart.destroy();
      this.txnSplitChart = null;
    }
  }
}
