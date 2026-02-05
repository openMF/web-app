/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

/** Custom Services */
import { HomeService } from '../../home.service';
import { ThemingService } from 'app/shared/theme-toggle/theming.service';

/** Charting Imports */
import { Chart, registerables } from 'chart.js';
import { MatCard, MatCardHeader, MatCardContent } from '@angular/material/card';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { NgStyle } from '@angular/common';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

// Register Chart.js components
Chart.register(...registerables);

/**
 * Amount Disbursed Pie Chart Component
 */
@Component({
  selector: 'mifosx-amount-disbursed-pie',
  templateUrl: './amount-disbursed-pie.component.html',
  styleUrls: ['./amount-disbursed-pie.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCardHeader,
    FaIconComponent,
    NgStyle
  ]
})
export class AmountDisbursedPieComponent implements OnInit {
  private homeService = inject(HomeService);
  private route = inject(ActivatedRoute);
  private themingService = inject(ThemingService);
  private destroyRef = inject(DestroyRef);

  /** Static Form control for office Id */
  officeId = new UntypedFormControl();
  /** Office Data */
  officeData: any;
  /** Chart.js chart */
  chart: any;
  /** Substitute for resolver */
  hideOutput = true;
  /** Shows fallback element */
  showFallback = true;

  /**
   * Fetches offices data from `resolve`.
   * @param {HomeService} homeService Home Service.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { offices: any }) => {
      this.officeData = data.offices;
    });
  }

  /**
   * Sets the pie chart with initial office Id 1.
   * Initialize with office Id 1 for better UX.
   */
  ngOnInit() {
    this.getChartData();
    this.officeId.patchValue(1);
    this.subscribeToThemeChanges();
  }

  /**
   * Subscribe to theme changes and update chart colors accordingly.
   */
  subscribeToThemeChanges() {
    this.themingService.theme.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (this.chart) {
        this.updateChartColors();
      }
    });
  }

  /**
   * Update chart colors based on current theme.
   */
  updateChartColors() {
    const isDarkTheme = document.body.classList.contains('dark-theme');
    this.chart.options.plugins.legend.labels.color = isDarkTheme ? '#ffffff' : '#9d9d9d';
    this.chart.update();
  }

  /**
   * Subscribes to value changes of office Id fetches chart data accordingly.
   */
  getChartData() {
    this.officeId.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value: number) => {
      this.homeService
        .getDisbursedAmount(value)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((response: any) => {
          const data = Object.entries(response[0]).map((entry) => entry[1]);
          if (!(data[0] === 0 && data[1] === 0)) {
            this.setChart(data);
            this.showFallback = false;
            this.hideOutput = false;
          } else {
            this.showFallback = true;
            this.hideOutput = true;
          }
        });
    });
  }

  /**
   * Creates an instance of Chart.js pie chart
   * Refer: https://www.chartjs.org/docs/latest/charts/doughnut.html for configuration details.
   * @param {any} data Chart Data.
   */
  setChart(data: any) {
    if (!this.chart) {
      this.chart = new Chart('disbursement-pie', {
        type: 'doughnut',
        data: {
          labels: [
            'Pending',
            'Disbursed'
          ],
          datasets: [
            {
              backgroundColor: [
                'dodgerblue',
                'red'
              ],
              data: data
            }
          ]
        },
        options: {
          plugins: {
            legend: {
              labels: {
                color: document.body.classList.contains('dark-theme') ? '#ffffff' : '#9d9d9d'
              }
            }
          },
          layout: {
            padding: {
              top: 10,
              bottom: 15
            }
          }
        }
      });
    } else {
      this.chart.data.datasets[0].data = data;
      this.updateChartColors();
    }
  }
}
