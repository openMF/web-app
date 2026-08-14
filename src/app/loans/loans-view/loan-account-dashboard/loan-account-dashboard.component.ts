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
 * Loan Account Dashboard Component
 * Displays graphical analysis and metrics for a specific loan account
 */
@Component({
  selector: 'mifosx-loan-account-dashboard',
  standalone: true,
  templateUrl: './loan-account-dashboard.component.html',
  styleUrls: ['./loan-account-dashboard.component.scss'],
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
export class LoanAccountDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);
  private themingService = inject(ThemingService);

  @ViewChild('statusChart', { static: false }) statusChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('paymentsChart', { static: false }) paymentsChartCanvas!: ElementRef<HTMLCanvasElement>;

  private statusChart: any;
  private paymentsChart: any;
  private isViewInitialized = false;

  /** Loan data */
  loanData: any;
  loanId: string = '';

  /** Metrics */
  principalAmount: number = 0;
  totalRepaid: number = 0;
  outstandingBalance: number = 0;
  interestCharged: number = 0;
  totalOverdue: number = 0;
  totalExpected: number = 0;
  progressPercentage: number = 0;
  currencyCode: string = '';
  currencySymbol: string = '';

  ngOnInit(): void {
    this.loanId = this.route.parent?.snapshot.paramMap.get('loanId') || '';

    this.route.parent?.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { loanDetailsData: any }) => {
      if (data.loanDetailsData) {
        this.loanData = data.loanDetailsData;
        this.calculateMetrics();
        if (this.isViewInitialized) {
          this.createStatusChart();
          this.createPaymentsChart();
        }
      }
    });

    this.translate.onLangChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (this.isViewInitialized && this.loanData) {
        this.createStatusChart();
        this.createPaymentsChart();
      }
    });

    this.themingService.theme.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (this.isViewInitialized && this.loanData) {
        setTimeout(() => {
          this.createStatusChart();
          this.createPaymentsChart();
        }, 50);
      }
    });
  }

  ngAfterViewInit(): void {
    this.isViewInitialized = true;
    if (this.loanData) {
      this.createStatusChart();
      this.createPaymentsChart();
    }
  }

  calculateMetrics(): void {
    if (!this.loanData) return;

    this.principalAmount = this.loanData.principal || 0;
    this.totalRepaid = this.loanData.summary?.totalRepayment || 0;
    this.outstandingBalance = this.loanData.summary?.totalOutstanding || 0;
    this.interestCharged = this.loanData.summary?.interestCharged || 0;
    this.totalOverdue = this.loanData.summary?.totalOverdue || 0;
    this.totalExpected = this.loanData.summary?.totalExpectedRepayment || 0;
    this.currencyCode = this.loanData.currency?.code || 'USD';
    this.currencySymbol = this.loanData.currency?.displaySymbol || '$';

    if (this.totalExpected === 0) {
      this.progressPercentage = 0;
    } else {
      this.progressPercentage = Math.min(100, Math.max(0, (this.totalRepaid / this.totalExpected) * 100));
    }
  }

  createStatusChart(): void {
    if (!this.statusChartCanvas) return;

    if (this.statusChart) {
      this.statusChart.destroy();
    }

    const canvas = this.statusChartCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isDark = document.body.classList.contains('dark-theme');

    const repaidPercentage = Math.min(
      100,
      Math.max(0, this.totalExpected > 0 ? (this.totalRepaid / this.totalExpected) * 100 : 0)
    );
    const overduePercentage = Math.min(
      100,
      Math.max(0, this.totalExpected > 0 ? (this.totalOverdue / this.totalExpected) * 100 : 0)
    );
    const outstandingPercentage = Math.max(0, 100 - repaidPercentage - overduePercentage);

    this.statusChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: [
          this.translate.instant('labels.inputs.Total Repaid'),
          this.translate.instant('labels.inputs.Over Due') || 'Over Due',
          this.translate.instant('labels.inputs.Outstanding Balance')
        ],
        datasets: [
          {
            data: [
              repaidPercentage,
              overduePercentage,
              outstandingPercentage
            ],
            backgroundColor: [
              '#10b981',
              '#ef4444',
              '#2563eb'
            ],
            borderWidth: 0,
            borderColor: 'transparent',
            hoverBorderWidth: 3,
            hoverBorderColor: isDark ? '#1e2124' : '#ffffff'
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
              color: isDark ? '#e2e8f0' : '#475569',
              font: {
                size: 13,
                weight: '600'
              },
              usePointStyle: true,
              pointStyle: 'circle',
              generateLabels: (chart: any) => {
                const data = chart.data;
                if (data.labels.length && data.datasets.length) {
                  return data.labels.map((label: string, i: number) => {
                    const value = data.datasets[0].data[i];
                    return {
                      text: `${label}: ${value.toFixed(1)}%`,
                      fillStyle: data.datasets[0].backgroundColor[i],
                      fontColor: isDark ? '#e2e8f0' : '#475569',
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
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 13
            },
            callbacks: {
              label: function (context: any) {
                const label = context.label || '';
                const value = context.parsed || 0;
                return `${label}: ${value.toFixed(1)}%`;
              }
            }
          }
        }
      },
      plugins: [
        {
          id: 'loanCenterText',
          afterDraw: (chart: any) => {
            const { ctx: c, chartArea } = chart;
            if (!chartArea) return;
            const width = chartArea.right - chartArea.left;
            const height = chartArea.bottom - chartArea.top;
            c.save();

            // Draw Percentage value
            const valFontSize = Math.round(Math.min(width, height) * 0.13);
            c.font = `600 ${valFontSize}px 'DM Sans', sans-serif`;
            c.textBaseline = 'bottom';
            c.textAlign = 'center';
            const text = `${this.progressPercentage.toFixed(1)}%`;
            const textX = chartArea.left + width / 2;
            const textY = chartArea.top + height / 2;
            c.fillStyle = isDark ? '#ffffff' : '#0f172a';
            c.fillText(text, textX, textY - 2);

            // Draw Sub-label "REPAID"
            const labelFontSize = Math.round(Math.min(width, height) * 0.055);
            c.font = `700 ${labelFontSize}px 'DM Sans', sans-serif`;
            c.textBaseline = 'top';
            c.fillStyle = isDark ? '#94a3b8' : '#64748b';
            c.fillText('REPAID', textX, textY + 8);

            c.restore();
          }
        }
      ]
    });
  }

  createPaymentsChart(): void {
    if (!this.paymentsChartCanvas) return;

    if (this.paymentsChart) {
      this.paymentsChart.destroy();
    }

    const canvas = this.paymentsChartCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isDark = document.body.classList.contains('dark-theme');

    const repaymentSchedule = this.loanData?.repaymentSchedule?.periods || [];
    const labels: string[] = [];
    const principalData: number[] = [];
    const interestData: number[] = [];

    repaymentSchedule.forEach((period: any) => {
      if (period.period && period.period > 0) {
        labels.push(`${this.translate.instant('labels.inputs.Period')} ${period.period}`);
        principalData.push(period.principalDue ?? period.principalOriginalDue ?? 0);
        interestData.push(period.interestDue ?? period.interestOriginalDue ?? 0);
      }
    });

    this.paymentsChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: this.translate.instant('labels.inputs.Principal'),
            data: principalData,
            backgroundColor: isDark ? 'rgba(37, 99, 235, 0.35)' : 'rgba(37, 99, 235, 0.15)',
            borderColor: '#2563eb',
            borderWidth: 2.5,
            fill: true,
            tension: 0.3,
            pointRadius: labels.length > 20 ? 0 : 3.5,
            pointHoverRadius: 5.5,
            pointBackgroundColor: '#2563eb'
          },
          {
            label: this.translate.instant('labels.inputs.Interest'),
            data: interestData,
            backgroundColor: isDark ? 'rgba(245, 158, 11, 0.25)' : 'rgba(245, 158, 11, 0.12)',
            borderColor: '#f59e0b',
            borderWidth: 2.5,
            fill: true,
            tension: 0.3,
            pointRadius: labels.length > 20 ? 0 : 3.5,
            pointHoverRadius: 5.5,
            pointBackgroundColor: '#f59e0b'
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
            position: 'top',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 15,
              color: isDark ? '#e2e8f0' : '#334155',
              font: {
                size: 13,
                weight: '600'
              }
            }
          },
          tooltip: {
            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(15, 23, 42, 0.9)',
            padding: 12,
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 13
            },
            callbacks: {
              label: function (context: any) {
                const label = context.dataset.label || '';
                const value = context.parsed.y || 0;
                return `${label}: ${value.toLocaleString()}`;
              }
            }
          }
        },
        scales: {
          x: {
            stacked: true,
            grid: {
              display: false
            },
            ticks: {
              color: isDark ? '#94a3b8' : '#64748b',
              font: {
                size: 10
              },
              maxRotation: 45,
              minRotation: 0,
              autoSkip: true,
              maxTicksLimit: 15
            }
          },
          y: {
            stacked: true,
            beginAtZero: true,
            grid: {
              color: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              color: isDark ? '#94a3b8' : '#64748b',
              font: {
                size: 11
              }
            }
          }
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.statusChart) {
      this.statusChart.destroy();
      this.statusChart = null;
    }
    if (this.paymentsChart) {
      this.paymentsChart.destroy();
      this.paymentsChart = null;
    }
  }
}
