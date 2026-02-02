/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, inject, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MatCard, MatCardHeader, MatCardContent, MatCardTitle } from '@angular/material/card';
import { Chart, registerables } from 'chart.js';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

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
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatCardTitle
  ]
})
export class LoanAccountDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);
  private langChangeSubscription?: Subscription;
  private routeDataSubscription?: Subscription;

  @ViewChild('statusChart', { static: false }) statusChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('paymentsChart', { static: false }) paymentsChartCanvas!: ElementRef<HTMLCanvasElement>;

  private statusChart: any;
  private paymentsChart: any;
  private initTimeout: number | null = null;

  /** Loan data */
  loanData: any;
  loanId: string = '';

  /** Metrics */
  principalAmount: number = 0;
  totalRepaid: number = 0;
  outstandingBalance: number = 0;
  interestCharged: number = 0;
  totalExpected: number = 0;
  progressPercentage: number = 0;

  ngOnInit(): void {
    this.loanId = this.route.parent?.snapshot.paramMap.get('loanId') || '';

    this.routeDataSubscription = this.route.parent!.data.subscribe((data: { loanDetailsData: any }) => {
      if (data.loanDetailsData) {
        this.loanData = data.loanDetailsData;
        this.calculateMetrics();
        this.initTimeout = window.setTimeout(() => {
          this.createStatusChart();
          this.createPaymentsChart();
        }, 100);
      }
    });

    this.langChangeSubscription = this.translate.onLangChange.subscribe(() => {
      if (this.statusChart) {
        this.createStatusChart();
      }
      if (this.paymentsChart) {
        this.createPaymentsChart();
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.createStatusChart();
      this.createPaymentsChart();
    }, 100);
  }

  calculateMetrics(): void {
    if (!this.loanData) return;

    this.principalAmount = this.loanData.principal || 0;
    this.totalRepaid = this.loanData.summary?.totalRepayment || 0;
    this.outstandingBalance = this.loanData.summary?.totalOutstanding || 0;
    this.interestCharged = this.loanData.summary?.interestCharged || 0;
    this.totalExpected = this.loanData.summary?.totalExpectedRepayment || 0;

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

    const repaidPercentage = Math.min(
      100,
      Math.max(0, this.totalExpected > 0 ? (this.totalRepaid / this.totalExpected) * 100 : 0)
    );
    const outstandingPercentage = Math.max(0, 100 - repaidPercentage);

    this.statusChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: [
          this.translate.instant('labels.inputs.Total Repaid'),
          this.translate.instant('labels.inputs.Outstanding Balance')
        ],
        datasets: [
          {
            data: [
              repaidPercentage,
              outstandingPercentage
            ],
            backgroundColor: [
              '#4CAF50',
              '#FF9800'
            ],
            borderWidth: 0,
            borderColor: 'transparent',
            hoverBorderWidth: 3,
            hoverBorderColor: '#fff'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1.5,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
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
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
      }
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

    const repaymentSchedule = this.loanData?.repaymentSchedule?.periods || [];
    const labels: string[] = [];
    const principalData: number[] = [];
    const interestData: number[] = [];

    repaymentSchedule.forEach((period: any) => {
      if (period.period && period.period > 0) {
        labels.push(`${this.translate.instant('labels.inputs.Period')} ${period.period}`);
        principalData.push(period.principalDue || 0);
        interestData.push(period.interestDue || 0);
      }
    });

    this.paymentsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels.slice(0, 10),
        datasets: [
          {
            label: this.translate.instant('labels.inputs.Principal'),
            data: principalData.slice(0, 10),
            backgroundColor: '#2196F3',
            borderWidth: 0,
            borderRadius: 8,
            barThickness: 24
          },
          {
            label: this.translate.instant('labels.inputs.Interest'),
            data: interestData.slice(0, 10),
            backgroundColor: '#FFC107',
            borderWidth: 0,
            borderRadius: 8,
            barThickness: 24
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 15,
              font: {
                size: 13,
                weight: '600'
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
              font: {
                size: 11
              }
            }
          },
          y: {
            stacked: true,
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
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
    if (this.initTimeout !== null) {
      clearTimeout(this.initTimeout);
      this.initTimeout = null;
    }
    if (this.routeDataSubscription) {
      this.routeDataSubscription.unsubscribe();
    }
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
    if (this.statusChart) {
      this.statusChart.destroy();
    }
    if (this.paymentsChart) {
      this.paymentsChart.destroy();
    }
  }
}
