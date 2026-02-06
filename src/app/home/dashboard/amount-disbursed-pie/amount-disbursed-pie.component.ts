/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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

  /** Current theme */
  private currentTheme = 'light-theme';

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
    this.route.data.subscribe((data: { offices: any }) => {
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
    // Subscribe to theme changes to update chart legend colors
    this.themingService.theme.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((theme) => {
      this.currentTheme = theme;
      if (this.chart) {
        this.updateChartColors();
      }
    });
  }

  /**
   * Subscribes to value changes of office Id fetches chart data accordingly.
   */
  getChartData() {
    this.officeId.valueChanges.subscribe((value: number) => {
      this.homeService.getDisbursedAmount(value).subscribe((response: any) => {
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
    const legendColor = this.getLegendColor();

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
                color: legendColor
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
      this.chart.update();
    }
  }

  /**
   * Gets the legend color based on the current theme.
   */
  private getLegendColor(): string {
    return this.currentTheme === 'dark-theme' ? 'white' : '#666';
  }

  /**
   * Updates chart colors based on the current theme.
   */
  updateChartColors() {
    const legendColor = this.getLegendColor();

    if (this.chart?.options?.plugins?.legend?.labels) {
      this.chart.options.plugins.legend.labels.color = legendColor;
      this.chart.update();
    }
  }
}
