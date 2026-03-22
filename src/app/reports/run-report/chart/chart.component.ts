/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, OnChanges, OnInit, OnDestroy, Input, inject } from '@angular/core';

/** Custom Services */
import { ReportsService } from '../../reports.service';
import { ThemeStorageService } from 'app/shared/theme-picker/theme-storage.service';

/** Custom Models */
import { ChartData } from '../../common-models/chart-data.model';

/** Charting Imports */
import { Chart, registerables } from 'chart.js';
import { MatButtonToggleGroup, MatButtonToggle } from '@angular/material/button-toggle';
import { NgStyle } from '@angular/common';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

// Register Chart.js components
Chart.register(...registerables);

/**
 * Chart Component
 */
@Component({
  selector: 'mifosx-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatButtonToggleGroup,
    MatButtonToggle,
    NgStyle
  ]
})
export class ChartComponent implements OnChanges, OnInit, OnDestroy {
  private reportsService = inject(ReportsService);
  private themeStorageService = inject(ThemeStorageService);
  private resizeTimeoutId: ReturnType<typeof setTimeout> | undefined;
  private initialRenderTimeoutId: ReturnType<typeof setTimeout> | undefined;

  /** Run Report Data */
  @Input() dataObject: any;

  /** chart data object */
  chart: any;
  /** substitute for resolver */
  hideOutput = true;
  /** Data object for witching charts in view. */
  inputData: ChartData;
  /** Tracks the currently selected chart type */
  selectedChartType: string = 'Pie';
  /** Resize listener */
  private readonly resizeListener = () => this.resizeChart();

  /**
   * Initialize component and add resize listener.
   */
  ngOnInit() {
    window.addEventListener('resize', this.resizeListener);
  }

  /**
   * Clean up on component destroy.
   */
  ngOnDestroy() {
    window.removeEventListener('resize', this.resizeListener);
    if (this.resizeTimeoutId !== undefined) {
      clearTimeout(this.resizeTimeoutId);
      this.resizeTimeoutId = undefined;
    }
    if (this.initialRenderTimeoutId !== undefined) {
      clearTimeout(this.initialRenderTimeoutId);
      this.initialRenderTimeoutId = undefined;
    }
    if (this.chart) {
      this.chart.destroy();
      this.chart = undefined;
    }
  }

  /**
   * Resize and redraw chart when window size changes.
   */
  resizeChart() {
    if (this.chart) {
      if (this.resizeTimeoutId !== undefined) {
        clearTimeout(this.resizeTimeoutId);
      }
      // Debounce resize calls to avoid queuing multiple chart operations.
      this.resizeTimeoutId = setTimeout(() => {
        this.chart?.resize();
        this.resizeTimeoutId = undefined;
      }, 100);
    }
  }

  /**
   * Fetches run report data post changes in run report form.
   */
  ngOnChanges() {
    this.getRunReportData();
  }

  getRunReportData() {
    this.reportsService
      .getChartRunReportData(this.dataObject.report.name, this.dataObject.formData)
      .subscribe((response: ChartData) => {
        this.inputData = response;
        this.selectedChartType = 'Pie';
        this.hideOutput = false;
        if (this.initialRenderTimeoutId !== undefined) {
          clearTimeout(this.initialRenderTimeoutId);
        }
        this.initialRenderTimeoutId = setTimeout(() => {
          this.setPieChart(response);
          this.initialRenderTimeoutId = undefined;
        });
      });
  }

  /**
   * Handles chart type selection and renders the selected chart.
   * @param {string} chartType The type of chart to display
   */
  selectChart(chartType: string) {
    if (!this.inputData) {
      return;
    }
    const chartColors = this.randomColorArray(this.inputData.values.length);
    this.selectedChartType = chartType;
    switch (chartType) {
      case 'Bar':
        this.setBarChart(this.inputData, chartColors);
        break;
      case 'Pie':
        this.setPieChart(this.inputData, chartColors);
        break;
      case 'Polar':
        this.setPolarAreaChart(this.inputData, chartColors);
        break;
    }
  }

