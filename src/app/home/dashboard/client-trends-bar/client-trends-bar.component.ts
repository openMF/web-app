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

/** rxjs Imports */
import { forkJoin, merge } from 'rxjs';
import { skip } from 'rxjs/operators';

/** Custom Services */
import { HomeService } from '../../home.service';
import { ThemingService } from 'app/shared/theme-toggle/theming.service';

/** Charting Imports */
import { Dates } from 'app/core/utils/dates';
import { Chart, registerables } from 'chart.js';
import { MatCard, MatCardHeader, MatCardContent } from '@angular/material/card';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { NgStyle } from '@angular/common';
import { MatButtonToggleGroup, MatButtonToggle } from '@angular/material/button-toggle';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

// Register Chart.js components
Chart.register(...registerables);

/**
 * Client Trends Bar Chart Component.
 */
@Component({
  selector: 'mifosx-client-trends-bar',
  templateUrl: './client-trends-bar.component.html',
  styleUrls: ['./client-trends-bar.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCardHeader,
    FaIconComponent,
    NgStyle,
    MatButtonToggleGroup,
    MatButtonToggle
  ]
})
export class ClientTrendsBarComponent implements OnInit {
  private homeService = inject(HomeService);
  private route = inject(ActivatedRoute);
  private dateUtils = inject(Dates);
  private themingService = inject(ThemingService);
  private destroyRef = inject(DestroyRef);

  /** Current theme */
  private currentTheme = 'light-theme';

  /** Static Form control for office Id */
  officeId = new UntypedFormControl();
  /** Static Form control for time scale */
  timescale = new UntypedFormControl();
  /** Office Data */
  officeData: any;
  /** Chart.js chart */
  chart: any;
  /** Substitute for resolver */
  hideOutput = true;

  /**
   * Fetches offices data from `resolve`
   * @param {HomeService} homeService Home Service
   * @param {ActivatedRoute} route Activated Route
   * @param {Dates} dateUtils Date Utils
   */
  constructor() {
    this.route.data.subscribe((data: { offices: any }) => {
      this.officeData = data.offices;
    });
  }

  ngOnInit() {
    this.getChartData();
    this.initializeControls();
    // Subscribe to theme changes to update chart legend colors
    this.themingService.theme.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((theme) => {
      this.currentTheme = theme;
      if (this.chart) {
        this.updateChartColors();
      }
    });
  }

  /**
   * Initialize the form controls for better UX.
   */
  initializeControls() {
    this.officeId.patchValue(1);
    this.timescale.patchValue('Day');
  }

  /**
   * Subscribes to value changes of officeID and timescale controls,
   * Fetches data accordingly and sets charts based on fetched data.
   */
  getChartData() {
    merge(this.officeId.valueChanges, this.timescale.valueChanges)
      .pipe(skip(1))
      .subscribe(() => {
        const officeId = this.officeId.value;
        const timescale = this.timescale.value;
        switch (timescale) {
          case 'Day':
            const clientsByDay = this.homeService.getClientTrendsByDay(officeId);
            const loansByDay = this.homeService.getLoanTrendsByDay(officeId);
            forkJoin([
              clientsByDay,
              loansByDay
            ]).subscribe((data: any[]) => {
              const dayLabels = this.getLabels(timescale);
              const clientCounts = this.getCounts(data[0], dayLabels, timescale, 'client');
              const loanCounts = this.getCounts(data[1], dayLabels, timescale, 'loan');
              this.setChart(dayLabels, clientCounts, loanCounts);
              this.hideOutput = false;
            });
            break;
          case 'Week':
            const clientsByWeek = this.homeService.getClientTrendsByWeek(officeId);
            const loansByWeek = this.homeService.getLoanTrendsByWeek(officeId);
            forkJoin([
              clientsByWeek,
              loansByWeek
            ]).subscribe((data: any[]) => {
              const weekLabels = this.getLabels(timescale);
              const clientCounts = this.getCounts(data[0], weekLabels, timescale, 'client');
              const loanCounts = this.getCounts(data[1], weekLabels, timescale, 'loan');
              this.setChart(weekLabels, clientCounts, loanCounts);
              this.hideOutput = false;
            });
            break;
          case 'Month':
            const clientsByMonth = this.homeService.getClientTrendsByMonth(officeId);
            const loansByMonth = this.homeService.getLoanTrendsByMonth(officeId);
            forkJoin([
              clientsByMonth,
              loansByMonth
            ]).subscribe((data: any[]) => {
              const monthLabels = this.getLabels(timescale);
              const clientCounts = this.getCounts(data[0], monthLabels, timescale, 'client');
              const loanCounts = this.getCounts(data[1], monthLabels, timescale, 'loan');
              this.setChart(monthLabels, clientCounts, loanCounts);
              this.hideOutput = false;
            });
            break;
        }
      });
  }