  /**
   * Refreshes colors when user clicks the currently selected toggle.
   */
  refreshChartIfSameType(chartType: string) {
    if (chartType === this.selectedChartType) {
      this.selectChart(chartType);
    }
  }

  /**
   * Creates instance of chart.js pie chart.
   * Refer: https://www.chartjs.org/docs/latest/charts/doughnut.html for configuration details.
   */
  setPieChart(inputData: ChartData, chartColors?: string[]) {
    if (this.chart) {
      this.chart.destroy();
    }
    const colors = chartColors ?? this.randomColorArray(inputData.values.length);
    this.chart = new Chart('output', {
      type: 'pie',
      data: {
        labels: inputData.keys,
        datasets: [
          {
            label: inputData.valuesLabel,
            data: inputData.values,
            backgroundColor: colors
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: inputData.keysLabel
          }
        }
      }
    });
  }

  /**
   * Creates instance of chart.js bar chart.
   * Refer: https://www.chartjs.org/docs/latest/charts/bar.html for configuration details.
   */
  setBarChart(inputData: ChartData, chartColors?: string[]) {
    if (this.chart) {
      this.chart.destroy();
    }
    const colors = chartColors ?? this.randomColorArray(inputData.values.length);
    this.chart = new Chart('output', {
      type: 'bar',
      data: {
        labels: inputData.keys,
        datasets: [
          {
            label: inputData.valuesLabel,
            data: inputData.values,
            backgroundColor: colors
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: inputData.keysLabel
            }
          },
          y: {
            min: 0
          }
        }
      }
    });
  }

  /**
   * Creates instance of chart.js polar area chart.
   * Refer: https://www.chartjs.org/docs/latest/charts/polar.html for configuration details.
   */
  setPolarAreaChart(inputData: ChartData, chartColors?: string[]) {
    if (this.chart) {
      this.chart.destroy();
    }
    const colors = chartColors ?? this.randomColorArray(inputData.values.length);
    this.chart = new Chart('output', {
      type: 'polarArea',
      data: {
        labels: inputData.keys,
        datasets: [
          {
            label: inputData.valuesLabel,
            data: inputData.values,
            backgroundColor: colors,
            borderColor: colors
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: inputData.keysLabel
          },
          legend: { display: true }
        },
        scales: {
          r: {
            min: 0
          }
        }
      }
    });
  }

  /**
   * Generates bar/pie-slice colors array for dynamic charts.
   * @param {number} length Length of dataset array.
   */
  randomColorArray(length: number) {
    const colorArray: string[] = [];
    while (length--) {
      const color = this.randomColor();
      colorArray.push(color);
    }
    return colorArray;
  }

  /**
   * Returns a semi-random color based on the active theme palette.
   */
  randomColor() {
    const baseColors = this.getThemeBaseColors();
    const baseColor = baseColors[Math.floor(Math.random() * baseColors.length)];
    const variation = Math.floor(Math.random() * 61) - 30;
    const [
      r,
      g,
      b
    ] = this.hexToRgb(baseColor).map((channel) => this.clamp(channel + variation));
    return `rgba(${r},${g},${b},0.6)`;
  }

  /**
   * Derives chart base colors from the user's selected theme and current dark mode.
   */
  private getThemeBaseColors(): string[] {
    const savedTheme = this.themeStorageService.getTheme();
    const primary = savedTheme?.primary || '#1074B9';
    const accent = savedTheme?.accent || '#B4D575';
    const isDark = document.body.classList.contains('dark-theme');

    if (isDark) {
      return [
        primary,
        accent,
        '#5BA2EC',
        '#83A447',
        '#C4C6D0'
      ];
    }

    return [
      primary,
      accent,
      '#004989',
      '#E7FFA5',
      '#6E8A3B'
    ];
  }

  private hexToRgb(hexColor: string): number[] {
    const hex = hexColor.replace('#', '');
    const normalized =
      hex.length === 3
        ? hex
            .split('')
            .map((char) => char + char)
            .join('')
        : hex;
    const numeric = parseInt(normalized, 16);
    return [
      (numeric >> 16) & 255,
      (numeric >> 8) & 255,
      numeric & 255
    ];
  }

  private clamp(value: number): number {
    return Math.max(0, Math.min(255, value));
  }
}