  /**
   * Gets Abscissa Labels.
   * @param {string} timescale User's timescale choice.
   */
  getLabels(timescale: string) {
    const date = new Date();
    const labelsArray = [];
    switch (timescale) {
      case 'Day':
        while (labelsArray.length < 12) {
          date.setDate(date.getDate() - 1);
          const transformedDate = this.dateUtils.formatDate(date, 'd/M');
          labelsArray.push(transformedDate);
        }
        break;
      case 'Week':
        /** 1st January of present year */
        const onejan = new Date(date.getFullYear(), 0, 1);
        while (labelsArray.length < 12) {
          date.setDate(date.getDate() - 7);
          /** Gets current week number */
          const weekNumber = Math.ceil(((date.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
          labelsArray.push(weekNumber);
        }
        break;
      case 'Month':
        while (labelsArray.length < 12) {
          const transformedDate = this.dateUtils.formatDate(date, 'MMMM');
          labelsArray.push(transformedDate);
          date.setMonth(date.getMonth() - 1);
        }
        break;
    }
    return labelsArray.reverse();
  }

  /**
   * Get bar heights for clients/loans trends.
   * @param {any[]} response API response array.
   * @param {any[]} labels Abscissa Labels.
   * @param {string} timescale User's timescale choice.
   * @param {string} type 'client' or 'loan'.
   */
  getCounts(response: any[], labels: any[], timescale: string, type: string) {
    let counts: number[] = [];
    switch (timescale) {
      case 'Day':
        labels.forEach((label: any) => {
          const day = response.find((entry: any) => {
            const transformedDate = this.dateUtils.formatDate(entry.days, 'd/M');
            return transformedDate === label;
          });
          counts = this.updateCount(day, counts, type);
        });
        break;
      case 'Week':
        labels.forEach((label: any) => {
          const week = response.find((entry: any) => {
            return entry.Weeks === label;
          });
          counts = this.updateCount(week, counts, type);
        });
        break;
      case 'Month':
        labels.forEach((label: any) => {
          const month = response.find((entry: any) => {
            return entry.Months === label;
          });
          counts = this.updateCount(month, counts, type);
        });
        break;
    }
    return counts;
  }

  /**
   * Updates the counts array.
   * @param {any} span Time span.
   * @param {any[]} counts Counts.
   * @param {string} type 'client' or 'loan'
   */
  updateCount(span: any, counts: any[], type: string) {
    if (span) {
      switch (type) {
        case 'client':
          counts.push(span.count);
          break;
        case 'loan':
          counts.push(span.lcount);
          break;
      }
    } else {
      counts.push(0);
    }
    return counts;
  }

  /**
   * Creates an instance of Chart.js multi-bar chart.
   * Refer: https://www.chartjs.org/docs/latest/charts/bar.html for configuration details.
   * @param {any[]} labels Abscissa Labels.
   * @param {number[]} clientCounts Clients Ordinate.
   * @param {number[]} loanCounts Loans Ordinate.
   */
  setChart(labels: any[], clientCounts: number[], loanCounts: number[]) {
    const legendColor = this.getLegendColor();

    if (!this.chart) {
      this.chart = new Chart('client-trends-bar', {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'New Clients',
              data: clientCounts,
              backgroundColor: 'dodgerblue',
              borderColor: 'dodgerblue',
              borderWidth: 2,
              fill: false
            },
            {
              label: 'Loans Disbursed',
              data: loanCounts,
              backgroundColor: 'red',
              borderColor: 'red',
              borderWidth: 2,
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              labels: {
                color: legendColor
              }
            }
          },
          scales: {
            y: {
              min: 0,
              title: {
                display: true,
                text: 'Values',
                color: '#1074B9'
              }
            }
          }
        }
      });
    } else {
      this.chart.data.labels = labels;
      this.chart.data.datasets[0].data = clientCounts;
      this.chart.data.datasets[1].data = loanCounts;
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
